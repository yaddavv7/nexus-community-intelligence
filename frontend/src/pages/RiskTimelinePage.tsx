import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useDemo } from '../context/DemoContext';
import { RiskAssessment, WeatherData } from '../types';
import {
  ShieldAlert,
  CloudRain,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const RiskTimelinePage: React.FC = () => {
  const { openDemoModal } = useDemo();
  const [localityRisks, setLocalityRisks] = useState<RiskAssessment[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.getRiskTimeline();
      setLocalityRisks(res.locality_risks);
      setWeather(res.weather);
      setTimelineEvents(res.timeline_events);
    } catch (err) {
      console.error('Fetch risk timeline error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto my-8 px-4 sm:px-6 space-y-8">
      {/* Header and Live Demo Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Compound Civic Risk Forecasting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">COMMUNITY RISK TIMELINE</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Correlating recurring drainage complaints, open road erosion, and rainfall precipitation to forecast localized hazards before disaster escalation.
          </p>
        </div>

        <button
          onClick={openDemoModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-glow-cyan shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Live Demo Workflow</span>
        </button>
      </div>

      {/* Environmental Context Banner */}
      {weather && (
        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-blue-950/20">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <CloudRain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-100">{weather.scenario_name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {weather.is_simulated ? 'SIMULATED DATASET' : 'LIVE API'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Current Precipitation: <span className="font-bold text-cyan-400">{weather.rainfall_mm} mm/hr</span> |
                Temperature: <span className="text-slate-100">{weather.temperature_c}°C</span> | Wind: {weather.wind_speed_kmh} km/h
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 md:text-right">
            <span>Data Timestamp: </span>
            <span className="font-mono text-slate-300">{new Date(weather.timestamp).toLocaleTimeString()}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Predictions are transparent estimates, never claims of certainty.</p>
          </div>
        </div>
      )}

      {/* Temporal Timeline Progression */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Locality Temporal Hazard Progression</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {timelineEvents.map((evt, idx) => {
            const isCritical = evt.status === 'critical';
            const isWarning = evt.status === 'warning';
            return (
              <div
                key={evt.id}
                className={`glass-panel p-4 rounded-xl border relative space-y-2 flex flex-col justify-between ${
                  isCritical
                    ? 'border-rose-500/40 bg-rose-950/15'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono text-cyan-400 font-bold">{evt.phase}</span>
                    <span>{evt.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 leading-snug">{evt.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{evt.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
                  <span className="text-slate-500">Risk Score:</span>
                  <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                    {evt.risk_score} / 100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Hazard Estimates Table / Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Active Regional Risk Assessments (Ward Triage)</span>
        </h3>

        <div className="space-y-3">
          {localityRisks.map((risk, idx) => {
            const isSevere = risk.risk_score >= 75;
            const isHigh = risk.risk_score >= 55 && risk.risk_score < 75;

            return (
              <div
                key={idx}
                className={`glass-panel p-5 rounded-2xl border transition-all ${
                  isSevere
                    ? 'border-rose-500/40 bg-rose-950/10 shadow-lg shadow-rose-950/20'
                    : isHigh
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h4 className="text-sm font-bold text-slate-100">{risk.locality_name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          isSevere
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isHigh
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {risk.risk_level} RISK
                      </span>
                    </div>
                    <p className="text-xs text-rose-300 font-semibold">{risk.risk_type}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Composite Score</span>
                      <span className="text-lg font-black text-cyan-400 font-mono">
                        {risk.risk_score} / 100
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Active Complaints</span>
                      <span className="text-sm font-bold text-slate-200">
                        {risk.related_incidents_count} reports
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evidence and Recommended Municipal Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Supporting Evidence:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                      {risk.evidence_items.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-nexus-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">
                      Recommended Inspection Action:
                    </span>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-medium">
                      {risk.recommended_action}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
