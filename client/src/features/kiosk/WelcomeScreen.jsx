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
  X
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
    <div className="max-w-4xl mx-auto space-y-4 py-1 w-full">
      {/* Hero Touch Banner - Catchy Modern Apple Obsidian Aesthetic with 1:1 Video Visual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        {/* Soft Ambient Radial Lights */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left Text & CTA */}
          <div className="md:col-span-7 space-y-3.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/90 text-slate-200 border border-slate-700/80 text-xs font-semibold tracking-wide shadow-xs animate-pulse-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              <span>Smart Self-Service Printing Kiosk</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-tight">
              Print Your Documents in Seconds.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              No lines, no thumb drives, no hassle. Choose pre-uploaded official college documents or transfer files instantly from your mobile phone.
            </p>

            {/* Prominent Touch Button with Tactile Hover & Scale */}
            <div className="pt-2">
              <button
                onClick={() => onStartSession()}
                disabled={!isOnline || sessionLoading}
                className={`touch-btn px-8 py-3.5 rounded-2xl text-base sm:text-lg font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-3 ${
                  isOnline && !sessionLoading
                    ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                }`}
              >
                <FileUp className="w-5 h-5 text-white" />
                <span>{sessionLoading ? 'Starting Session...' : 'Start Printing Now'}</span>
                <ChevronRight className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>

          {/* Right Video Visual (1:1 Ratio as requested) */}
          <div className="md:col-span-5 flex items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black aspect-square flex items-center justify-center group">
              {/* Subtle ambient lighting */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0071e3]/15 via-transparent to-emerald-500/10 pointer-events-none z-10" />

              <video
                src={heroVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step Quick Workflow Guide (User Image with Background Removed) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#111827] to-[#0d131f] border border-slate-800/90 p-3 sm:p-4 shadow-xl">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-[#0071e3]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <img
          src={workflowStepsImg}
          alt="Scan. Upload. Pay. Collect. - Quick 4-step self-service kiosk workflow"
          className="relative z-10 w-full h-auto object-contain select-none pointer-events-none drop-shadow-md"
          loading="eager"
        />
      </div>

      {/* Terminal Health & Capabilities (2 Spacious, Beautiful Cards - No Redundant Queue Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Operational Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">Kiosk Hardware Health</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {currentKiosk?.status || 'ONLINE'}
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-600">
              <span className="font-medium">Paper Tray (A4/A3):</span>
              <span className="font-bold text-slate-900">{currentKiosk?.paperLevel || 94}% full</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{ width: `${currentKiosk?.paperLevel || 94}%` }}
              />
            </div>

            <div className="flex justify-between text-slate-500 text-xs pt-1">
              <span>Black Toner: <strong className="text-slate-800">{currentKiosk?.tonerBlack || 88}%</strong></span>
              <span>Color Toner: <strong className="text-slate-800">{currentKiosk?.tonerColor || 76}%</strong></span>
            </div>
          </div>
        </div>

        {/* Card 2: Capabilities & Modes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900">Supported Formats & Specs</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              High Speed
            </span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Paper Sizes:</span>
              <span className="font-bold text-slate-900">
                {currentKiosk?.supportedPaperSizes?.join(', ') || 'A4, A3'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Print Modes:</span>
              <span className="font-bold text-slate-900">
                {currentKiosk?.supportedPrintModes?.includes('COLOR') ? 'Black & White + Full Color' : 'B&W only'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Duplex (Double-Sided):</span>
              <span className="font-bold text-emerald-600">
                {currentKiosk?.supportedDuplex ? 'Supported (Eco Saver)' : 'Single only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Info & How It Works Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs sm:text-sm">
        <div className="text-slate-500 font-medium flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{currentKiosk?.name || 'Central Library Terminal'}</span>
          <span>•</span>
          <span>Self-Service Kiosk #1</span>
        </div>

        <button
          onClick={() => setShowHelpModal(true)}
          className="text-xs font-semibold text-[#0071e3] hover:text-[#0077ed] flex items-center space-x-1 touch-btn"
        >
          <HelpCircle className="w-4 h-4" />
          <span>How It Works</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>How Smart Campus Print Works</span>
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
