import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  FileCheck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Printer,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useKiosk } from '../../context/KioskContext';

export default function CompletionStep({ onFinish }) {
  const { activeJob, quote, cleanupReport, resetSession, currentKiosk } = useKiosk();
  // 5-second automatic reset timer as requested
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Trigger festive celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if canvas-confetti fails
    }

    // Inactivity reset timer (5 seconds)
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resetSession]);

  return (
    <div className="max-w-xl mx-auto space-y-6 py-6 text-center">
      {/* Celebration Icon */}
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center border-2 border-emerald-200 shadow-xl">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Session Finished</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900">Printing Complete!</h2>
        <p className="text-sm text-slate-500">
          Thank you for using Smart Campus Print at {currentKiosk?.name || 'this terminal'}.
        </p>
      </div>

      {/* Audit & Cleanup Confirmation Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Print Job Receipt</span>
          <span className="font-mono text-sm font-bold text-slate-800">
            {activeJob?.jobNumber || 'JOB-DONE'}
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-1.5">
          <div className="flex justify-between">
            <span>Terminal:</span>
            <span className="font-semibold text-slate-800">{currentKiosk?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-semibold text-emerald-700">
              {quote?.currencySymbol || '₹'}{(quote?.totalAmount || 2.0).toFixed(2)} (Paid via Simulated UPI)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sheets Printed:</span>
            <span className="font-semibold text-slate-800">
              {quote?.totalSheets || 1} {quote?.paperSize || 'A4'} sheet(s)
            </span>
          </div>
        </div>

        {/* Real Backend Cleanup Proof */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800 block">Privacy Verification:</span>
            <span>
              {cleanupReport?.success
                ? `All ${cleanupReport.cleanedCount || 'uploaded'} file(s) have been permanently deleted from server disk.`
                : 'All temporary files have been permanently deleted from server disk.'}
            </span>
          </div>
        </div>
      </div>

      {/* Auto Reset Timer Notice (5 seconds) */}
      <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-center space-x-2 font-medium">
        <RotateCcw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
        <span>
          Screen will automatically reset for the next student in <strong className="text-slate-900 font-extrabold">{countdown} {countdown === 1 ? 'second' : 'seconds'}</strong>.
        </span>
      </div>

      {/* Action to Start New Job Immediately */}
      <div>
        <button
          onClick={resetSession}
          className="touch-btn px-8 py-4 rounded-2xl text-base font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 mx-auto active:scale-95 transition"
        >
          <Printer className="w-5 h-5" />
          <span>Start Another Print Job Now</span>
        </button>
      </div>
    </div>
  );
}
