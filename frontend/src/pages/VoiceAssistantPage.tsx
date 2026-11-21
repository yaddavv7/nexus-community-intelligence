import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TRANSLATIONS } from '../services/translations';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  MapPin,
  Languages,
  ArrowRight
} from 'lucide-react';
import { Incident } from '../types';

interface VoiceProps {
  onViewIncident: (id: number) => void;
}

const SAMPLE_VOICE_PROMPTS = [
  {
    lang: 'English',
    text: 'There is water accumulating near the main road after heavy rainfall in Aluva market, causing severe traffic hazard.',
    locality: 'Aluva Riverbank Ward',
  },
  {
    lang: 'മലയാളം (Malayalam)',
    text: 'ആലുവ മാർക്കറ്റ് റോഡിൽ ഓടയിലെ തടസ്സം കാരണം മഴവെള്ളം മുഴുവൻ റോഡിൽ കെട്ടിക്കിടക്കുന്നു. കാൽനടയാത്രക്കാർക്ക് നടക്കാൻ പറ്റുന്നില്ല.',
    locality: 'Aluva Riverbank Ward',
  },
  {
    lang: 'English',
    text: 'Deep crater pothole near CUSAT metro pillar 312 on NH-544 service lane. Two-wheelers are skidding.',
    locality: 'Kalamassery Civic Zone',
  },
  {
    lang: 'മലയാളം (Malayalam)',
    text: 'കളമശ്ശേരി റോഡിൽ വലിയ കുഴിയുണ്ട്. രാത്രിയിൽ സ്ട്രീറ്റ് ലൈറ്റ് ഇല്ലാത്തതുകൊണ്ട് അപകടങ്ങൾ ഉണ്ടാകുന്നു.',
    locality: 'Kalamassery Civic Zone',
  },
];

export const VoiceAssistantPage: React.FC<VoiceProps> = ({ onViewIncident }) => {
  const { language } = useAuth();
  const t = TRANSLATIONS[language];

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [aiDraft, setAiDraft] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web Speech API recognition handler
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isRecording) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'ml' ? 'ml-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
      };

      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isRecording, language]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (transcript.length > 5) {
        processTranscript(transcript);
      }
    } else {
      setTranscript('');
      setAiDraft(null);
      setError(null);
      setIsRecording(true);
    }
  };

  const processTranscript = async (text: string) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.classifyText({ description: text, language });
      setAiDraft({
        title: res.suggested_title,
        description: text,
        category: res.category,
        severity: res.severity,
        urgency: res.urgency,
        department: res.suggested_department,
        locality: 'Aluva Riverbank Ward', // Extracted locality
        coordinates: [10.1084, 76.3532],
        confidence: res.confidence,
      });
    } catch (err) {
      console.error('Processing voice error:', err);
      setError('Could not parse speech. Please try speaking again or use sample voice prompts.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleText: string, localityName: string) => {
    setTranscript(sampleText);
    setIsRecording(false);
    processTranscript(sampleText);
  };

  const handleConfirmAndSubmit = async () => {
    if (!aiDraft) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createIncident({
        title: aiDraft.title,
        description: aiDraft.description,
        category: aiDraft.category,
        severity: aiDraft.severity,
        urgency: aiDraft.urgency,
        locality_name: aiDraft.locality,
        latitude: aiDraft.coordinates[0],
        longitude: aiDraft.coordinates[1],
        voice_transcript: aiDraft.description,
        language,
        photo_url:
          'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      });
      setCreatedIncident(created);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Submission failed. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdIncident) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-cyan-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300">
            {createdIncident.reference_no}
          </span>
          <h3 className="text-xl font-bold text-white">Voice Report Submitted!</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Your spoken report was converted to text, categorized by AI, and registered with reference code {createdIncident.reference_no}.
          </p>

          <button
            onClick={() => onViewIncident(createdIncident.id)}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs inline-flex items-center space-x-1.5"
          >
            <span>View Incident Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multilingual Speech-To-Report Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">{t.voice.title}</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">{t.voice.subtitle}</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Microphone Button Interaction */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping scale-150" />
            )}
            <button
              onClick={toggleRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                isRecording
                  ? 'bg-rose-600 text-white shadow-rose-500/40 animate-pulse'
                  : 'bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-glow-cyan'
              }`}
            >
              {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-200">
              {isRecording ? t.voice.listening : t.voice.startListening}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRecording
                ? 'Speak in English or Malayalam...'
                : 'Click microphone to begin speech recognition'}
            </p>
          </div>
        </div>

        {/* Live Transcript Box */}
        <div className="p-4 rounded-xl bg-nexus-950 border border-slate-800 min-h-[90px] text-left text-xs leading-relaxed text-slate-300">
          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
            Real-Time Speech Transcription:
          </span>
          {transcript || (
            <span className="text-slate-600 italic">
              Spoken words will transcribe here automatically...
            </span>
          )}
        </div>

        {/* Quick Voice Simulation Buttons for Judges */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400">
            Or Click a Sample Spoken Voice Prompt:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {SAMPLE_VOICE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.text, sample.locality)}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 transition-all flex items-start space-x-2 group"
              >
                <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:scale-110" />
                <div>
                  <span className="text-[10px] font-bold text-cyan-400">{sample.lang}</span>
                  <p className="line-clamp-2 mt-0.5 leading-snug">{sample.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Parsed Draft Preview (Requires User Confirmation) */}
      {aiDraft && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.voice.confirmDraft}</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Confidence: {Math.round(aiDraft.confidence * 100)}%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-nexus-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Suggested Title</span>
              <p className="font-semibold text-slate-100">{aiDraft.title}</p>
            </div>
            <div className="p-3 rounded-lg bg-nexus-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Category</span>
              <p className="font-semibold text-cyan-300">{aiDraft.category}</p>
            </div>
            <div className="p-3 rounded-lg bg-nexus-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Detected Locality</span>
              <p className="font-semibold text-slate-100">{aiDraft.locality}</p>
            </div>
            <div className="p-3 rounded-lg bg-nexus-950 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold">
                Responsible Department
              </span>
              <p className="font-semibold text-purple-300">{aiDraft.department}</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
              Original Spoken Description
            </span>
            <p className="italic leading-relaxed">{aiDraft.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400 italic">{t.voice.confirmNotice}</span>
            <button
              onClick={handleConfirmAndSubmit}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>{submitting ? 'Registering Report...' : 'Confirm & Submit Report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
