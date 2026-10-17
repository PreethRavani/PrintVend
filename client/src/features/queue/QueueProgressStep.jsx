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
    <div className="max-w-xl mx-auto w-full space-y-4 py-2">
      {/* Top Header */}
      <div className="flex-shrink-0 text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold uppercase tracking-wider">
          <CheckCircle className="w-3 h-3" />
          <span>Payment Approved • Dispenser Active</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
          Printing in Progress
        </h2>
        <p className="text-xs text-slate-500">
          Your documents are being spooled and printed.
        </p>
      </div>

      {/* Progress & Live Tracker Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3.5 overflow-hidden">
        {/* Animated Printer Visualizer */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 py-1 flex-shrink-0">
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                isReady
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isPrinting
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-800 text-white'
              }`}
            >
              <Printer className="w-10 h-10" />
            </div>

            {!isReady && (
              <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-xs border border-slate-200">
                <Loader2 className="w-4 h-4 text-[#0071e3] animate-spin" />
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Current Phase</div>
            <div className="text-lg font-semibold text-slate-900 leading-tight">
              {isReady
                ? 'Ready for Collection!'
                : isPrinting
                ? 'Printing Physical Sheets...'
                : 'Job Queued in Spooler'}
            </div>
          </div>
        </div>

        {/* Live Progress Bar */}
        <div className="space-y-1 py-1 flex-shrink-0">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Progress</span>
            <span className="font-mono text-slate-900 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isReady ? 'bg-emerald-600' : 'bg-[#0071e3]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Job Number</span>
            <span className="text-xs font-mono font-bold text-slate-900 truncate block mt-0.5">
              {activeJob?.jobNumber || 'JOB-ACTIVE'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kiosk Station</span>
            <span className="text-xs font-semibold text-slate-900 truncate block mt-0.5">
              {currentKiosk?.name || activeJob?.kioskId}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Queue Rank</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {queuePos === 1 ? 'Next to Print (#1)' : `Position #${queuePos}`}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Wait</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              ~{waitMin} {waitMin === 1 ? 'min' : 'mins'}
            </span>
          </div>
        </div>

        {/* Fast-Forward Simulation Demo Button */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
          <button
            onClick={handleFastForward}
            className="touch-btn px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-xl flex items-center space-x-1.5 transition"
            title="Fast forward simulation tick"
          >
            <FastForward className="w-3 h-3 text-brand-600" />
            <span>Fast-Forward (Lab Demo)</span>
          </button>

          <span className="text-[10px] text-slate-400 italic">
            Auto-refreshes every 2.5s
          </span>
        </div>
      </div>

      {/* Docked Action button when ready */}
      {isReady && (
        <div className="flex-shrink-0 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={onReadyForCollection}
            className="touch-btn w-full py-3.5 rounded-xl text-base font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm flex items-center justify-center space-x-2 transition active:scale-[0.98]"
          >
            <span>Collect Printed Documents</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}
    </div>
  );
}
