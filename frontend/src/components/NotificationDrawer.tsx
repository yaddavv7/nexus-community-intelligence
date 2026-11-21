import React, { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import { NotificationItem } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateDetail?: (id: number) => void;
}

export const NotificationDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  onNavigateDetail,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      api.markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }
    if (notif.incident_id && onNavigateDetail) {
      onNavigateDetail(notif.incident_id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-nexus-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-nexus-950">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Notification Centre</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No recent notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.is_read
                    ? 'bg-nexus-950/60 border-slate-800/80 text-slate-400'
                    : 'bg-nexus-850 border-cyan-500/30 text-slate-200 shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-100 leading-snug">{n.title}</p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  {n.incident_id && (
                    <span className="text-cyan-400 flex items-center space-x-0.5 font-medium">
                      <span>View Incident</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
