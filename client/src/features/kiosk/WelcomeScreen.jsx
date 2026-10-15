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
  const { currentKiosk, kiosks, setSelectedKioskId, selectedKioskId, sessionLoading } = useKiosk();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Enabled by default unless explicitly in OFFLINE or MAINTENANCE
  const isOnline = currentKiosk ? currentKiosk.status !== 'OFFLINE' && currentKiosk.status !== 'MAINTENANCE' : true;

  return (
    <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4 py-1 sm:py-2 w-full">
      {/* Hero Touch Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 via-navy-900 to-slate-900 border border-slate-700/60 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-6 opacity-10 hidden lg:block">
          <Printer className="w-48 h-48 text-brand-400" />
        </div>

        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 text-cyan-300 border border-brand-400/30 text-[11px] font-semibold tracking-wide">
            <Sparkles className="w-3 h-3" />
            <span>Fast, Privacy-First Self-Service Printing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Print Your Documents in Seconds.
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            No lines, no thumb drives, no hassle. Choose pre-uploaded college documents or transfer assignments directly from your phone.
          </p>

          {/* Single Prominent Primary Action Touch Button */}
          <div className="pt-2">
            <button
              onClick={() => onStartSession()}
              disabled={!isOnline || sessionLoading}
              className={`touch-btn px-8 py-3.5 rounded-2xl text-base font-bold shadow-lg transition-all flex items-center justify-center space-x-2.5 ${
                isOnline && !sessionLoading
                  ? 'bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileUp className="w-5 h-5" />
              <span>{sessionLoading ? 'Starting Session...' : 'Start Printing'}</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Terminal Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Operational Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kiosk Health</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {currentKiosk?.status || 'ONLINE'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Paper Tray (A4/A3):</span>
              <span className="font-bold text-slate-800">{currentKiosk?.paperLevel || 94}% full</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-brand-500 h-1.5 rounded-full"
                style={{ width: `${currentKiosk?.paperLevel || 94}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-500 text-[10px] pt-0.5">
              <span>Black Toner: {currentKiosk?.tonerBlack || 88}%</span>
              <span>Color Toner: {currentKiosk?.tonerColor || 76}%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Queue & Wait Estimate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Queue Status</span>
            <Clock className="w-3.5 h-3.5 text-brand-600" />
          </div>

          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black text-slate-900">
              {currentKiosk?.queueLength || 0}
            </span>
            <span className="text-xs text-slate-500">jobs in queue</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Estimated wait time:{' '}
            <strong className="text-slate-700">
              {currentKiosk?.queueLength === 0 ? 'Instant / Zero Wait' : `~${(currentKiosk?.queueLength || 1) * 2} mins`}
            </strong>
          </p>
        </div>

        {/* Card 3: Capabilities & Modes */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Features</span>
            <Layers className="w-3.5 h-3.5 text-brand-600" />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Paper Sizes:</span>
              <span className="font-bold text-slate-800">
                {currentKiosk?.supportedPaperSizes?.join(', ') || 'A4, A3'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Print Modes:</span>
              <span className="font-bold text-slate-800">
                {currentKiosk?.supportedPrintModes?.includes('COLOR') ? 'B&W + Color' : 'B&W only'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Duplex (2-sided):</span>
              <span className="font-bold text-emerald-600">
                {currentKiosk?.supportedDuplex ? '✓ Supported' : 'Single only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Switcher & Help Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/70 text-xs">
        <div className="flex items-center space-x-2 text-slate-600 text-[11px]">
          <span className="font-bold uppercase tracking-wider text-slate-400">Kiosk:</span>
          {kiosks.length > 1 ? (
            <select
              value={selectedKioskId}
              onChange={(e) => setSelectedKioskId(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2 py-1 font-semibold text-slate-800 focus:outline-none"
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
          className="text-[11px] text-brand-600 hover:text-brand-800 font-bold flex items-center space-x-1 touch-btn"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>How It Works</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>How Smart Campus Print Works</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <p><strong>Pick Documents:</strong> Choose pre-uploaded lab manuals or transfer personal files via mobile QR.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <p><strong>Configure:</strong> Choose B&W or Color, Copies, Page Ranges, and Duplex printing.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <p><strong>Simulated UPI Pay:</strong> Fast sandbox checkout without real money.</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                <p><strong>Collect & Shred:</strong> Retrieve prints from tray. Files are erased immediately.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="touch-btn w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
