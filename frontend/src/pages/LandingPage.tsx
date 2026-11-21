import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { TRANSLATIONS } from '../services/translations';
import {
  Sparkles,
  MapPin,
  FilePlus,
  ShieldAlert,
  Cpu,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  Users
} from 'lucide-react';

interface LandingProps {
  onSelectTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onSelectTab }) => {
  const { language } = useAuth();
  const { openDemoModal } = useDemo();
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Glow background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-500/10 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>Kerala Civic Intelligence Demonstration Sector</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Community.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              One Intelligence Network.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Transform disconnected civic reports into actionable municipal intelligence. Detect recurring problems,
            identify emerging flood and infrastructure hazards, and prioritize rapid resolution with explainable AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => onSelectTab('map')}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-glow-cyan flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              <span>{t.exploreMap}</span>
            </button>

            <button
              onClick={() => onSelectTab('report')}
              className="px-6 py-3 rounded-xl bg-nexus-900 hover:bg-nexus-850 border border-slate-700 hover:border-cyan-500/40 text-slate-200 font-semibold text-sm flex items-center space-x-2 transition-all"
            >
              <FilePlus className="w-4 h-4 text-cyan-400" />
              <span>{t.reportProblem}</span>
            </button>

            <button
              onClick={openDemoModal}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/50 hover:to-blue-600/50 border border-purple-500/40 text-purple-200 font-semibold text-sm flex items-center space-x-2 shadow-glow-violet transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>{t.liveDemo}</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-12 max-w-4xl mx-auto text-left">
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-2xl font-black text-cyan-400">9 Categories</span>
              <p className="text-xs text-slate-400 mt-1">Roads, Drainage, Grid, Sanitation</p>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-2xl font-black text-amber-400">&lt; 400m Radius</span>
              <p className="text-xs text-slate-400 mt-1">AI Duplicate Detection Engine</p>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-2xl font-black text-purple-400">Bilingual</span>
              <p className="text-xs text-slate-400 mt-1">Malayalam & English Voice & Text</p>
            </div>
            <div className="glass-panel p-4 rounded-xl">
              <span className="text-2xl font-black text-emerald-400">100% Transparent</span>
              <p className="text-xs text-slate-400 mt-1">Human-in-the-Loop Verification</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Key Questions Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Core Architectural Mission
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Answering The 5 Fundamental Civic Questions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              q: "1. What is happening?",
              d: "Multimodal image & speech ingestion extracts categories and severity automatically.",
              icon: Cpu,
            },
            {
              q: "2. Where concentrated?",
              d: "Interactive Leaflet geospatial clustering flags repeat infrastructure pressure points.",
              icon: MapPin,
            },
            {
              q: "3. Immediate attention?",
              d: "Transparent multi-factor priority scores rank urgent civic hazards without black-box bias.",
              icon: ShieldAlert,
            },
            {
              q: "4. Emerging risks?",
              d: "Correlates weather precipitation with open drainage to forecast localized flash flood risks.",
              icon: BarChart3,
            },
            {
              q: "5. Prioritized action?",
              d: "Generates actionable dispatch work orders for PWD, KSEB, and municipal engineers.",
              icon: Users,
            },
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-4 rounded-xl space-y-2 flex flex-col justify-between">
              <item.icon className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-bold text-slate-100">{item.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How NEXUS Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-2xl bg-nexus-900 border border-slate-800 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              Autonomous Intelligence Pipeline
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">How NEXUS Connects Communities</h2>
            <p className="text-xs text-slate-400 mt-2">
              From report submission to field team resolution, every step is transparent and auditable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-2xl font-black text-cyan-500 font-mono">01</span>
              <h4 className="text-sm font-bold text-slate-100">Citizens Report</h4>
              <p className="text-xs text-slate-400">
                Photo uploads, location pin-drop, and Malayalam voice reporting via NEXUS VOICE.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-black text-blue-500 font-mono">02</span>
              <h4 className="text-sm font-bold text-slate-100">AI Triage & Deduplication</h4>
              <p className="text-xs text-slate-400">
                Identifies duplicate reports, tags category, calculates priority, and checks proximity.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-black text-purple-500 font-mono">03</span>
              <h4 className="text-sm font-bold text-slate-100">Admin Command Center</h4>
              <p className="text-xs text-slate-400">
                Authoritative human-in-the-loop verification, department assignment, and work order creation.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-2xl font-black text-emerald-500 font-mono">04</span>
              <h4 className="text-sm font-bold text-slate-100">Field Resolution</h4>
              <p className="text-xs text-slate-400">
                Volunteers and municipal crews upload completion photos and verify resolved status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Differentiating Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Built For Real-World Impact
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Unique Differentiating Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Problem Cluster Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consolidates multiple complaints across a 400m radius into one cohesive municipal ticket, preventing wasted crew dispatches.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Explainable Priority Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every score displays the exact percentage breakdown: Severity (25%), Urgency (25%), Community Confirmations (20%), and Time Elapsed (15%).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-100">Responsible Data & Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero public exposure of citizen contact information or phone numbers. Supports anonymous reporting with cryptographic incident reference codes.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-nexus-900 via-blue-950/60 to-purple-950/60 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
              3-MINUTE JUDGING SHOWCASE
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Experience The Live Intelligence Demo</h3>
            <p className="text-xs text-slate-300">
              Click to launch the 9-step simulated monsoon scenario, compound risk recalculation, and automated municipal briefing.
            </p>
          </div>

          <button
            onClick={openDemoModal}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold flex items-center space-x-2 shrink-0 shadow-lg shadow-cyan-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Live Demo</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-300">NEXUS</span>
          <span>— Community Intelligence & Predictive Problem Management</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => onSelectTab('about')} className="hover:text-slate-300">
            About Project
          </button>
          <button onClick={() => onSelectTab('map')} className="hover:text-slate-300">
            Live Map
          </button>
          <button onClick={() => onSelectTab('settings')} className="hover:text-slate-300">
            API Settings
          </button>
        </div>
      </footer>
    </div>
  );
};
