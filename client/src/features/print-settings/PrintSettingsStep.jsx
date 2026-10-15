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
  Leaf
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function PrintSettingsStep({ onNext, onBack }) {
  const {
    printSettings,
    setPrintSettings,
    currentKiosk,
    documents,
    quote,
    quoteLoading
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

    // Basic format test
    const isValidFormat = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/.test(clean);
    if (!isValidFormat) {
      setRangeError('Invalid format. Use "all" or numbers like "1-3" or "1,2,4".');
      return;
    }

    setRangeError(null);
    setPrintSettings((prev) => ({ ...prev, pageRange: clean }));
  };

  const isA3Supported = currentKiosk?.supportedPaperSizes?.includes('A3') ?? true;
  const isColorSupported = currentKiosk?.supportedPrintModes?.includes('COLOR') ?? true;
  const isDuplexSupported = currentKiosk?.supportedDuplex ?? true;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 2 of 4</span>
          <h2 className="text-2xl font-bold text-slate-900">Configure Print Settings</h2>
          <p className="text-sm text-slate-500">
            Tailor paper, color mode, copies, and double-sided settings for your documents.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs text-slate-500">Document Total</div>
          <div className="text-sm font-bold text-slate-800">
            {documents.length} {documents.length === 1 ? 'file' : 'files'} ({totalOriginalPages} pages)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Setting 1: Paper Size */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Paper Size</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A4' }))}
                className={`touch-btn p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                  printSettings.paperSize === 'A4'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between w-full">
                  <span className="font-bold text-slate-900">A4 Standard</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    210 × 297 mm
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-1">Recommended for reports, resumes & assignments</span>
              </button>

              <button
                type="button"
                disabled={!isA3Supported}
                onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: 'A3' }))}
                className={`touch-btn p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                  !isA3Supported
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                    : printSettings.paperSize === 'A3'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex justify-between w-full">
                  <span className="font-bold text-slate-900">A3 Poster</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    297 × 420 mm
                  </span>
                </div>
                <span className="text-xs text-slate-500 mt-1">
                  {isA3Supported ? 'Ideal for architectural drawings & posters' : 'Unavailable on this kiosk'}
                </span>
              </button>
            </div>
          </div>

          {/* Setting 2: Color Mode */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-600" />
              <span>Color Mode</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'BW' }))}
                className={`touch-btn p-4 rounded-xl border-2 text-left flex items-center space-x-3 transition ${
                  printSettings.printMode === 'BW'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                  B/W
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Black & White</div>
                  <div className="text-xs text-slate-500">Economy rate (₹2/side)</div>
                </div>
              </button>

              <button
                type="button"
                disabled={!isColorSupported}
                onClick={() => setPrintSettings((prev) => ({ ...prev, printMode: 'COLOR' }))}
                className={`touch-btn p-4 rounded-xl border-2 text-left flex items-center space-x-3 transition ${
                  !isColorSupported
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                    : printSettings.printMode === 'COLOR'
                    ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500 via-amber-400 to-cyan-400 text-white flex items-center justify-center font-bold text-xs">
                  RGB
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Full Color</div>
                  <div className="text-xs text-slate-500">
                    {isColorSupported ? 'High-definition color (₹10/side)' : 'Unavailable on this kiosk'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Setting 3: Copies & Duplex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Copies Stepper */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Copy className="w-4 h-4 text-brand-600" />
                <span>Number of Copies</span>
              </label>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCopiesChange(-1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl flex items-center justify-center transition"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono font-bold text-2xl text-slate-900">
                  {printSettings.copies || 1}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopiesChange(1)}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xl flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Duplex (2-sided) toggle */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>2-Sided (Duplex)</span>
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span>Eco-Saving</span>
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, duplex: false }))}
                  className={`touch-btn flex-1 p-3 rounded-xl border text-xs font-bold transition ${
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
                  className={`touch-btn flex-1 p-3 rounded-xl border text-xs font-bold transition ${
                    !isDuplexSupported
                      ? 'opacity-40 cursor-not-allowed bg-slate-50'
                      : printSettings.duplex
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                  }`}
                >
                  Double-Sided (Duplex)
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {printSettings.duplex
                  ? 'Reduces physical paper sheets consumed by 50%.'
                  : 'Prints on one side of each page.'}
              </p>
            </div>
          </div>

          {/* Setting 4: Page Range & Orientation */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1">
                  Page Range
                </label>
                <input
                  type="text"
                  placeholder='e.g. "all" or "1-5" or "1,3,5"'
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  onBlur={handleRangeBlur}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {rangeError ? (
                  <p className="text-xs text-rose-600 mt-1">{rangeError}</p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1">Leave as "all" to print entire document</p>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-800 block mb-1">
                  Orientation
                </label>
                <select
                  value={printSettings.orientation}
                  onChange={(e) =>
                    setPrintSettings((prev) => ({ ...prev, orientation: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="PORTRAIT">Portrait (Vertical)</option>
                  <option value="LANDSCAPE">Landscape (Horizontal)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Auto-adjusted for slide decks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Quote Summary Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Quote</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700">
                Server-Validated
              </span>
            </div>

            {quoteLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">
                Calculating authoritative price...
              </div>
            ) : quote ? (
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Pages / Copy:</span>
                  <span className="font-semibold text-slate-900">{quote.selectedPagesCount}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Copies:</span>
                  <span className="font-semibold text-slate-900">× {quote.copies}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Total Printed Sides:</span>
                  <span className="font-semibold text-slate-900">{quote.totalSides} sides</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Physical Sheets Consumed:</span>
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {quote.totalSheets} {quote.totalSheets === 1 ? 'sheet' : 'sheets'}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Rate:</span>
                  <span className="font-semibold text-slate-900">
                    {quote.currencySymbol}{quote.ratePerSide} / side
                  </span>
                </div>

                {quote.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Duplex Eco Discount:</span>
                    <span>-{quote.currencySymbol}{quote.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-800">Total Price:</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-brand-600">
                      {quote.currencySymbol}{quote.totalAmount.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-400">All campus taxes included</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm py-4">
                No quote available
              </div>
            )}

            <button
              onClick={onNext}
              disabled={quoteLoading || !quote || !!rangeError}
              className={`touch-btn w-full py-4 rounded-xl text-base font-bold shadow-md flex items-center justify-center space-x-2 transition ${
                quote && !rangeError
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-95'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Review Price Breakdown</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          onClick={onBack}
          className="touch-btn px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>
      </div>
    </div>
  );
}
