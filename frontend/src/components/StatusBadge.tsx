import React from 'react';
import { IncidentStatus, UrgencyLevel } from '../types';

export const StatusBadge: React.FC<{ status: IncidentStatus | string }> = ({ status }) => {
  const normalized = status.toLowerCase();

  const styles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    submitted: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Submitted' },
    under_review: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Under Review' },
    verified: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30', label: 'Verified' },
    assigned: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Assigned' },
    in_progress: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'In Progress' },
    resolved: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Resolved' },
    closed: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Closed' },
    rejected: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Rejected' },
    duplicate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Duplicate' },
  };

  const style = styles[normalized] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {style.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ score?: number; urgency?: UrgencyLevel | string }> = ({
  score,
  urgency,
}) => {
  let label = urgency ? urgency.toUpperCase() : 'MEDIUM';
  let color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';

  if (score !== undefined) {
    if (score >= 80) {
      label = `CRITICAL (${score})`;
      color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (score >= 65) {
      label = `HIGH (${score})`;
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (score >= 45) {
      label = `MEDIUM (${score})`;
      color = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    } else {
      label = `LOW (${score})`;
      color = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  } else if (urgency) {
    if (urgency.toLowerCase() === 'critical') {
      color = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    } else if (urgency.toLowerCase() === 'high') {
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    } else if (urgency.toLowerCase() === 'low') {
      color = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium border ${color}`}
    >
      {label}
    </span>
  );
};
