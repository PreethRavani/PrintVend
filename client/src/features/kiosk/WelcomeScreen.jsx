import React, { useState } from 'react';
import {
  Printer,
  QrCode,
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

export default function WelcomeScreen({ onStartSession, onShowQrModal }) {
  const { currentKiosk, kiosks, setSelectedKioskId, selectedKioskId, kiosksLoading, sessionLoading } = useKiosk();
  const [studentIdInput, setStudentIdInput] = useState('');
  const [showStudentIdField, setShowStudentIdField] = useState(false);
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
            No lines, no thumb drives, no hassle. Upload directly on this touchscreen or scan the QR code to transfer assignments from your phone.
          </p>

          {/* Student ID toggle (Optional for guest printing) */}
          <div className="pt-2">
            {!showStudentIdField ? (
              <button
                type="button"
                onClick={() => setShowStudentIdField(true)}
                className="text-xs text-brand-300 hover:text-brand-200 underline flex items-center gap-1 font-medium"
              >
                + Optional: Enter Student Roll No. / Faculty ID
              </button>
            ) : (
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  placeholder="e.g. 2026-CS-042"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  className="px-3 py-2 bg-slate-800/90 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowStudentIdField(false)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Touch Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onStartSession(studentIdInput)}
              disabled={!isOnline || sessionLoading}
              className={`touch-btn px-8 py-4 rounded-2xl text-lg font-bold shadow-xl transition-all flex items-center justify-center space-x-3 ${
                isOnline && !sessionLoading
                  ? 'bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <FileUp className="w-6 h-6" />
              <span>{sessionLoading ? 'Starting Session...' : 'Start Printing'}</span>
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>

            <button
              onClick={onShowQrModal}
              disabled={!isOnline || sessionLoading}
              className="touch-btn px-6 py-4 rounded-2xl text-base font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-600/80 shadow-md flex items-center justify-center space-x-3 transition active:scale-95"
            >
              <QrCode className="w-5 h-5 text-cyan-400" />
              <span>Scan QR from Phone</span>
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

          <p className="text-xs text-slate-600 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Estimated wait: <strong>{currentKiosk?.estimatedWaitMinutes || 0} min</strong> (Average spool speed ~12 pages/min)
            </span>
          </p>
        </div>

        {/* Card 3: Printing Capabilities */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Features Supported</span>
            <Layers className="w-4 h-4 text-brand-600" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
              A4 Size
            </span>
            {currentKiosk?.supportedPaperSizes?.includes('A3') && (
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                A3 Poster
              </span>
            )}
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
              Black & White
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
              Full Color
            </span>
            {currentKiosk?.supportedDuplex && (
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">
                Duplex (2-Sided)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500">
            PDF, JPG, JPEG & PNG supported up to 25MB.
          </p>
        </div>
      </div>

      {/* Available Kiosks across campus */}
      {kiosks.length > 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-brand-600" />
              <h2 className="text-base font-bold text-slate-800">Campus-Wide Kiosks Network</h2>
            </div>
            <span className="text-xs text-slate-500">Need a shorter line? Pick another operational terminal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {kiosks.map((k) => (
              <button
                key={k.kioskId}
                onClick={() => setSelectedKioskId(k.kioskId)}
                className={`text-left p-3.5 rounded-xl border transition ${
                  k.kioskId === selectedKioskId
                    ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900">{k.kioskId}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      k.status === 'ONLINE' ? 'bg-emerald-500' : k.status === 'BUSY' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-700 font-medium truncate">{k.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{k.location}</div>
                <div className="mt-2 text-[10px] text-slate-600 flex justify-between">
                  <span>Queue: {k.queueLength}</span>
                  <span>~{k.estimatedWaitMinutes} min</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Guarantee & Help Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-100 rounded-xl text-xs text-slate-600 gap-3">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>
            <strong>Zero-Trace Guarantee:</strong> Uploaded documents are automatically deleted immediately after collection or session expiry.
          </span>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="text-brand-600 hover:text-brand-700 font-semibold flex items-center space-x-1"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Need Assistance?</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">How to Print on Smart Campus</h3>
            <ol className="text-sm text-slate-600 space-y-2.5 list-decimal pl-5">
              <li>Tap <strong>Start Printing</strong> or scan the QR code using your smartphone.</li>
              <li>Upload your assignment or lecture slides (PDF, JPG, PNG).</li>
              <li>Select your options: Paper size (A4/A3), Black & White or Color, Copies, Page Range, and Duplex.</li>
              <li>Review the calculated price and pay via simulated UPI test transaction.</li>
              <li>Wait for your documents to print and pick them up at the dispenser tray!</li>
            </ol>
            <button
              onClick={() => setShowHelpModal(false)}
              className="touch-btn w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-4"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
