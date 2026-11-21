import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { TRANSLATIONS } from '../services/translations';
import { WeatherBadge } from './WeatherBadge';
import {
  Sparkles,
  Bell,
  Globe,
  UserCheck,
  ShieldAlert,
  Menu,
  X,
  MapPin,
  FilePlus,
  Compass,
  Activity,
  Mic,
  BarChart2,
  Users,
  Settings
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  const { user, role, switchRole, language, setLanguage } = useAuth();
  const { openDemoModal } = useDemo();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  const navLinks = [
    { id: 'landing', label: t.nav.home },
    { id: 'map', label: t.nav.map },
    { id: 'report', label: t.nav.report },
    { id: 'voice', label: t.nav.voice },
    { id: 'timeline', label: t.nav.timeline },
    { id: 'insights', label: t.nav.insights },
  ];

  if (role === 'admin') {
    navLinks.push({ id: 'admin', label: t.nav.adminCommand });
    navLinks.push({ id: 'incidents', label: t.nav.incidents });
    navLinks.push({ id: 'analytics', label: t.nav.analytics });
  } else if (role === 'volunteer') {
    navLinks.push({ id: 'volunteer', label: t.nav.volunteer });
  } else {
    navLinks.push({ id: 'citizen-dash', label: 'My Dashboard' });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-nexus-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping absolute" />
            <span className="text-white font-black text-sm">NX</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
                NEXUS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Kerala Community Intelligence Network
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentTab === item.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions Right */}
        <div className="flex items-center space-x-2.5">
          {/* Live Demo Trigger Button (Hackathon Essential) */}
          <button
            onClick={openDemoModal}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-semibold shadow-glow-cyan transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Live Demo</span>
          </button>

          {/* Weather status pill */}
          <WeatherBadge />

          {/* Quick Role Switcher (Judge Mode) */}
          <div className="hidden sm:flex items-center space-x-1 bg-nexus-900 border border-slate-800 rounded-lg px-2 py-1 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={role}
              onChange={handleRoleChange}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              title="Fast role switcher for hackathon judges"
            >
              <option value="citizen" className="bg-nexus-900 text-slate-200">
                Citizen
              </option>
              <option value="volunteer" className="bg-nexus-900 text-slate-200">
                Volunteer
              </option>
              <option value="admin" className="bg-nexus-900 text-slate-200">
                Administrator
              </option>
            </select>
          </div>

          {/* Bilingual Toggle (EN / ML) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-nexus-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            title="Switch between English and Malayalam"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-nexus-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Open Notification Centre"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-nexus-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-4 space-y-1 bg-nexus-950 border-b border-slate-800">
          <div className="py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Role:</span>
            <select
              value={role}
              onChange={(e) => {
                handleRoleChange(e);
                setMobileMenuOpen(false);
              }}
              className="bg-nexus-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1"
            >
              <option value="citizen">Citizen</option>
              <option value="volunteer">Volunteer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            onClick={() => {
              openDemoModal();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Run Live Intelligence Demo</span>
          </button>

          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-medium ${
                currentTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
