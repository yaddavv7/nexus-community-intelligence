import React from 'react';
import { useDemo } from '../context/DemoContext';
import {
  X,
  Play,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu,
  Copy,
  BarChart3,
  MapPin,
  CloudRain,
  ShieldAlert,
  FileText,
  UserCheck
} from 'lucide-react';

const STEP_ICONS = [
  Layers,
  Cpu,
  Copy,
  BarChart3,
  MapPin,
  CloudRain,
  ShieldAlert,
  FileText,
  UserCheck
];

export const DemoModal: React.FC = () => {
  const {
    isDemoModalOpen,
    closeDemoModal,
    currentStep,
    setCurrentStep,
    steps,
    stepData,
    runStep,
    runAllSteps,
    isRunningAll,
    resetDemo,
  } = useDemo();

  if (!isDemoModalOpen) return null;

  const activeStepInfo = steps[currentStep - 1];
  const activeStepResult = stepData[currentStep];
  const StepIcon = STEP_ICONS[currentStep - 1] || Sparkles;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-nexus-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-nexus-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  NEXUS Live Intelligence Engine Demo
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  HACKATHON SHOWCASE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                End-to-end 9-step intelligence workflow running on Kerala civic testbed
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runAllSteps}
              disabled={isRunningAll}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningAll ? 'animate-spin' : ''}`} />
              <span>{isRunningAll ? 'Executing Sequence...' : 'Run All 9 Steps'}</span>
            </button>
            <button
              onClick={closeDemoModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="px-6 py-3 bg-nexus-950/40 border-b border-slate-800/80 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[680px]">
            {steps.map((st, idx) => {
              const isPassed = !!stepData[st.step];
              const isCurrent = currentStep === st.step;
              return (
                <button
                  key={st.step}
                  onClick={() => runStep(st.step)}
                  className={`flex items-center space-x-2 text-xs font-medium py-1 px-2 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : isPassed
                      ? 'text-emerald-400 hover:bg-slate-800/60'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-cyan-500 text-black'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? '✓' : st.step}
                  </span>
                  <span className="hidden md:inline whitespace-nowrap">Step {st.step}</span>
                  {idx < steps.length - 1 && (
                    <span className="text-slate-700 mx-1">›</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Current Step Banner */}
          <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                  STEP {activeStepInfo.step} OF 9
                </span>
                <h4 className="text-sm font-bold text-slate-100">{activeStepInfo.title}</h4>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeStepInfo.description}
              </p>
            </div>

            <button
              onClick={() => runStep(currentStep)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Execute Step</span>
            </button>
          </div>

          {/* Active Step Output Display */}
          <div className="rounded-xl border border-slate-800 bg-nexus-950/80 p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>Live Intelligence Output & Explainability Log</span>
              </p>
              <span className="text-[10px] font-mono text-slate-500">
                API: /demo/run-scenario?step={currentStep}
              </span>
            </div>

            {activeStepResult ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 flex items-center space-x-2 text-xs text-cyan-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{activeStepResult.message}</span>
                </div>

                {/* Structured visualization per step */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <p className="text-xl font-bold text-slate-100">{activeStepResult.data?.count || 25}</p>
                      <p className="text-[11px] text-slate-400">Total Ingested Reports</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <p className="text-xl font-bold text-cyan-400">9</p>
                      <p className="text-[11px] text-slate-400">Civic Categories</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <p className="text-xl font-bold text-emerald-400">Kerala</p>
                      <p className="text-[11px] text-slate-400">Aluva / Kochi Zone</p>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <p className="font-semibold text-slate-200">Multimodal & NLP Classification Matrix:</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-cyan-400 font-bold">Malayalam Keyword Parser:</span>
                        <p className="text-slate-300 mt-0.5">"വെള്ളക്കെട്ട്" (Waterlogging) → Drainage Category</p>
                        <p className="text-slate-300 mt-0.5">"റോഡിലെ കുഴി" (Pothole) → PWD Road Damage</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <span className="text-cyan-400 font-bold">Automated Routing:</span>
                        <p className="text-slate-300 mt-0.5">Major & Minor Irrigation Dept</p>
                        <p className="text-slate-300 mt-0.5">Kerala Water Authority (KWA)</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <p className="font-semibold text-slate-200">Discovered Duplicate Cluster:</p>
                    <div className="p-2.5 rounded bg-slate-950 border border-amber-500/30 text-[11px]">
                      <div className="flex items-center justify-between text-amber-300 font-semibold mb-1">
                        <span>Pair: NX-2026-KL-0001 ↔ NX-2026-KL-0002</span>
                        <span>Distance: 74.2 meters (Haversine)</span>
                      </div>
                      <p className="text-slate-300">
                        Reason: Immediate geographical proximity in Aluva Market Road; 82% semantic overlap between English and Malayalam descriptions of canal overflow.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-slate-200">Transparent Priority Scoring Weights:</p>
                    <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <p className="font-bold text-rose-400">25%</p>
                        <p className="text-slate-400">Severity</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <p className="font-bold text-amber-400">25%</p>
                        <p className="text-slate-400">Urgency</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <p className="font-bold text-cyan-400">20%</p>
                        <p className="text-slate-400">Community Confirmations</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <p className="font-bold text-blue-400">15%</p>
                        <p className="text-slate-400">Stagnation / Time</p>
                      </div>
                      <div className="p-2 rounded bg-slate-950 border border-slate-800">
                        <p className="font-bold text-purple-400">15%</p>
                        <p className="text-slate-400">Environmental Hazard</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-500/40 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-blue-300 font-bold">
                      <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
                      <span>Monsoon Rainfall Trigger Active: 86.5 mm/hr</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Precipitation threshold exceeded (30 mm/hr normal limit). Open-Meteo environmental hazard multiplier updated across all drainage and low-lying culvert coordinates.
                    </p>
                  </div>
                )}

                {currentStep === 7 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-rose-400">Elevated Regional Risk Assessments:</p>
                    <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 text-[11px]">
                      <div className="flex items-center justify-between text-rose-300 font-bold mb-1">
                        <span>Aluva Riverbank Ward: Severe Flash Flood Hazard</span>
                        <span className="font-mono">Risk: 88.5 / 100</span>
                      </div>
                      <p className="text-slate-300">
                        Evidence: 2 blocked drainage culverts + 86.5 mm/hr rainfall + 13 citizen confirmations. Recommended: Deploy emergency dewatering pumps.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 8 && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                    <p className="font-semibold text-cyan-400">AI Community Intelligence Executive Briefing:</p>
                    <p className="text-slate-300 text-[11px] leading-relaxed italic bg-slate-950 p-2.5 rounded border border-slate-800">
                      "{activeStepResult.message}"
                    </p>
                  </div>
                )}

                {currentStep === 9 && (
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-2">
                    <p className="font-semibold text-emerald-400">Human-In-The-Loop Municipal Dispatch Checklist:</p>
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex items-center space-x-2 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Authorized PWD Road Cordon at NH-544 Pillar 312</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Dispatched Irrigation Dewatering Crew to Periyar Market Road</span>
                      </div>
                      <div className="flex items-center space-x-2 p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>Notified Field Volunteer Reshma Pillai for site inspection verification</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Raw JSON Debug Accordion for Judges */}
                <details className="mt-2 text-[10px] text-slate-500 cursor-pointer">
                  <summary className="hover:text-slate-400">Inspect Raw AI Verification Payload</summary>
                  <pre className="mt-2 p-2 rounded bg-black/60 border border-slate-800 text-slate-400 font-mono overflow-x-auto max-h-36">
                    {JSON.stringify(activeStepResult, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Click "Execute Step" or "Run All 9 Steps" to trigger live API analysis.
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-nexus-950/70">
          <button
            onClick={resetDemo}
            className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium"
              >
                Previous Step
              </button>
            )}

            {currentStep < 9 ? (
              <button
                onClick={() => {
                  const next = currentStep + 1;
                  setCurrentStep(next);
                  runStep(next);
                }}
                className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1"
              >
                <span>Next Step ({currentStep + 1})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={closeDemoModal}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Complete Showcase
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
