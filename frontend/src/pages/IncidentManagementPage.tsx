import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Incident, DuplicateSuggestion } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  Layers,
  Search,
  Filter,
  Download,
  ExternalLink,
  GitMerge,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface IncMgmtProps {
  onViewIncident: (id: number) => void;
}

export const IncidentManagementPage: React.FC<IncMgmtProps> = ({ onViewIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateSuggestion[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'duplicates'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incData, dupData] = await Promise.all([
        api.getIncidents(),
        api.getDuplicates(),
      ]);
      setIncidents(incData);
      setDuplicates(dupData);
    } catch (err) {
      console.error('Fetch incident management error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMerge = async (dup: DuplicateSuggestion) => {
    try {
      await api.resolveDuplicate({
        primary_incident_id: dup.primary_incident.id,
        duplicate_incident_id: dup.duplicate_incident.id,
        action: 'merge',
      });
      setActionNotice(`Merged ${dup.duplicate_incident.reference_no} into ${dup.primary_incident.reference_no}!`);
      fetchData();
    } catch (err) {
      console.error('Merge error:', err);
    }
  };

  const handleExportCSV = () => {
    if (!incidents.length) return;
    const headers = ['Reference', 'Title', 'Category', 'Locality', 'Severity', 'Priority', 'Status', 'Date'];
    const rows = incidents.map((i) => [
      i.reference_no,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      `"${i.locality_name}"`,
      i.severity,
      i.priority_score,
      i.status,
      i.created_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEXUS_Master_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = incidents.filter((i) => {
    const matchCat = categoryFilter === 'All' || i.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.locality_name.toLowerCase().includes(search.toLowerCase()) ||
      i.reference_no.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            <span>Master Incident Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative municipal registry, duplicate cluster resolution, and bulk dispatch controls
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Registry CSV</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs: All Incidents vs Duplicate Clusters */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'all'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Incidents ({incidents.length})
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'duplicates'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>Pending Duplicate Clusters ({duplicates.length})</span>
        </button>
      </div>

      {activeTab === 'duplicates' ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            NEXUS AI identified candidate duplicates based on &lt; 400m Haversine proximity and description similarity.
            Merging tickets consolidates citizen confirmations into the primary incident.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {duplicates.length === 0 ? (
              <div className="glass-panel p-12 rounded-xl text-center text-xs text-slate-500">
                No unresolved duplicate clusters currently detected.
              </div>
            ) : (
              duplicates.map((dup) => (
                <div
                  key={dup.id}
                  className="glass-panel p-4 rounded-xl border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center space-x-2 font-mono font-bold text-amber-300">
                      <span className="text-cyan-400">Primary: {dup.primary_incident.reference_no}</span>
                      <span>↔</span>
                      <span className="text-amber-400">Candidate: {dup.duplicate_incident.reference_no}</span>
                    </div>
                    <p className="text-slate-200 font-semibold">{dup.primary_incident.title}</p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">{dup.reason}</p>
                    <div className="flex items-center space-x-3 text-[10px] text-slate-500 pt-1">
                      <span>Proximity: {dup.distance_meters} meters</span>
                      <span>•</span>
                      <span>Similarity: {Math.round(dup.similarity_score * 100)}%</span>
                      <span>•</span>
                      <span>Location: {dup.primary_incident.locality_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onViewIncident(dup.primary_incident.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
                    >
                      Compare
                    </button>
                    <button
                      onClick={() => handleMerge(dup)}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Approve Merge</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, ward, title..."
                className="w-full bg-nexus-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-nexus-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Road damage and potholes">Roads & Potholes</option>
                <option value="Drainage and waterlogging">Drainage & Floods</option>
                <option value="Garbage and waste management">Garbage & Sanitation</option>
                <option value="Water supply problems">Water Supply (KWA)</option>
                <option value="Electricity and street lighting">Electricity & Lights</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-nexus-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-nexus-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Locality</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((inc) => (
                  <tr key={inc.id} className="hover:bg-nexus-850/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {inc.reference_no}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200 max-w-xs truncate">
                      {inc.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{inc.locality_name}</td>
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{inc.category}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <PriorityBadge score={inc.priority_score} urgency={inc.urgency} />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {inc.assigned_department ? inc.assigned_department.slice(0, 18) + '...' : 'Triage'}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onViewIncident(inc.id)}
                        className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-medium text-[11px] border border-cyan-500/30"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
