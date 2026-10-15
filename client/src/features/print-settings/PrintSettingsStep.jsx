import React, { useState } from 'react';
import {
  Settings2,
  FileText,
  Palette,
  Copy,
  Layers,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Leaf,
  XCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function PrintSettingsStep({ onNext, onBack }) {
  const {
    printSettings,
    setPrintSettings,
    currentKiosk,
    documents,
    quote,
    quoteLoading,
    resetSession
  } = useKiosk();

  const [rangeInput, setRangeInput] = useState(printSettings.pageRange || 'all');
  const [rangeError, setRangeError] = useState(null);

  const totalOriginalPages = documents.reduce((sum, d) => sum + (d.pageCount || 1), 0);

  const handleCopiesChange = (delta) => {
    const nextVal = Math.max(1, Math.min(50, (printSettings.copies || 1) + delta));
    setPrintSettings((prev) => ({ ...prev, copies: nextVal }));
  };

  const handleRangeBlur = () => {
    const clean = rangeInput.trim().toLowerCase();
    if (!clean || clean === 'all') {
      setRangeError(null);
      setPrintSettings((prev) => ({ ...prev, pageRange: 'all' }));
      return;
    }

    const isValidFormat = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/.test(clean);
    if (!isValidFormat) {
      setRangeError('Invalid format. Use "all" or numbers like "1-3".');
      return;
    }

    setRangeError(null);
    setPrintSettings((prev) => ({ ...prev, pageRange: clean }));
  };

  const isA3Supported = currentKiosk?.supportedPaperSizes?.includes('A3') ?? true;
  const isColorSupported = currentKiosk?.supportedPrintModes?.includes('COLOR') ?? true;
  const isDuplexSupported = currentKiosk?.supportedDuplex ?? true;

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            2/4
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Configure Print Settings
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Choose paper, color mode, copies, and double-sided settings
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-bold border border-slate-200">
            {documents.length} {documents.length === 1 ? 'file' : 'files'} ({totalOriginalPages} pages)
          </div>
          <button
            type="button"
            onClick={resetSession}
            className="touch-btn px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition"
            title="Cancel session"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Compact 8-col Settings + 4-col Quote Card (fits 100% on screen) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
        {/* Left Column (8 cols): Interactive Settings */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-2 overflow-hidden">
          {/* Row 1: Paper Size & Color Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
            {/* Paper Size */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1">
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>Paper Size</span>
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A4' }))}
                  className={`touch-btn p-2 rounded-xl border-2 text-left flex flex-col justify-center transition ${
                    printSettings.paperSize === 'A4'
                      ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-xs text-slate-900">A4 Standard</span>
                  <span className="text-[10px] text-slate-500">210 × 297 mm</span>
                </button>

                <button
                  type="button"
                  disabled={!isA3Supported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A3' }))}
                  className={`touch-btn p-2 rounded-xl border-2 text-left flex flex-col justify-center transition ${
                    !isA3Supported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.paperSize === 'A3'
                      ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="font-extrabold text-xs text-slate-900">A3 Poster</span>
                  <span className="text-[10px] text-slate-500">297 × 420 mm</span>
                </button>
              </div>
            </div>

            {/* Color Mode */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1">
                <Palette className="w-3.5 h-3.5 text-brand-600" />
                <span>Print Mode</span>
              </span>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'BW' }))}
                  className={`touch-btn p-2 rounded-xl border-2 text-left flex items-center space-x-2 transition ${
                    printSettings.printMode === 'BW'
                      ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[10px]">
                    B/W
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Black & White</div>
                    <div className="text-[10px] text-slate-500">₹2 / side</div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!isColorSupported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'COLOR' }))}
                  className={`touch-btn p-2 rounded-xl border-2 text-left flex items-center space-x-2 transition ${
                    !isColorSupported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.printMode === 'COLOR'
                      ? 'border-brand-600 bg-brand-50/70 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400 text-white flex items-center justify-center font-bold text-[10px]">
                    RGB
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Full Color</div>
                    <div className="text-[10px] text-slate-500">₹10 / side</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Copies & Duplex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-h-0">
            {/* Copies Stepper */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pb-1">
                <Copy className="w-3.5 h-3.5 text-brand-600" />
                <span>Number of Copies</span>
              </span>
              <div className="flex items-center space-x-3 mt-1">
                <button
                  type="button"
                  onClick={() => handleCopiesChange(-1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg flex items-center justify-center transition"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono font-black text-xl text-slate-900">
                  {printSettings.copies || 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopiesChange(1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-lg flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Duplex (2-Sided) */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                  <span>2-Sided (Duplex)</span>
                </span>
                <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                  <Leaf className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Eco</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, duplex: false }))}
                  className={`touch-btn p-2 rounded-xl border text-xs font-bold transition ${
                    !printSettings.duplex
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Single-Sided
                </button>

                <button
                  type="button"
                  disabled={!isDuplexSupported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, duplex: true }))}
                  className={`touch-btn p-2 rounded-xl border text-xs font-bold transition ${
                    !isDuplexSupported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.duplex
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Double-Sided
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Page Range & Orientation */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">
                  Page Range
                </label>
                <input
                  type="text"
                  placeholder='e.g. "all" or "1-5"'
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onBlur={handleRangeBlur}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                {rangeError && <p className="text-[10px] text-rose-600 mt-0.5">{rangeError}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-0.5">
                  Orientation
                </label>
                <select
                  value={printSettings.orientation}
                  onChange={(e) =>
                    setPrintSettings((prev) => ({ ...prev, orientation: e.target.value }))
                  }
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="PORTRAIT">Portrait (Vertical)</option>
                  <option value="LANDSCAPE">Landscape (Horizontal)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Quote Summary Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Quote</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Live Calc
            </span>
          </div>

          {quoteLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Calculating authoritative price...
            </div>
          ) : quote ? (
            <div className="space-y-2 text-xs py-1">
              <div className="flex justify-between text-slate-600">
                <span>Target Pages:</span>
                <span className="font-bold text-slate-900">{quote.selectedPagesCount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Copies:</span>
                <span className="font-bold text-slate-900">× {quote.copies}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Printed Sides:</span>
                <span className="font-bold text-slate-900">{quote.totalSides} sides</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paper Sheets:</span>
                <span className="font-bold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200">
                  {quote.totalSheets} {quote.totalSheets === 1 ? 'sheet' : 'sheets'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate per side:</span>
                <span className="font-semibold text-slate-900">
                  {quote.currencySymbol}{quote.ratePerSide}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-800">Total Price:</span>
                <span className="text-2xl font-black text-brand-600">
                  {quote.currencySymbol}{quote.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs py-4">No quote available</div>
          )}

          <div className="pt-2 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={onNext}
              disabled={quoteLoading || !quote || !!rangeError}
              className={`touch-btn w-full py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition ${
                quote && !rangeError
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Review Price Breakdown</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Docked Navigation Footer */}
      <div className="flex-shrink-0 pt-2 flex items-center justify-between border-t border-slate-200">
        <button
          onClick={onBack}
          className="touch-btn px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Upload</span>
        </button>
      </div>
    </div>
  );
}
