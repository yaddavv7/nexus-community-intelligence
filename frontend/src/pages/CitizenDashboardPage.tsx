import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Incident } from '../types';
import { IncidentCard } from '../components/IncidentCard';
import {
  FilePlus,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Flame,
  ArrowRight
} from 'lucide-react';

interface CitizenDashProps {
  onSelectTab: (tab: string) => void;
  onViewIncident: (id: number) => void;
}

export const CitizenDashboardPage: React.FC<CitizenDashProps> = ({
  onSelectTab,
  onViewIncident,
}) => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Fetch citizen dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (err) {
      console.error('Confirm error:', err);
    }
  };

  const nearbyIncidents = incidents.slice(0, 6);
  const myReportsCount = incidents.filter(
    (i) => i.reporter_id === user?.id || i.reporter_name === user?.full_name
  ).length;

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-nexus-900 via-blue-950/40 to-nexus-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-xs font-mono font-bold text-cyan-400">
            Citizen Community Portal • {user?.locality || 'Kakkanad SmartCity Zone'}
          </span>
          <h2 className="text-2xl font-black text-white">
            Welcome back, {user?.full_name.split(' ')[0] || 'Resident'}!
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Stay informed on nearby road hazards, canal overflow advisories, and municipal progress in your local ward.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('report')}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-glow-cyan"
          >
            <FilePlus className="w-4 h-4" />
            <span>Submit Problem Report</span>
          </button>
          <button
            onClick={() => onSelectTab('voice')}
            className="px-4 py-2.5 rounded-xl bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-medium"
          >
            NEXUS Voice
          </button>
        </div>
      </div>

      {/* Citizen Impact Tracker Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">My Reports Logged</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{myReportsCount || 3}</p>
          <span className="text-[10px] text-slate-500">Track status live</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ward Active Incidents</span>
          <p className="text-2xl font-black text-slate-100 mt-1">
            {incidents.filter((i) => i.status !== 'resolved').length}
          </p>
          <span className="text-[10px] text-cyan-400">Kerala sector</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Community Confirmations</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {incidents.reduce((acc, curr) => acc + (curr.confirmations_count || 0), 0)}
          </p>
          <span className="text-[10px] text-slate-500">Citizen upvotes</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400">Response Speedup</span>
          <p className="text-2xl font-black text-purple-400 mt-1">42%</p>
          <span className="text-[10px] text-purple-300">With AI triage</span>
        </div>
      </div>

      {/* Nearby Active Problems Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Nearby Community Problems & Hazards</span>
            </h3>
            <p className="text-xs text-slate-400">
              Confirm whether problems are still present to help municipal crews prioritize repairs
            </p>
          </div>

          <button
            onClick={() => onSelectTab('map')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
          >
            <span>View All on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onSelect={() => onViewIncident(incident.id)}
              onConfirm={handleConfirm}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
