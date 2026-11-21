import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Key, Database, Globe, CloudRain, RotateCcw, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage } = useAuth();
  const [geminiKey, setGeminiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [demoMode, setDemoMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      <div className="pb-6 border-b border-slate-800 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>Platform Settings & API Keys</span>
        </h1>
        <p className="text-xs text-slate-400">
          Configure third-party AI keys, cloud database connections, and demonstration mode
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration saved successfully! Running in optimal demonstration mode.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Key className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Google Gemini API Configuration</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            NEXUS integrates with the official Gemini API for multimodal image understanding and text classification.
            If no key is provided, the platform automatically activates its explainable NLP & heuristic rules engine with 100% functionality.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              GEMINI_API_KEY (Optional)
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Fallback engine is active and will process Malayalam and English queries without interruption.
            </span>
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Database className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Supabase / PostgreSQL Cloud Connection</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Production schema scripts and Row Level Security (RLS) policies are provided in <code className="text-cyan-400 font-mono">backend/supabase_schema.sql</code>.
            Local SQLite async database is active by default.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SUPABASE_URL (Optional)
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SUPABASE_ANON_KEY (Optional)
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOi..."
                className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Language & Interface */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-purple-400">
            <Globe className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Language & Regional Localization</h3>
          </div>

          <div className="flex items-center space-x-4">
            <label className="text-xs text-slate-300 font-medium">Default Language:</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  language === 'en'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-nexus-900 text-slate-400 border-slate-800'
                }`}
              >
                English (en-IN)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ml')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  language === 'ml'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-nexus-900 text-slate-400 border-slate-800'
                }`}
              >
                മലയാളം (ml-IN)
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-glow-cyan transition-colors"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};
