import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, CloudLightning, ChevronDown, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { WeatherData } from '../types';

export const WeatherBadge: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (live = false) => {
    try {
      setLoading(true);
      const data = await api.getCurrentWeather(live);
      setWeather(data);
    } catch (err) {
      console.warn("Weather fetch fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(false);
  }, []);

  const handleSelectScenario = async (scenario: string, rainfall?: number) => {
    try {
      setLoading(true);
      const res = await api.setWeatherScenario(scenario, rainfall);
      setWeather(res.weather);
      setIsOpen(false);
    } catch (err) {
      console.error("Scenario update error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!weather) return null;

  const isRainy = weather.rainfall_mm > 10;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          isRainy
            ? 'bg-blue-950/60 border-blue-500/40 text-blue-300 hover:bg-blue-900/50'
            : 'bg-nexus-900 border-slate-700 text-slate-300 hover:bg-nexus-850'
        }`}
        title="Click to toggle environmental weather scenarios"
      >
        {isRainy ? (
          <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span className="font-semibold text-slate-100">{weather.rainfall_mm} mm/hr</span>
        <span className="hidden sm:inline text-slate-400">({weather.temperature_c}°C)</span>
        <span className={`px-1.5 py-0.2 rounded text-[10px] ${weather.is_simulated ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
          {weather.is_simulated ? 'SIMULATED' : 'LIVE'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-nexus-900 border border-slate-700 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-100">Kerala Weather Engine</p>
              <p className="text-[10px] text-slate-400">Ernakulam / Kochi Coordinates</p>
            </div>
            <button
              onClick={() => fetchWeather(true)}
              disabled={loading}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Live API</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => handleSelectScenario('monsoon_heavy', 86.5)}
              className="w-full text-left p-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-xs flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2">
                <CloudLightning className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="font-medium text-slate-200">Torrential Monsoon Storm</p>
                  <p className="text-[10px] text-blue-300">86.5 mm/hr — High flood hazard</p>
                </div>
              </div>
              {weather.rainfall_mm > 50 && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              onClick={() => handleSelectScenario('moderate_rain', 25.0)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-xs flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="font-medium text-slate-200">Moderate Showers</p>
                  <p className="text-[10px] text-slate-400">25.0 mm/hr — Routine monsoon</p>
                </div>
              </div>
              {weather.rainfall_mm > 10 && weather.rainfall_mm <= 50 && (
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              )}
            </button>

            <button
              onClick={() => handleSelectScenario('clear_sky', 0.0)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-700 text-xs flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-medium text-slate-200">Clear Dry Day</p>
                  <p className="text-[10px] text-slate-400">0 mm/hr — Baseline conditions</p>
                </div>
              </div>
              {weather.rainfall_mm === 0 && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

          <p className="text-[10px] text-slate-500 mt-2 text-center border-t border-slate-800/80 pt-2">
            Simulated outputs are explicitly labelled to ensure transparent verification.
          </p>
        </div>
      )}
    </div>
  );
};
