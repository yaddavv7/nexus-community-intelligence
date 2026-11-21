import React from 'react';
import { Incident } from '../types';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { MapPin, ThumbsUp, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CardProps {
  incident: Incident;
  onSelect: (incident: Incident) => void;
  onConfirm?: (id: number) => void;
}

export const IncidentCard: React.FC<CardProps> = ({ incident, onSelect, onConfirm }) => {
  return (
    <div
      onClick={() => onSelect(incident)}
      className="glass-panel glass-panel-hover rounded-xl p-4 cursor-pointer flex flex-col justify-between space-y-3 transition-all relative overflow-hidden group"
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono text-cyan-400 font-bold tracking-wider">
          {incident.reference_no}
        </span>
        <div className="flex items-center space-x-1.5">
          <PriorityBadge score={incident.priority_score} urgency={incident.urgency} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* Main info with optional thumbnail */}
      <div className="flex items-start space-x-3">
        {incident.photo_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
            <img
              src={incident.photo_url}
              alt={incident.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
            {incident.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
            {incident.description}
          </p>
        </div>
      </div>

      {/* Category and Department */}
      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
        <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 truncate max-w-[180px]">
          {incident.category}
        </span>
        {incident.assigned_department && (
          <span className="truncate text-slate-400 hidden sm:inline">
            → {incident.assigned_department}
          </span>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 truncate max-w-[140px]">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{incident.locality_name}</span>
          </span>
          <span className="flex items-center space-x-1 hidden sm:flex">
            <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
            <span>{new Date(incident.created_at).toLocaleDateString()}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onConfirm && incident.status !== 'resolved' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfirm(incident.id);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs flex items-center space-x-1 border border-slate-700 transition-colors"
              title="Confirm problem is still present"
            >
              <ThumbsUp className="w-3 h-3 text-cyan-400" />
              <span>{incident.confirmations_count}</span>
            </button>
          )}

          {incident.ai_confidence && (
            <span
              className="hidden md:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-400"
              title="AI Confidence Score"
            >
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>{Math.round(incident.ai_confidence * 100)}%</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
