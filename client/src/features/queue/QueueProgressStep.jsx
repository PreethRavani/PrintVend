import React from 'react';
import {
  Printer,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  FastForward,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { simulateStep } from '../../services/jobService';

export default function QueueProgressStep({ onReadyForCollection }) {
  const { activeJob, jobStatus, currentKiosk } = useKiosk();

  const status = jobStatus?.status || activeJob?.status || 'QUEUED';
  const queuePos = jobStatus?.queuePosition ?? activeJob?.queuePosition ?? 1;
  const waitMin = jobStatus?.estimatedWaitMinutes ?? activeJob?.estimatedWaitMinutes ?? 1;
  const progressPercent = jobStatus?.printingProgressPercentage ?? (status === 'READY_FOR_COLLECTION' ? 100 : 25);

  const isPrinting = status === 'PRINTING';
  const isReady = status === 'READY_FOR_COLLECTION';

  const handleFastForward = async () => {
    if (activeJob?.jobNumber) {
      try {
        await simulateStep(activeJob.jobNumber);
      } catch (e) {
        console.error('Fast forward step error:', e);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Payment Confirmed • Job In Spooler</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Printing in Progress</h2>
        <p className="text-sm text-slate-500">
          Your document has been sent to the physical dispenser queue.
        </p>
      </div>

      {/* Progress & Live Tracker Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
        {/* Animated Printer Visualizer */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div
              className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all ${
                isReady
                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105'
                  : isPrinting
                  ? 'bg-brand-600 text-white shadow-xl shadow-brand-500/30 animate-pulse'
                  : 'bg-slate-800 text-white shadow-lg'
              }`}
            >
              <Printer className="w-14 h-14" />
            </div>

            {/* Spinner indicator when working */}
            {!isReady && (
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md border border-slate-200">
                <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Phase</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">
              {isReady
                ? 'Ready for Collection!'
                : isPrinting
                ? 'Printing Physical Sheets...'
                : 'Job Queued in Spooler'}
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-600">
            <span>Progress</span>
            <span className="font-mono text-brand-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isReady
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-brand-500 to-cyan-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Job Number</span>
            <span className="text-base font-mono font-bold text-slate-900 mt-1 block">
              {activeJob?.jobNumber || 'JOB-ACTIVE'}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Kiosk Station</span>
            <span className="text-sm font-semibold text-slate-900 mt-1 block truncate">
              {currentKiosk?.name || activeJob?.kioskId}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Queue Rank</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              {queuePos === 1 ? 'Next to Print (#1)' : `Position #${queuePos}`}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Estimated Wait</span>
            <span className="text-base font-bold text-slate-900 mt-1 block">
              ~{waitMin} {waitMin === 1 ? 'minute' : 'minutes'}
            </span>
          </div>
        </div>

        {/* Fast-Forward Simulation Button (For rapid testing / lab demo) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleFastForward}
            className="touch-btn px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition"
            title="Fast forward simulation tick"
          >
            <FastForward className="w-3.5 h-3.5 text-brand-600" />
            <span>Fast-Forward Printer (Lab Demo)</span>
          </button>

          <span className="text-[11px] text-slate-400 italic">
            Auto-refreshes every 2.5 seconds
          </span>
        </div>

        {/* If Ready, Prominent Collect Action */}
        {isReady && (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={onReadyForCollection}
              className="touch-btn w-full py-4 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <span>Collect Printed Documents</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
