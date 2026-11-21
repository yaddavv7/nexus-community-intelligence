import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TRANSLATIONS } from '../services/translations';
import { MapComponent } from '../components/MapComponent';
import {
  FilePlus,
  Sparkles,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';
import { Incident } from '../types';

interface SubmitReportProps {
  onSelectTab: (tab: string) => void;
  onViewIncident: (id: number) => void;
}

const CATEGORIES = [
  'Road damage and potholes',
  'Drainage and waterlogging',
  'Garbage and waste management',
  'Water supply problems',
  'Public infrastructure damage',
  'Electricity and street lighting',
  'Environmental pollution',
  'Public safety concerns',
  'Other community issues',
];

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Road Pothole',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Drainage Waterlog',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Garbage Dump',
    url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Broken Infrastructure',
    url: 'https://images.unsplash.com/photo-1584463699039-b9a471fa08d4?auto=format&fit=crop&w=800&q=80',
  },
];

export const SubmitReportPage: React.FC<SubmitReportProps> = ({ onSelectTab, onViewIncident }) => {
  const { language, user } = useAuth();
  const t = TRANSLATIONS[language];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [severity, setSeverity] = useState(3);
  const [urgency, setUrgency] = useState('medium');
  const [locality, setLocality] = useState('Aluva Riverbank Ward');
  const [landmark, setLandmark] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<[number, number]>([10.1084, 76.3532]);
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_PHOTO_PRESETS[0].url);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSuggestingTitle, setIsSuggestingTitle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<Incident | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCoordinatesPicked = (lat: number, lng: number) => {
    setCoordinates([lat, lng]);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Fallback to Aluva coordinates
          setCoordinates([10.1084, 76.3532]);
        }
      );
    }
  };

  const handleSuggestTitle = async () => {
    if (!description || description.trim().length < 8) {
      setError('Please provide a brief description before generating AI title.');
      return;
    }
    setError(null);
    setIsSuggestingTitle(true);
    try {
      const res = await api.classifyText({ description, language });
      if (res.suggested_title) {
        setTitle(res.suggested_title);
      }
      if (res.category) {
        setCategory(res.category);
      }
      if (res.severity) {
        setSeverity(res.severity);
      }
      if (res.urgency) {
        setUrgency(res.urgency);
      }
    } catch (err) {
      console.warn('AI suggestion fallback:', err);
      setTitle(`Incident: ${description.slice(0, 35)}...`);
    } finally {
      setIsSuggestingTitle(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!description || description.trim().length < 5) {
      setError('Please enter a descriptive summary of the problem.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createIncident({
        title: title || `${category}: ${description.slice(0, 30)}...`,
        description,
        category,
        severity,
        urgency,
        latitude: coordinates[0],
        longitude: coordinates[1],
        locality_name: locality,
        landmark,
        address,
        photo_url: photoUrl,
        is_anonymous: isAnonymous,
        language,
      });
      setSubmittedIncident(created);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit incident. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedIncident) {
    return (
      <div className="max-w-xl mx-auto my-12 px-4">
        <div className="glass-panel p-8 rounded-2xl text-center space-y-4 border border-cyan-500/30 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300">
            {submittedIncident.reference_no}
          </span>

          <h3 className="text-xl font-bold text-white">{t.reporting.successTitle}</h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            {t.reporting.successMessage} It has been classified by AI and entered into the municipal triage queue.
          </p>

          <div className="p-4 rounded-xl bg-nexus-950/80 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="text-slate-200 font-semibold">{submittedIncident.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Locality:</span>
              <span className="text-slate-200 font-semibold">{submittedIncident.locality_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Department:</span>
              <span className="text-cyan-400 font-semibold">{submittedIncident.assigned_department || 'Triage'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onViewIncident(submittedIncident.id)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5"
            >
              <span>{t.reporting.viewIncident}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setSubmittedIncident(null);
                setDescription('');
                setTitle('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center space-x-2">
            <FilePlus className="w-6 h-6 text-cyan-400" />
            <span>{t.reportProblem}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Submit a community infrastructure, drainage, or hazard report for automated AI triage
          </p>
        </div>
        <button
          onClick={() => onSelectTab('voice')}
          className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-nexus-900 border border-slate-700 hover:border-cyan-500/40 text-xs text-cyan-300"
        >
          <span>Try NEXUS Voice Reporting</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Form Fields */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-200">
                {t.reporting.descriptionLabel} <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleSuggestTitle}
                disabled={isSuggestingTitle}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
              >
                <Sparkles className={`w-3 h-3 ${isSuggestingTitle ? 'animate-spin' : ''}`} />
                <span>{isSuggestingTitle ? 'Analyzing...' : t.reporting.suggestTitleBtn}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.reporting.descriptionPlaceholder}
              required
              className="w-full bg-nexus-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* Problem Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.reporting.titleLabel}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.reporting.titlePlaceholder}
              className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.reporting.categoryLabel} <span className="text-rose-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {t.categories[cat as keyof typeof t.categories] || cat}
                </option>
              ))}
            </select>
          </div>

          {/* Severity & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Severity Level: {severity}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>1 Minor</span>
                <span>3 Moderate</span>
                <span>5 Critical</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                <option value="low">Low (Routine)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="high">High (Urgent Attention)</option>
                <option value="critical">Critical (Immediate Danger)</option>
              </select>
            </div>
          </div>

          {/* Locality & Landmark */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Locality / Ward
              </label>
              <input
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="E.g., Aluva Riverbank Ward"
                className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Post Office / Metro"
                className="w-full bg-nexus-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Anonymous option */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded bg-nexus-900 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="anon" className="text-xs text-slate-400 cursor-pointer">
              {t.reporting.anonymousCheckbox}
            </label>
          </div>
        </div>

        {/* Right Column: Map Picker & Photo Evidence */}
        <div className="space-y-4">
          {/* Map Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-200">
                {t.reporting.locationLabel}
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
              >
                <MapPin className="w-3 h-3" />
                <span>{t.reporting.useCurrentLocation}</span>
              </button>
            </div>
            <div className="h-56 rounded-xl overflow-hidden border border-slate-700">
              <MapComponent
                isPickerMode={true}
                selectedCoordinates={coordinates}
                onCoordinatesPicked={handleCoordinatesPicked}
                center={coordinates}
                zoom={14}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Click anywhere on the map to place the incident pin: [{coordinates[0].toFixed(5)},{' '}
              {coordinates[1].toFixed(5)}]
            </p>
          </div>

          {/* Photo attachment & demo presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              {t.reporting.uploadPhoto}
            </label>

            {photoUrl && (
              <div className="relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 mb-2">
                <img src={photoUrl} alt="Incident preview" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] bg-black/70 text-slate-200 backdrop-blur-sm">
                  Attached Photo Evidence
                </span>
              </div>
            )}

            {/* Quick Presets for Demo */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">Sample Evidence Presets:</span>
              <div className="grid grid-cols-4 gap-1.5">
                {SAMPLE_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPhotoUrl(p.url)}
                    className={`p-1.5 rounded-lg text-[10px] text-center border truncate transition-all ${
                      photoUrl === p.url
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-nexus-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{submitting ? t.reporting.submitting : t.reporting.submitBtn}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
