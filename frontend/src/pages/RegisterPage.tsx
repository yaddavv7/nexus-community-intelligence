import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { UserPlus, Mail, Lock, User, MapPin, Phone, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onSelectTab: (tab: string) => void;
}

export const RegisterPage: React.FC<RegisterProps> = ({ onSelectTab }) => {
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState('Aluva Riverbank Ward');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register({
        full_name: fullName,
        email,
        password,
        locality,
        phone,
        role,
      });
      await login(email, password);
      onSelectTab('citizen-dash');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-0">
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Citizen Account</h2>
          <p className="text-xs text-slate-400">
            Join the NEXUS Kerala civic reporting & intelligence network
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Anjali Nair"
                required
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anjali@example.com"
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
                placeholder="••••••••"
                required
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Locality / Ward</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="Aluva Riverbank Ward">Aluva Riverbank Ward</option>
                <option value="Kalamassery Civic Zone">Kalamassery Civic Zone</option>
                <option value="Kakkanad SmartCity Zone">Kakkanad SmartCity Zone</option>
                <option value="Vyttila Mobility Hub">Vyttila Mobility Hub</option>
                <option value="Fort Kochi Heritage Ward">Fort Kochi Heritage Ward</option>
                <option value="Edappally Commercial Sector">Edappally Commercial Sector</option>
                <option value="Other Kerala Ward">Other Kerala Ward</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mobile (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98470 XXXXX"
                className="w-full bg-nexus-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <button
            onClick={() => onSelectTab('login')}
            className="text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
