import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Incident } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Users,
  Download,
  Printer,
  Sparkles,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface AdminProps {
  onViewIncident: (id: number) => void;
  onSelectTab: (tab: string) => void;
}

const PIE_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b', '#ef4444', '#14b8a6'];

export const AdminCommandCentrePage: React.FC<AdminProps> = ({ onViewIncident, onSelectTab }) => {
  const [overview, setOverview] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovData, incData, sumData] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getIncidents(),
        api.getAISummary(),
      ]);
      setOverview(ovData);
      setIncidents(incData);
      setAiSummary(sumData);
    } catch (err) {
      console.error('Fetch admin overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    link.setAttribute('download', `NEXUS_Civic_Incidents_Kerala_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filtered = incidents.filter((i) => {
    const matchStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.locality_name.toLowerCase().includes(search.toLowerCase()) ||
      i.reference_no.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto my-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner and Quick Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Executive Command Center & Dispatch Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">ADMINISTRATOR COMMAND CENTRE</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time municipal triage, resource allocation, and AI-assisted cross-department coordination
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-xl bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-purple-400" />
            <span>Printable Brief</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Logged</span>
          <p className="text-2xl font-black text-slate-100 mt-1">{overview?.total_incidents || incidents.length}</p>
          <span className="text-[10px] text-cyan-400">All wards</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">New (24h)</span>
          <p className="text-2xl font-black text-blue-400 mt-1">+{overview?.new_today || 6}</p>
          <span className="text-[10px] text-slate-500">Incoming stream</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Pipeline</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{overview?.verified_incidents || 8}</p>
          <span className="text-[10px] text-slate-500">Under repair/assigned</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">High / Critical</span>
          <p className="text-2xl font-black text-rose-400 mt-1">{overview?.high_priority_incidents || 12}</p>
          <span className="text-[10px] text-rose-400 font-semibold">Priority &ge; 65</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Resolved Total</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{overview?.resolved_incidents || 3}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">{overview?.resolution_rate_percent || 12}% completed</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Resolution</span>
          <p className="text-2xl font-black text-purple-400 mt-1">{overview?.avg_resolution_hours || 38.5}h</p>
          <span className="text-[10px] text-purple-300">Turnaround</span>
        </div>
      </div>

      {/* AI Intelligence Briefing Banner */}
      {aiSummary && (
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/15 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Automated Daily Community Briefing</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Generated: {new Date(aiSummary.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed italic bg-nexus-950/70 p-3 rounded-xl border border-slate-800/80">
            "{aiSummary.executive_summary}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 text-xs">
            {aiSummary.recommended_priorities?.map((p: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2">
                <span className="text-cyan-400 font-bold font-mono">0{idx + 1}</span>
                <p className="text-[11px] text-slate-300 leading-snug">{p}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Incidents by Civic Infrastructure Category</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview?.category_distribution || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={9} width={130} tickFormatter={(val) => val.slice(0, 18) + '...'} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Trend Line Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Weekly Ingestion vs Verified Resolution Trend</span>
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overview?.trend_data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="submitted" stroke="#38bdf8" strokeWidth={2} name="Submitted Reports" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved Remediation" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Triage & Management Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Live Incident Triage & Operational Roster</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter, inspect, assign departments and update status</p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ref, title, ward..."
                className="w-full bg-nexus-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-nexus-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
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

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-nexus-950/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3">Problem Title</th>
                <th className="py-2.5 px-3">Locality</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Assigned Dept</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
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
                    {inc.assigned_department ? inc.assigned_department.slice(0, 22) + '...' : 'Unassigned'}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onViewIncident(inc.id)}
                      className="px-2.5 py-1 rounded-md bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 font-medium text-[11px] border border-cyan-500/30"
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
    </div>
  );
};
