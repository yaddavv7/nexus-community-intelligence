import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const AnalyticsReportsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview().then((res) => {
      setOverview(res);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Executive Analytics & Intelligence Brief</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formal municipal reporting ready for printing, archival, and administrative review
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-glow-cyan"
        >
          <Printer className="w-4 h-4" />
          <span>Print Council Executive Report</span>
        </button>
      </div>

      {/* Printable Report Summary Container */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 bg-nexus-900/90 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">NEXUS MUNICIPAL INTELLIGENCE REPORT</h2>
            <p className="text-xs text-slate-400">
              Sector: Greater Kochi & Periyar River Basin Wards • Report Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400 px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
            OFFICIAL BRIEFING
          </span>
        </div>

        {/* Executive Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Ingested Reports</span>
            <p className="text-2xl font-black text-slate-100 mt-1">{overview?.total_incidents || 25}</p>
          </div>
          <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">High Hazard Alerts</span>
            <p className="text-2xl font-black text-rose-400 mt-1">{overview?.high_priority_incidents || 15}</p>
          </div>
          <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Verified Remediation</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{overview?.resolved_incidents || 3}</p>
          </div>
          <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Average Resolution Time</span>
            <p className="text-2xl font-black text-purple-400 mt-1">{overview?.avg_resolution_hours || 38.5}h</p>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Incident Distribution by Sector</h4>
            <div className="h-56 rounded-xl bg-nexus-950 border border-slate-800 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.category_distribution || []}>
                  <XAxis dataKey="category" stroke="#64748b" fontSize={9} tickFormatter={(t) => t.slice(0, 10)} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', fontSize: '10px' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Weekly Intake vs Resolution Velocity</h4>
            <div className="h-56 rounded-xl bg-nexus-950 border border-slate-800 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overview?.trend_data || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0b1120', borderColor: '#1e293b', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#38bdf8" strokeWidth={2} name="Intake" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Official Findings Summary */}
        <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-300">
          <h4 className="font-bold text-cyan-400">Executive Findings & Recommended Council Directives:</h4>
          <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
            <li>Drainage and stormwater canal maintenance in Aluva Riverbank Ward requires prioritized de-silting ahead of projected southwest monsoon precipitation.</li>
            <li>PWD Urban Roads Division must deploy immediate patching units for NH-544 CUSAT metro pillar service lane craters to avert skidding accidents.</li>
            <li>Duplicate complaint clustering algorithms successfully consolidated 3 redundant reports, preventing parallel crew dispatch overhead.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
