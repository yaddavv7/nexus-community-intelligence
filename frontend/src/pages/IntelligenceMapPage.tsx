import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Incident } from '../types';
import { MapComponent } from '../components/MapComponent';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  Search,
  Filter,
  Layers,
  MapPin,
  ExternalLink,
  ThumbsUp,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Flame
} from 'lucide-react';

interface MapPageProps {
  onViewIncident: (id: number) => void;
}

const CATEGORIES = [
  'All',
  'Road damage and potholes',
  'Drainage and waterlogging',
  'Garbage and waste management',
  'Water supply problems',
  'Public infrastructure damage',
  'Electricity and street lighting',
  'Environmental pollution',
  'Public safety concerns',
  'Other community issues',
];

export const IntelligenceMapPage: React.FC<MapPageProps> = ({ onViewIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('unresolved'); // 'all', 'unresolved', 'resolved'
  const [showDensityCircles, setShowDensityCircles] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
      });
      setIncidents(data);
      if (data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error('Fetch map incidents error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchIncidents();
  };

  const handleConfirm = async (id: number) => {
    try {
      const res = await api.confirmIncident(id, { still_present: true });
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                confirmations_count: res.confirmations_count,
                priority_score: res.priority_score,
              }
            : i
        )
      );
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident((prev) =>
          prev
            ? {
                ...prev,
                confirmations_count: res.confirmations_count,
                priority_score: res.priority_score,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Confirm error:', err);
    }
  };

  // Filter based on resolved/unresolved toggle
  const filteredIncidents = incidents.filter((i) => {
    if (statusFilter === 'unresolved') return i.status !== 'resolved' && i.status !== 'closed';
    if (statusFilter === 'resolved') return i.status === 'resolved' || i.status === 'closed';
    return true;
  });

  // Sidebar statistics
  const totalReports = incidents.length;
  const highPriorityCount = incidents.filter(
    (i) => i.priority_score >= 65 && i.status !== 'resolved'
  ).length;
  const unresolvedCount = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  ).length;
  const resolvedCount = incidents.filter(
    (i) => i.status === 'resolved' || i.status === 'closed'
  ).length;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-nexus-950">
      {/* Sidebar Controls and Stats */}
      <div className="w-full md:w-80 lg:w-96 bg-nexus-900 border-r border-slate-800 flex flex-col h-auto md:h-full z-20 shrink-0">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search locality, street, keyword..."
              className="w-full bg-nexus-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-nexus-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status and Density Toggles */}
          <div className="flex items-center justify-between gap-1 text-[11px] pt-1">
            <div className="flex rounded-lg bg-nexus-950 p-0.5 border border-slate-800">
              <button
                onClick={() => setStatusFilter('unresolved')}
                className={`px-2 py-1 rounded-md transition-all ${
                  statusFilter === 'unresolved' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Active ({unresolvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('resolved')}
                className={`px-2 py-1 rounded-md transition-all ${
                  statusFilter === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Resolved ({resolvedCount})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded-md transition-all ${
                  statusFilter === 'all' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}
              >
                All
              </button>
            </div>

            <button
              onClick={() => setShowDensityCircles(!showDensityCircles)}
              className={`px-2 py-1 rounded-lg border flex items-center space-x-1 ${
                showDensityCircles
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-nexus-950 text-slate-500 border-slate-800'
              }`}
              title="Toggle regional hazard density zones"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              <span>Density</span>
            </button>
          </div>
        </div>

        {/* Aggregate Metrics Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-nexus-950/60 border-b border-slate-800/80 text-center">
          <div className="p-1.5 rounded bg-nexus-900 border border-slate-800">
            <p className="text-sm font-black text-slate-100">{totalReports}</p>
            <p className="text-[10px] text-slate-400">Total Reports</p>
          </div>
          <div className="p-1.5 rounded bg-nexus-900 border border-slate-800">
            <p className="text-sm font-black text-rose-400">{highPriorityCount}</p>
            <p className="text-[10px] text-slate-400">High / Critical</p>
          </div>
          <div className="p-1.5 rounded bg-nexus-900 border border-slate-800">
            <p className="text-sm font-black text-emerald-400">{resolvedCount}</p>
            <p className="text-[10px] text-slate-400">Resolved</p>
          </div>
        </div>

        {/* Incident List in Sidebar */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading map incidents...</div>
          ) : filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No matching incidents found.</div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-nexus-850 border-cyan-500/50 shadow-glow-cyan'
                      : 'bg-nexus-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">
                      {inc.reference_no}
                    </span>
                    <PriorityBadge score={inc.priority_score} urgency={inc.urgency} />
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{inc.title}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="truncate max-w-[140px]">{inc.locality_name}</span>
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map View & Selected Drawer */}
      <div className="flex-1 relative h-full">
        <MapComponent
          incidents={filteredIncidents}
          selectedIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          onNavigateDetail={onViewIncident}
          onConfirmIncident={handleConfirm}
          showHeatCircles={showDensityCircles}
          center={[10.04, 76.32]}
          zoom={12}
        />

        {/* Selected Incident Drawer on Bottom/Right */}
        {selectedIncident && (
          <div className="absolute bottom-6 right-6 z-30 w-full max-w-sm bg-nexus-900/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                {selectedIncident.reference_no}
              </span>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedIncident.photo_url && (
              <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-950 border border-slate-800">
                <img
                  src={selectedIncident.photo_url}
                  alt={selectedIncident.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug">
              {selectedIncident.title}
            </h4>

            <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
              {selectedIncident.description}
            </p>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 my-2.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{selectedIncident.locality_name}</span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <StatusBadge status={selectedIncident.status} />
                <PriorityBadge score={selectedIncident.priority_score} urgency={selectedIncident.urgency} />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleConfirm(selectedIncident.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1"
                  title="Confirm problem is still present"
                >
                  <ThumbsUp className="w-3 h-3 text-cyan-400" />
                  <span>{selectedIncident.confirmations_count}</span>
                </button>

                <button
                  onClick={() => onViewIncident(selectedIncident.id)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
