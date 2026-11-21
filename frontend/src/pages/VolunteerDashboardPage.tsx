import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Incident } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Camera,
  ExternalLink,
  AlertTriangle,
  Upload,
  ArrowRight
} from 'lucide-react';

interface VolunteerProps {
  onViewIncident: (id: number) => void;
}

const SAMPLE_COMPLETION_PHOTOS = [
  {
    name: 'Canal Cleared',
    url: 'https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Asphalt Paved',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sanitation Completed',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
];

export const VolunteerDashboardPage: React.FC<VolunteerProps> = ({ onViewIncident }) => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState(SAMPLE_COMPLETION_PHOTOS[0].url);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAssigned = async () => {
    try {
      const data = await api.getIncidents();
      // Filter for active field assignments or recent
      const assigned = data.filter((i) => i.status === 'assigned' || i.status === 'in_progress');
      setIncidents(assigned);
      if (assigned.length > 0 && !selectedIncident) {
        setSelectedIncident(assigned[0]);
      }
    } catch (err) {
      console.error('Fetch volunteer tasks error:', err);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleResolveTask = async (targetStatus: 'in_progress' | 'resolved') => {
    if (!selectedIncident) return;
    setUpdating(true);
    setSuccessMsg(null);
    try {
      await api.updateIncidentStatus(
        selectedIncident.id,
        {
          status: targetStatus,
          notes: inspectionNotes || `Field team inspection completed by ${user?.full_name}. Verified remediated.`,
          photo_url: targetStatus === 'resolved' ? completionPhoto : undefined,
        },
        user?.full_name || 'Field Response Volunteer',
        'volunteer'
      );
      setSuccessMsg(`Incident ${selectedIncident.reference_no} updated to ${targetStatus.toUpperCase()}!`);
      setInspectionNotes('');
      fetchAssigned();
    } catch (err) {
      console.error('Resolve task error:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Field Response & Remediation Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">VOLUNTEER ACTION DASHBOARD</h1>
          <p className="text-xs text-slate-400 mt-1">
            Assigned municipal sector: {user?.locality || 'Aluva & Kalamassery Sector'}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-nexus-900 border border-slate-800 text-xs text-slate-300">
          <span className="text-slate-500">Active Field Assignments: </span>
          <span className="font-bold text-cyan-400 font-mono text-sm">{incidents.length} Tasks</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Task Roster & Remediation Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Assigned Tasks List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Pending Dispatch Tasks ({incidents.length})
          </h3>

          <div className="space-y-2">
            {incidents.length === 0 ? (
              <div className="glass-panel p-6 rounded-xl text-center text-xs text-slate-500">
                All assigned sector incidents currently remediated!
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-nexus-850 border-cyan-500 shadow-glow-cyan'
                        : 'glass-panel hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-mono font-bold text-cyan-400">{inc.reference_no}</span>
                      <PriorityBadge score={inc.priority_score} urgency={inc.urgency} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-2">{inc.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="truncate max-w-[130px]">{inc.locality_name}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Task Remediation Workspace */}
        <div className="md:col-span-2 space-y-4">
          {selectedIncident ? (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {selectedIncident.reference_no}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{selectedIncident.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedIncident.locality_name}</span>
                    <span>•</span>
                    <span>{selectedIncident.landmark || 'Ward sector'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onViewIncident(selectedIncident.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1 shrink-0"
                >
                  <span>Full Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Citizen Photo & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedIncident.photo_url && (
                  <div className="h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={selectedIncident.photo_url}
                      alt="Incident site"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="sm:col-span-2 text-xs text-slate-300 leading-relaxed bg-nexus-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Citizen Complaint Statement:
                  </span>
                  {selectedIncident.description}
                </div>
              </div>

              {/* Remediation Notes & Photo Upload */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-200">
                  Field Inspection Notes & Actions Taken:
                </label>
                <textarea
                  rows={3}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="E.g., Municipal crew cleared 15m culvert with excavator. Silt debris removed and flow restored..."
                  className="w-full bg-nexus-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />

                {/* Completion Photo Selection for Demo */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Attach Remediation Completion Photograph:</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {SAMPLE_COMPLETION_PHOTOS.map((cp) => (
                      <button
                        key={cp.name}
                        type="button"
                        onClick={() => setCompletionPhoto(cp.url)}
                        className={`p-2 rounded-lg border text-[11px] truncate text-center transition-all ${
                          completionPhoto === cp.url
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-nexus-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {cp.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                  <button
                    onClick={() => handleResolveTask('in_progress')}
                    disabled={updating}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Mark Work Underway
                  </button>

                  <button
                    onClick={() => handleResolveTask('resolved')}
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Upload Proof & Mark Resolved</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-xs text-slate-500">
              Select an incident from the dispatch list on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
