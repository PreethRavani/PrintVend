import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Printer,
  Clock,
  Eye,
  Shield,
  RotateCcw
} from 'lucide-react';
import { useKiosk } from '../context/KioskContext';

export default function Header() {
  const {
    session,
    currentStep,
    resetSession,
    highContrast,
    setHighContrast
  } = useKiosk();

  const [timeStr, setTimeStr] = useState('');
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
    <header className="bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3] flex items-center justify-center shadow-sm group-hover:bg-[#0077ed] transition-colors">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base sm:text-lg tracking-tight text-white group-hover:text-slate-200 transition-colors">
                  Smart Campus Print
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide rounded-md bg-slate-800 text-slate-300 border border-slate-700/70">
                  Terminal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Self-Service Document Printing</p>
            </div>
          </Link>
        </div>

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
