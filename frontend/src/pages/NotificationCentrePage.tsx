import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Clock, ExternalLink, Filter } from 'lucide-react';

interface NotifProps {
  onViewIncident: (id: number) => void;
}

export const NotificationCentrePage: React.FC<NotifProps> = ({ onViewIncident }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Fetch notifs error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.is_read : true));

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center space-x-2">
            <Bell className="w-6 h-6 text-cyan-400" />
            <span>Notification Centre</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time ticket updates, status changes, and priority alerts
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 rounded-lg bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-cyan-300 font-semibold flex items-center space-x-1.5"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All As Read</span>
        </button>
      </div>

      <div className="flex items-center space-x-2 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            filter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            filter === 'unread'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-xs text-slate-500">
            No notifications in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => n.incident_id && onViewIncident(n.incident_id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                n.is_read
                  ? 'glass-panel text-slate-400'
                  : 'bg-nexus-850 border-cyan-500/40 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center space-x-2">
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                  <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
                </div>
                <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.created_at).toLocaleString()}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>

              {n.incident_id && (
                <div className="flex justify-end pt-2 mt-2 border-t border-slate-800/60">
                  <span className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-semibold">
                    <span>View Ticket Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
