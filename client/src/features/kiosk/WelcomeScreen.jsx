import React, { useState } from 'react';
import {
  Printer,
  FileUp,
  Sparkles,
  Layers,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  X,
  MapPin,
  Lock
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import workflowStepsImg from '../../assets/workflow-steps-transparent.png';
import heroVideo from '../../assets/hero-video.mp4';

export default function WelcomeScreen({ onStartSession }) {
  const { currentKiosk, sessionLoading } = useKiosk();
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Enabled by default unless explicitly in OFFLINE or MAINTENANCE
  const isOnline = currentKiosk ? currentKiosk.status !== 'OFFLINE' && currentKiosk.status !== 'MAINTENANCE' : true;

  return (
    <div className="w-full max-w-7xl mx-auto py-1">
      {/* 3-Column Flanked Kiosk Dashboard - Fits Completely within One Viewport without Vertical Scroll */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* LEFT COLUMN (lg:col-span-3): Hardware Health & Terminal Node */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3.5 order-2 lg:order-1">
          {/* Card 1: Kiosk Hardware Health */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Hardware Health</span>
                  <span className="text-[10px] text-slate-400">Live Diagnostics</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                  isOnline
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {currentKiosk?.status || 'ONLINE'}
              </span>
            </div>

            <div className="space-y-2 py-1 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span className="font-medium text-[11px]">Paper Tray (A4/A3):</span>
                  <span className="font-bold text-slate-900 text-[11px]">{currentKiosk?.paperLevel || 79}% full</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${currentKiosk?.paperLevel || 79}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Black Toner</span>
                  <span className="text-xs font-bold text-slate-800">{currentKiosk?.tonerBlack || 85}%</span>
                  <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                    <div className="bg-slate-800 h-1 rounded-full" style={{ width: `${currentKiosk?.tonerBlack || 85}%` }} />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Color Toner</span>
                  <span className="text-xs font-bold text-slate-800">{currentKiosk?.tonerColor || 76}%</span>
                  <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                    <div className="bg-gradient-to-r from-cyan-500 via-pink-500 to-yellow-500 h-1 rounded-full" style={{ width: `${currentKiosk?.tonerColor || 76}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Terminal Location & Sandbox Security */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Terminal Location</span>
                <span className="text-[10px] text-slate-500">{currentKiosk?.name || 'Central Library - Ground Floor'}</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-[11px]">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Kiosk ID:</span>
                <span className="font-mono font-bold text-slate-800">{currentKiosk?.kioskId || 'KIOSK-LIB-01'}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-medium">Privacy:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-Shred Files
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN (lg:col-span-6): Hero CTA Banner + 4-Step Workflow Banner */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-3.5 order-1 lg:order-2">
          {/* Obsidian Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] border border-slate-800 p-5 sm:p-6 text-white shadow-xl flex-1 flex flex-col justify-center">
            {/* Ambient Radial Lights */}
            <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
              {/* Left Text & CTA */}
              <div className="sm:col-span-7 space-y-2.5">
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80 text-[10px] font-semibold tracking-wide animate-pulse-subtle">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <Sparkles className="w-3 h-3 text-[#0071e3]" />
                  <span>Self-Service Kiosk</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
                  Print Your Documents in Seconds.
                </h2>

                <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed">
                  No lines, no thumb drives. Choose pre-uploaded college documents or transfer files instantly from your phone.
                </p>

                {/* Primary Touch CTA Button */}
                <div className="pt-1.5">
                  <button
                    onClick={() => onStartSession()}
                    disabled={!isOnline || sessionLoading}
                    className={`touch-btn px-7 py-3 rounded-2xl text-sm sm:text-base font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2.5 ${
                      isOnline && !sessionLoading
                        ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    }`}
                  >
                    <FileUp className="w-4 h-4 text-white" />
                    <span>{sessionLoading ? 'Starting Session...' : 'Start Printing Now'}</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Right Video Visual (1:1 Ratio) */}
              <div className="sm:col-span-5 flex items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black aspect-square flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/15 via-transparent to-emerald-500/10 pointer-events-none z-10" />
                  <video
                    src={heroVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4-Step Quick Workflow Guide (User Image with Background Removed) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#111827] to-[#0d131f] border border-slate-800/90 p-2 sm:p-2.5 shadow-lg">
            <div className="absolute -left-12 -top-12 w-36 h-36 bg-[#0071e3]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <img
              src={workflowStepsImg}
              alt="Scan. Upload. Pay. Collect. - Quick 4-step self-service kiosk workflow"
              className="relative z-10 w-full h-auto object-contain select-none pointer-events-none drop-shadow-md"
              loading="eager"
            />
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-3): Supported Formats & How It Works Guide */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-3.5 order-3 lg:order-3">
          {/* Card 3: Supported Formats & Specs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">Formats & Specs</span>
                  <span className="text-[10px] text-slate-400">High-Res Laser</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                35 PPM
              </span>
            </div>

            <div className="space-y-1.5 py-1 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium text-[11px]">Paper Sizes:</span>
                <span className="font-bold text-slate-900 text-[11px]">
                  {currentKiosk?.supportedPaperSizes?.join(', ') || 'A4, A3'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-medium text-[11px]">Print Modes:</span>
                <span className="font-bold text-slate-900 text-[11px]">
                  {currentKiosk?.supportedPrintModes?.includes('COLOR') ? 'B&W + Color' : 'B&W only'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-medium text-[11px]">Duplex:</span>
                <span className="font-bold text-emerald-600 text-[11px]">
                  {currentKiosk?.supportedDuplex ? 'Double-Sided (Eco)' : 'Single'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: How It Works Interactive Guide Trigger */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block leading-tight">Touchscreen Ready</span>
                <span className="text-[10px] text-slate-400">Contactless UPI Checkout</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(true)}
              className="touch-btn w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0071e3] text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How It Works Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>How CampusPrint Works</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">1</span>
                <p><strong>Pick Documents:</strong> Choose pre-uploaded lab manuals or transfer personal files via mobile QR.</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">2</span>
                <p><strong>Configure:</strong> Choose B&W or Color, Copies, Page Ranges, and Duplex printing.</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">3</span>
                <p><strong>Simulated UPI Pay:</strong> Fast sandbox checkout without real money.</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">4</span>
                <p><strong>Collect & Shred:</strong> Retrieve prints from tray. Files are erased immediately.</p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="touch-btn w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-2.5 rounded-xl text-xs transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

