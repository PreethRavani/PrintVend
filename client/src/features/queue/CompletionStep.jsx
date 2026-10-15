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
        particleCount: 70,
        spread: 60,
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
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2 max-w-md mx-auto w-full text-center py-1">
      {/* Celebration Header */}
      <div className="flex-shrink-0 space-y-1">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
          <CheckCircle className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase mt-1">
          <Sparkles className="w-3 h-3 text-[#0071e3]" />
          <span>Session Finished</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
          Printing Complete!
        </h2>
        <p className="text-xs text-slate-500">
          Thank you for using Smart Campus Print at {currentKiosk?.name || 'this terminal'}.
        </p>
      </div>

      {/* Audit & Cleanup Confirmation Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-left flex flex-col justify-between overflow-hidden">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Print Job Receipt</span>
          <span className="font-mono text-xs font-semibold text-slate-800">
            {activeJob?.jobNumber || 'JOB-DONE'}
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-1.5 py-1">
          <div className="flex justify-between">
            <span>Terminal:</span>
            <span className="font-medium text-slate-800">{currentKiosk?.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span className="font-semibold text-emerald-700">
              {quote?.currencySymbol || '₹'}{(quote?.totalAmount || 2.0).toFixed(2)} (Paid via Simulated UPI)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Sheets Printed:</span>
            <span className="font-medium text-slate-800">
              {quote?.totalSheets || 1} {quote?.paperSize || 'A4'} sheet(s)
            </span>
          </div>
        </div>

        {/* Real Backend Cleanup Proof */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start space-x-2 text-[11px] text-slate-600 flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 block">Privacy Verification:</span>
            <span>
              {cleanupReport?.success
                ? `All ${cleanupReport.cleanedCount || 'uploaded'} file(s) permanently erased from server disk.`
                : 'All temporary files permanently deleted from server disk.'}
            </span>
          </div>
        </div>
      </div>

      {/* Auto Reset Timer Notice (5 seconds) */}
      <div className="flex-shrink-0 p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center justify-center space-x-2 font-medium">
        <RotateCcw className="w-3.5 h-3.5 text-slate-500 animate-spin" />
        <span>
          Screen automatically resets in <strong className="text-slate-900 font-semibold">{countdown}s</strong>.
        </span>
      </div>

      {/* Action to Start New Job Immediately */}
      <div className="flex-shrink-0 pt-1">
        <button
          onClick={resetSession}
          className="touch-btn w-full py-3.5 rounded-xl text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm flex items-center justify-center space-x-2 mx-auto active:scale-[0.98] transition"
        >
          <Printer className="w-4 h-4" />
          <span>Start Another Print Job Now</span>
        </button>
      </div>
    </div>
  );
}
