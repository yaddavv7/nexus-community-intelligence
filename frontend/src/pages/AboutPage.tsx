import React from 'react';
import { Sparkles, Shield, Cpu, MapPin, Globe, Award, CheckCircle2, Heart } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      <div className="text-center space-y-3 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>About The Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">NEXUS</h1>
        <p className="text-sm font-semibold text-cyan-300">
          "Detect Problems. Connect Communities. Predict Risks. Create Impact."
        </p>
        <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
          An intelligent community problem detection, reporting, analysis and predictive management network powered by explainable AI.
        </p>
      </div>

      {/* Vision & Scenario */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>The Kerala Demonstration Scenario</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          NEXUS was initially modeled around real-world municipal pain points in Kerala, India—specifically the Kochi-Aluva-Kalamassery urban continuum.
          During monsoon cycles, drainage blockages along the Periyar riverbank quickly escalate into road erosion, flooded marketplaces, and commuter gridlock.
        </p>
        <p className="text-xs text-slate-300 leading-relaxed">
          By combining citizen photo and voice reports (in Malayalam and English) with meteorological rainfall indicators, NEXUS provides municipal administrators
          with predictive foresight rather than reactive panic.
        </p>
      </div>

      {/* Explainable AI Disclosure */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 space-y-4 bg-purple-950/10">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Explainable AI & Ethical Machine Learning Disclosure</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Civic decision-making should never be gated behind an opaque black box. NEXUS adheres strictly to explainable AI principles:
        </p>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Transparent Priority Formula:</strong> Priority scores explicitly display the weighted contributions of Severity (25%), Urgency (25%), Citizen Confirmations (20%), Stagnation (15%), and Weather Hazard (15%).</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Human-in-the-Loop Authority:</strong> AI engines recommend, categorize, and flag risks; certified human officers verify and authorize physical dispatches.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Clear Labelling of Simulated Data:</strong> During testing, simulated weather and demonstration incidents are visibly tagged to prevent mistaking simulation for real-world catastrophe.</span>
          </li>
        </ul>
      </div>

      {/* Tech Stack */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Full-Stack Architecture & Technology Stack</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Frontend</span>
            <p className="text-slate-300">React, TypeScript, Vite, Tailwind CSS, Framer Motion</p>
          </div>
          <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Backend</span>
            <p className="text-slate-300">Python FastAPI, REST API, Uvicorn, Pydantic</p>
          </div>
          <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Database</span>
            <p className="text-slate-300">SQLAlchemy, SQLite async engine, Supabase PostgreSQL RLS Schema</p>
          </div>
          <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-cyan-400 font-bold block mb-1">Geo & AI</span>
            <p className="text-slate-300">Leaflet, OpenStreetMap, Gemini API, Open-Meteo Weather</p>
          </div>
        </div>
      </div>
    </div>
  );
};
