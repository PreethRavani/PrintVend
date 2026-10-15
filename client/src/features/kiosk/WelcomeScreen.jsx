import React, { useState } from 'react';
import {
  Printer,
  FileUp,
  Clock,
  Sparkles,
  Layers,
  Palette,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function WelcomeScreen({ onStartSession }) {
  const { currentKiosk, kiosks, setSelectedKioskId, selectedKioskId, kiosksLoading, sessionLoading } = useKiosk();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Enabled by default unless explicitly in OFFLINE or MAINTENANCE
  const isOnline = currentKiosk ? currentKiosk.status !== 'OFFLINE' && currentKiosk.status !== 'MAINTENANCE' : true;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Hero Touch Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-slate-900 border border-slate-700/60 p-8 sm:p-12 text-white shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 top-10 opacity-10 hidden lg:block">
          <Printer className="w-64 h-64 text-brand-400" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 text-cyan-300 border border-brand-400/30 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast, Privacy-First Self-Service Printing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Print Your Documents in Seconds.
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            No lines, no thumb drives, no hassle. Choose pre-uploaded college documents or transfer assignments directly from your phone.
          </p>

          {/* Single Prominent Primary Action Touch Button */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onStartSession()}
              disabled={!isOnline || sessionLoading}
              className={`touch-btn px-10 py-4 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center space-x-3 ${
                isOnline && !sessionLoading
                  ? 'bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileUp className="w-6 h-6" />
              <span>{sessionLoading ? 'Starting Session...' : 'Start Printing'}</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Terminal Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Operational Status */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kiosk Health</span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {currentKiosk?.status || 'ONLINE'}
            </span>
          </div>

          <div className="space-y-2 pt-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Paper Tray (A4/A3):</span>
              <span className="font-semibold text-slate-800">{currentKiosk?.paperLevel || 94}% full</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-brand-500 h-2 rounded-full"
                style={{ width: `${currentKiosk?.paperLevel || 94}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-600 text-xs pt-1">
              <span>Black Toner: {currentKiosk?.tonerBlack || 88}%</span>
              <span>Color Toner: {currentKiosk?.tonerColor || 76}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Queue & Wait Estimate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Queue Status</span>
            <Clock className="w-4 h-4 text-brand-600" />
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {currentKiosk?.queueLength || 0}
            </span>
            <span className="text-sm text-slate-500">jobs in queue</span>
          </div>

          <p className="text-xs text-slate-500">
            Estimated wait time:{' '}
            <strong className="text-slate-700">
              {currentKiosk?.queueLength === 0 ? 'Instant / Zero Wait' : `~${(currentKiosk?.queueLength || 1) * 2} mins`}
            </strong>
          </p>
        </div>

        {/* Card 3: Capabilities & Modes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Features</span>
            <Layers className="w-4 h-4 text-brand-600" />
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Supported Sizes:</span>
              <span className="font-bold text-slate-800">
                {currentKiosk?.supportedPaperSizes?.join(', ') || 'A4, A3'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Print Modes:</span>
              <span className="font-bold text-slate-800">
                {currentKiosk?.supportedPrintModes?.includes('COLOR') ? 'B&W + Full Color' : 'Black & White only'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Duplex (2-sided):</span>
              <span className="font-bold text-emerald-600">
                {currentKiosk?.supportedDuplex ? '✓ Supported' : 'Single-side only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Switcher & Help Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-200/80">
        <div className="flex items-center space-x-3 text-xs text-slate-600">
          <span className="font-bold uppercase tracking-wider text-slate-400">Current Kiosk:</span>
          {kiosks.length > 1 ? (
            <select
              value={selectedKioskId}
              onChange={(e) => setSelectedKioskId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {kiosks.map((k) => (
                <option key={k.kioskId} value={k.kioskId}>
                  {k.name} ({k.kioskId})
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-slate-800">{currentKiosk?.name || 'Central Library Kiosk'}</span>
          )}
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="text-xs text-brand-600 hover:text-brand-800 font-bold flex items-center space-x-1 self-start sm:self-auto touch-btn"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How It Works & Accessibility</span>
        </button>
      </div>

      {/* Touch Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <span>How Smart Campus Print Works</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <p><strong>Pick Documents:</strong> Choose pre-uploaded lab manuals or transfer personal files from your phone via QR code.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <p><strong>Configure Settings:</strong> Select Black & White or Color, Copies, Page Ranges, and Duplex printing.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <p><strong>Simulated UPI Pay:</strong> Fast checkout without real currency charges.</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <p><strong>Pick Up & Secure Shred:</strong> Retrieve your prints instantly from the tray. Files are erased immediately from disk.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="touch-btn w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm transition"
            >
              Got It, Let's Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
