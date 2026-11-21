import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onSelectTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginProps> = ({ onSelectTab }) => {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState('citizen@nexus.gov.in');
  const [password, setPassword] = useState('nexus2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSelectTab('landing');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid login credentials. Please use sample credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    await switchRole(role);
    if (role === 'admin') onSelectTab('admin');
    else if (role === 'volunteer') onSelectTab('volunteer');
    else onSelectTab('citizen-dash');
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-0">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">NEXUS Portal Login</h2>
          <p className="text-xs text-slate-400">
            Citizen, Volunteer & Municipal Officer Access
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Credentials Box for Judges */}
        <div className="pt-4 border-t border-slate-800 space-y-2.5">
          <p className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>1-Click Hackathon Demo Access:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('citizen')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left"
            >
              <p className="text-[11px] font-bold text-cyan-300">Citizen</p>
              <p className="text-[9px] text-slate-400">Reporting feed</p>
            </button>
            <button
              onClick={() => handleQuickLogin('volunteer')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left"
            >
              <p className="text-[11px] font-bold text-emerald-300">Volunteer</p>
              <p className="text-[9px] text-slate-400">Field response</p>
            </button>
            <button
              onClick={() => handleQuickLogin('admin')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-left"
            >
              <p className="text-[11px] font-bold text-purple-300">Admin</p>
              <p className="text-[9px] text-slate-400">Command centre</p>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            onClick={() => onSelectTab('register')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Register as Citizen
          </button>
        </div>
      </div>
    </div>
  );
};
