import React, { useState } from 'react';
import {
  FileText,
  Palette,
  Copy,
  Layers,
  ArrowRight,
  ArrowLeft,
  Leaf,
  XCircle,
  Sparkles,
  Check,
  CheckCircle2,
  Sliders,
  Maximize2
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

  const handlePresetCopies = (num) => {
    setPrintSettings((prev) => ({ ...prev, copies: num }));
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
      setRangeError('Invalid format. Use "all" or numbers like "1-3, 5".');
      return;
    }

    setRangeError(null);
    setPrintSettings((prev) => ({ ...prev, pageRange: clean }));
  };

  const isA3Supported = currentKiosk?.supportedPaperSizes?.includes('A3') ?? true;
  const isColorSupported = currentKiosk?.supportedPrintModes?.includes('COLOR') ?? true;
  const isDuplexSupported = currentKiosk?.supportedDuplex ?? true;

  return (
    <div className="space-y-4 pb-4">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            2/4
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Configure Print Settings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Customize paper size, color mode, copies, and double-sided settings
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="px-3.5 py-1.5 bg-slate-100 rounded-xl text-slate-700 text-xs font-semibold border border-slate-200">
            {documents.length} {documents.length === 1 ? 'file' : 'files'} ({totalOriginalPages} pages)
          </div>
          <button
            type="button"
            onClick={resetSession}
            className="touch-btn px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1 transition"
            title="Cancel session"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 8-col Settings Studio + 4-col Live Quote Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols): Interactive Settings Studio */}
        <div className="lg:col-span-8 space-y-4">
          {/* Row 1: Paper Size & Color Mode Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Paper Size Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0071e3]" />
                  <span>Paper Size</span>
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {printSettings.paperSize} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* A4 Standard */}
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A4' }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    printSettings.paperSize === 'A4'
                      ? 'border-[#0071e3] bg-blue-50/50 ring-2 ring-[#0071e3] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm text-slate-900">A4 Standard</span>
                    {printSettings.paperSize === 'A4' && (
                      <Check className="w-4 h-4 text-[#0071e3]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-mono text-slate-500 block">210 × 297 mm</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">Standard notes & forms</span>
                  </div>
                </button>

                {/* A3 Poster */}
                <button
                  type="button"
                  disabled={!isA3Supported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A3' }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    !isA3Supported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.paperSize === 'A3'
                      ? 'border-[#0071e3] bg-blue-50/50 ring-2 ring-[#0071e3] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm text-slate-900">A3 Poster</span>
                    {printSettings.paperSize === 'A3' && (
                      <Check className="w-4 h-4 text-[#0071e3]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-mono text-slate-500 block">297 × 420 mm</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5 leading-tight">Posters & big charts</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Print Mode (B/W vs Color) Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#0071e3]" />
                  <span>Color Mode</span>
                </span>
                <span className="text-xs font-semibold text-[#0071e3]">
                  {printSettings.printMode === 'BW' ? '₹2.00 / side' : '₹10.00 / side'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* B/W Tile */}
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'BW' }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    printSettings.printMode === 'BW'
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white text-slate-900'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm">Black & White</span>
                    {printSettings.printMode === 'BW' && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-xs font-semibold block ${printSettings.printMode === 'BW' ? 'text-slate-300' : 'text-slate-700'}`}>
                      ₹2.00 / page
                    </span>
                    <span className={`text-[11px] block mt-0.5 ${printSettings.printMode === 'BW' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Crisp text & fast
                    </span>
                  </div>
                </button>

                {/* Full Color Tile */}
                <button
                  type="button"
                  disabled={!isColorSupported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'COLOR' }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                    !isColorSupported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.printMode === 'COLOR'
                      ? 'border-[#0071e3] bg-blue-50/60 ring-2 ring-[#0071e3] shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm text-slate-900">Full Color</span>
                    {printSettings.printMode === 'COLOR' && (
                      <Check className="w-4 h-4 text-[#0071e3]" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-[#0071e3] block">
                      ₹10.00 / page
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Vivid high-res color
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Number of Copies & Duplex (2-Sided) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Copies Stepper Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-[#0071e3]" />
                  <span>Number of Copies</span>
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {printSettings.copies || 1} {printSettings.copies === 1 ? 'copy' : 'copies'}
                </span>
              </div>

              {/* Stepper with +/- */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopiesChange(-1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl flex items-center justify-center transition border border-slate-200 shadow-2xs"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono font-bold text-3xl text-slate-900 bg-slate-50 py-1.5 rounded-xl border border-slate-200">
                  {printSettings.copies || 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopiesChange(1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl flex items-center justify-center transition border border-slate-200 shadow-2xs"
                >
                  +
                </button>
              </div>

              {/* Quick Presets Pills */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <span className="text-xs text-slate-400 font-medium">Presets:</span>
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePresetCopies(num)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      printSettings.copies === num
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Duplex (2-Sided) Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#0071e3]" />
                  <span>2-Sided (Duplex)</span>
                </span>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span>Eco Saver</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, duplex: false }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    !printSettings.duplex
                      ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                      : 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm">Single-Sided</span>
                    {!printSettings.duplex && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-xs mt-1 block ${!printSettings.duplex ? 'text-slate-300' : 'text-slate-500'}`}>
                    1 page per sheet
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!isDuplexSupported}
                  onClick={() => setPrintSettings((prev) => ({ ...prev, duplex: true }))}
                  className={`touch-btn p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    !isDuplexSupported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.duplex
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-xs'
                      : 'border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="font-bold text-sm text-slate-900">Double-Sided</span>
                    {printSettings.duplex && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <span className="text-xs text-emerald-700 font-medium mt-1 block">
                    Saves 50% paper
                  </span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {printSettings.duplex
                  ? 'Prints on both front & back sides of each physical paper sheet.'
                  : 'Prints on one side of each sheet only.'}
              </p>
            </div>
          </div>

          {/* Row 3: Page Range & Orientation Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Page Range Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Page Range
                </label>
                <input
                  type="text"
                  placeholder='e.g. "all" or "1-5, 8"'
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onBlur={handleRangeBlur}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition"
                />
                <span className="text-xs text-slate-400 mt-1 block">
                  Leave "all" to print entire documents, or enter ranges like 1-3.
                </span>
                {rangeError && <p className="text-xs text-rose-600 mt-1 font-semibold">{rangeError}</p>}
              </div>

              {/* Orientation Choice */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintSettings((prev) => ({ ...prev, orientation: 'PORTRAIT' }))}
                    className={`touch-btn py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                      printSettings.orientation === 'PORTRAIT'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    }`}
                  >
                    Portrait (Vertical)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrintSettings((prev) => ({ ...prev, orientation: 'LANDSCAPE' }))}
                    className={`touch-btn py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition ${
                      printSettings.orientation === 'LANDSCAPE'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                    }`}
                  >
                    Landscape (Horizontal)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Order Summary & Receipt Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-bold text-slate-900">Estimated Quote</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Calc
            </span>
          </div>

          {quoteLoading ? (
            <div className="py-10 text-center text-xs sm:text-sm text-slate-400 space-y-2">
              <Sparkles className="w-5 h-5 text-[#0071e3] animate-spin mx-auto" />
              <span>Calculating price...</span>
            </div>
          ) : quote ? (
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Target Pages:</span>
                <span className="font-bold text-slate-900">{quote.selectedPagesCount} pages</span>
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
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {quote.totalSheets} {quote.totalSheets === 1 ? 'sheet' : 'sheets'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Rate per side:</span>
                <span className="font-bold text-slate-900">
                  {quote.currencySymbol}{quote.ratePerSide}
                </span>
              </div>

              {/* Total Price Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 flex justify-between items-baseline mt-2">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Total Price:</span>
                  <span className="text-[11px] text-slate-400">All campus rates included</span>
                </div>
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {quote.currencySymbol}{quote.totalAmount.toFixed(2)}
                </span>
              </div>

              {quote.duplex && (
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-800 text-xs flex items-center gap-1.5 border border-emerald-200">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Double-sided printing active — saving paper!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-slate-400 text-xs sm:text-sm py-6">No quote available</div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onNext}
              disabled={quoteLoading || !quote || !!rangeError}
              className={`touch-btn w-full py-3.5 rounded-xl text-sm sm:text-base font-semibold shadow-md flex items-center justify-center space-x-2 transition ${
                quote && !rangeError
                  ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <span>Review Price Breakdown</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Docked Navigation Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200">
        <button
          onClick={onBack}
          className="touch-btn px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Selection</span>
        </button>
      </div>
    </div>
  );
}
