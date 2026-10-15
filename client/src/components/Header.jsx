import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Printer,
  Wifi,
  Clock,
  Eye,
  Shield,
  RotateCcw,
  MapPin,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { useKiosk } from '../context/KioskContext';

export default function Header() {
  const {
    currentKiosk,
    kiosks,
    selectedKioskId,
    setSelectedKioskId,
    session,
    currentStep,
    resetSession,
    highContrast,
    setHighContrast,
    largeText,
    setLargeText
  } = useKiosk();

  const [timeStr, setTimeStr] = useState('');
  const [showKioskPicker, setShowKioskPicker] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isKioskView = location.pathname === '/';

  return (
    <header className="bg-navy-800 text-white border-b border-slate-700/60 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-brand-300 transition-colors">
                  Smart Campus Print
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-brand-500/20 text-cyan-300 border border-brand-400/30">
                  Kiosk System
                </span>
              </div>
              <p className="text-xs text-slate-400">Self-Service Document Printing</p>
            </div>
          </Link>
        </div>

        {/* Center: Current Kiosk Selector / Badge */}
        {isKioskView && currentKiosk && (
          <div className="relative">
            <button
              onClick={() => setShowKioskPicker(!showKioskPicker)}
              className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition text-sm"
              title="Click to view or switch kiosk terminal"
            >
              <MapPin className="w-4 h-4 text-brand-400" />
              <div className="text-left">
                <div className="font-medium text-xs text-slate-200 flex items-center gap-1.5">
                  <span>{currentKiosk.name}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      currentKiosk.status === 'ONLINE'
                        ? 'bg-emerald-400 animate-pulse'
                        : currentKiosk.status === 'BUSY'
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-slate-400">{currentKiosk.location}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* Dropdown */}
            {showKioskPicker && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Campus Kiosks
                </div>
                {kiosks.map((k) => (
                  <button
                    key={k.kioskId}
                    onClick={() => {
                      setSelectedKioskId(k.kioskId);
                      setShowKioskPicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                      k.kioskId === selectedKioskId
                        ? 'bg-brand-600/30 text-brand-300 font-semibold border border-brand-500/40'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{k.name}</div>
                      <div className="text-[10px] text-slate-400">{k.kioskId} • {k.location}</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                        k.status === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : k.status === 'BUSY'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {k.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right tools: Clock, Accessibility, Active Session Reset, Admin link */}
        <div className="flex items-center space-x-3 text-sm">
          {/* Live Clock */}
          <div className="hidden sm:flex items-center space-x-1.5 text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          {/* Accessibility toggle */}
          <button
            onClick={() => {
              setHighContrast(!highContrast);
              document.documentElement.classList.toggle('high-contrast');
            }}
            className={`p-2 rounded-lg border transition ${
              highContrast
                ? 'bg-amber-400 text-slate-900 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Toggle Accessibility / High Contrast"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Reset / Exit active session button */}
          {session && currentStep > 1 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit and clear this printing session?')) {
                  resetSession();
                }
              }}
              className="flex items-center space-x-1 px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 rounded-lg text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel Session</span>
            </button>
          )}

          {/* Admin link */}
          <Link
            to="/admin"
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition"
          >
            <Shield className="w-3.5 h-3.5 text-brand-400" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
