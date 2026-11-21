import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Incident, IncidentUpdate, IncidentConfirmation, DuplicateSuggestion } from '../types';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ThumbsUp,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  GitMerge,
  Send,
  Camera,
  Share2
} from 'lucide-react';

interface DetailProps {
  incidentId: number;
  onBack: () => void;
  onNavigateDetail?: (id: number) => void;
}

export const IncidentDetailPage: React.FC<DetailProps> = ({
  incidentId,
  onBack,
  onNavigateDetail,
}) => {
  const { role, user } = useAuth();
  const [data, setData] = useState<{
    incident: Incident;
    updates: IncidentUpdate[];
    confirmations: IncidentConfirmation[];
    duplicate_suggestions: DuplicateSuggestion[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [confirmNote, setConfirmNote] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getIncidentDetail(incidentId);
      setData(res);
      setNewStatus(res.incident.status);
    } catch (err) {
      console.error('Fetch detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [incidentId]);

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await api.confirmIncident(incidentId, {
        notes: confirmNote || 'Resident confirmed problem is still active.',
        still_present: true,
      });
      setConfirmNote('');
      setActionSuccess('Community confirmation recorded! Priority recalculating.');
      fetchDetail();
    } catch (err) {
      console.error('Confirmation error:', err);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      await api.updateIncidentStatus(
        incidentId,
        {
          status: targetStatus,
          notes: statusUpdateNote || `Status changed to ${targetStatus} by ${user?.full_name}`,
          photo_url: targetStatus === 'resolved' ? data?.incident.photo_url : undefined,
        },
        user?.full_name,
        role
      );
      setStatusUpdateNote('');
      setActionSuccess(`Incident marked as ${targetStatus.toUpperCase()}!`);
      fetchDetail();
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleMergeDuplicate = async (dup: DuplicateSuggestion) => {
    try {
      await api.resolveDuplicate({
        primary_incident_id: dup.primary_incident.id,
        duplicate_incident_id: dup.duplicate_incident.id,
        action: 'merge',
      });
      setActionSuccess('Duplicate incident merged successfully!');
      fetchDetail();
    } catch (err) {
      console.error('Merge error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center text-xs text-slate-500">
        Loading incident dossier...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center space-y-3">
        <p className="text-sm text-rose-400">Incident record not found.</p>
        <button onClick={onBack} className="text-xs text-cyan-400 hover:underline">
          Return to previous view
        </button>
      </div>
    );
  }

  const { incident, updates, confirmations, duplicate_suggestions } = data;
  const pb = incident.priority_breakdown;

  return (
    <div className="max-w-5xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      {/* Back button and actions bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-lg">
            {incident.reference_no}
          </span>
          <StatusBadge status={incident.status} />
          <PriorityBadge score={incident.priority_score} urgency={incident.urgency} />
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Dossier Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h1 className="text-xl sm:text-2xl font-black text-white leading-snug">
          {incident.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-200">{incident.locality_name}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{new Date(incident.created_at).toLocaleString()}</span>
          </span>
          <span className="flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>{incident.is_anonymous ? 'Anonymous Resident' : incident.reporter_name}</span>
          </span>
          {incident.assigned_department && (
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              Dept: {incident.assigned_department}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
          {incident.description}
        </p>

        {incident.voice_transcript && (
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
            <span className="font-bold text-cyan-400">Recorded Audio Transcription:</span>
            <p className="italic mt-0.5">"{incident.voice_transcript}"</p>
          </div>
        )}
      </div>

      {/* Before / After Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reported Photo */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Citizen Photographic Evidence</span>
          </span>
          <div className="h-64 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
            {incident.photo_url ? (
              <img
                src={incident.photo_url}
                alt="Reported problem"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                No photograph attached
              </div>
            )}
          </div>
        </div>

        {/* Completion Photo */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Field Team Completion Photo</span>
          </span>
          <div className="h-64 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
            {incident.completion_photo_url ? (
              <img
                src={incident.completion_photo_url}
                alt="Resolved completion"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 p-4 text-center">
                <span>Remediation in progress or pending field upload.</span>
                {role !== 'citizen' && (
                  <span className="text-[10px] text-cyan-400 mt-1">
                    Field crews can upload completion photo when resolving.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column: Explainable Priority & AI Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transparent Priority Engine Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Explainable Priority Score Breakdown</span>
            </h3>
            <span className="text-base font-black text-cyan-400 font-mono">
              {incident.priority_score} / 100
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Transparent algorithmic triage combining 5 weighted factors to eliminate subjective bias:
          </p>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Severity Index (25%)</span>
                <span className="font-mono text-cyan-300">
                  {pb?.contributing_factors.severity_value || incident.severity * 20} pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${(incident.severity / 5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Urgency Level (25%)</span>
                <span className="font-mono text-cyan-300">
                  {pb?.contributing_factors.urgency_value || 50} pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${
                      incident.urgency === 'critical'
                        ? 100
                        : incident.urgency === 'high'
                        ? 75
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Community Confirmations (20%)</span>
                <span className="font-mono text-cyan-300">
                  {incident.confirmations_count} resident votes
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-500 rounded-full"
                  style={{ width: `${Math.min(100, incident.confirmations_count * 15)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Environmental Risk Amplifier (15%)</span>
                <span className="font-mono text-cyan-300">
                  {pb?.contributing_factors.environmental_hazard_value || 40} pts
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: `65%` }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
            {pb?.explanation ||
              `Calculated based on severity ${incident.severity}/5, ${incident.urgency} urgency, and ${incident.confirmations_count} citizen confirmations.`}
          </p>
        </div>

        {/* AI Recommendations & Department Routing */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AI Triage & Verification Checklist</span>
            </h3>
            {incident.ai_confidence && (
              <span className="text-xs font-mono text-emerald-400">
                Confidence: {Math.round(incident.ai_confidence * 100)}%
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-cyan-400">
                Departmental Routing:
              </span>
              <p className="text-slate-200 font-semibold">{incident.assigned_department}</p>
              <p className="text-[11px] text-slate-400">
                Target Assigned Team: {incident.assigned_to || 'Municipal Rapid Response Squad'}
              </p>
            </div>

            {incident.ai_recommendations?.supporting_observations && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300">Supporting Observations:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  {incident.ai_recommendations.supporting_observations.map(
                    (obs: string, idx: number) => (
                      <li key={idx}>{obs}</li>
                    )
                  )}
                </ul>
              </div>
            )}

            {incident.ai_recommendations?.verification_steps && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300">
                  Required Human Verification Steps:
                </span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  {incident.ai_recommendations.verification_steps.map((st: string, idx: number) => (
                    <li key={idx}>{st}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Suggestions Section */}
      {duplicate_suggestions.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400">
            <GitMerge className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-100">
              Potential Duplicate Incidents Detected ({duplicate_suggestions.length})
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            NEXUS AI recognized nearby complaints describing the same physical issue. Administrators can merge them into one consolidated incident.
          </p>

          <div className="space-y-2">
            {duplicate_suggestions.map((dup) => (
              <div
                key={dup.id}
                className="p-3 rounded-xl bg-nexus-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2 font-mono font-bold text-amber-300">
                    <span>{dup.primary_incident.reference_no}</span>
                    <span>↔</span>
                    <span>{dup.duplicate_incident.reference_no}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{dup.reason}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Haversine Proximity: {dup.distance_meters}m | Similarity Score:{' '}
                    {Math.round(dup.similarity_score * 100)}%
                  </p>
                </div>

                {role === 'admin' && dup.status === 'suggested' && (
                  <button
                    onClick={() => handleMergeDuplicate(dup)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shrink-0 flex items-center space-x-1"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Approve Merge</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Community Confirmation Section for Citizens */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <ThumbsUp className="w-4 h-4 text-cyan-400" />
          <span>Community Ground-Truth Confirmation ({confirmations.length} Confirmations)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Have you seen this issue recently? Confirm whether it is still present to update priority and prevent premature ticket closure.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={confirmNote}
            onChange={(e) => setConfirmNote(e.target.value)}
            placeholder="Optional comment: e.g. 'Still overflowing this morning after rain'..."
            className="flex-1 w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shrink-0"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Confirm Problem Still Present</span>
          </button>
        </div>

        {confirmations.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
            {confirmations.slice(-3).map((c) => (
              <div
                key={c.id}
                className="p-2 rounded-lg bg-nexus-950/60 text-[11px] text-slate-300 flex items-center justify-between"
              >
                <span>"{c.notes || 'Resident verified issue is active.'}"</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role-Based Incident Lifecycle Controls */}
      {role !== 'citizen' && (
        <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-3 bg-purple-950/10">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span>Incident Lifecycle Controls ({role.toUpperCase()} Action Panel)</span>
          </h3>
          <p className="text-xs text-slate-300">
            Authoritative human-in-the-loop workflow transitions:
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {role === 'admin' && (
              <>
                <button
                  onClick={() => handleStatusChange('verified')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Verify Incident
                </button>
                <button
                  onClick={() => handleStatusChange('assigned')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                >
                  Assign to Department
                </button>
                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Reject Report
                </button>
              </>
            )}

            {(role === 'volunteer' || role === 'admin') && (
              <>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  disabled={isUpdatingStatus}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Mark Resolved (Work Completed)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Complete Incident History Audit Trail */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Complete Lifecycle Audit Trail</span>
        </h3>

        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {updates.map((up) => (
            <div key={up.id} className="relative text-xs space-y-1">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-950" />
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200">{up.new_status.toUpperCase()}</span>
                <span className="text-[10px] text-slate-500">
                  {new Date(up.created_at).toLocaleString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {up.user_name} ({up.user_role})
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{up.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
