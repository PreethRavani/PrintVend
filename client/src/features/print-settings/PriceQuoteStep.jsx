import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle,
  FileText,
  Copy,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Leaf,
  XCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function PriceQuoteStep({ onNext, onBack }) {
  const { quote, printSettings, documents, currentKiosk, submitJob, resetSession } = useKiosk();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleProceedToPayment = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await submitJob();
      onNext();
    } catch (err) {
      setError(err.message || 'Failed to initialize print order');
      setSubmitting(false);
    }
  };

  if (!quote) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-sm">
        Calculating price quote...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2 max-w-2xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
            3/4
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Transparent Price Breakdown
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Review official campus tariff before checkout
            </p>
          </div>
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

      {error && (
        <div className="flex-shrink-0 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Main Breakdown Receipt Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Top Summary Badges */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
              ₹
            </span>
            <span className="font-bold text-slate-800 text-xs">Official Campus Tariff</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
              {quote.paperSize} Standard
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                quote.printMode === 'COLOR'
                  ? 'bg-pink-50 text-pink-700 border border-pink-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {quote.printMode === 'COLOR' ? 'Color' : 'Black & White'}
            </span>
          </div>
        </div>

        {/* Itemized Lines */}
        <div className="space-y-1.5 text-xs py-2 flex-1 flex flex-col justify-around">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Documents ({documents.length} files):</span>
            </span>
            <span className="font-bold text-slate-800">{quote.selectedPagesCount} pages</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copies Requested:</span>
            </span>
            <span className="font-bold text-slate-800">× {quote.copies}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Total Printed Sides:</span>
            </span>
            <span className="font-bold text-slate-900">{quote.totalSides} sides</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              <span>Physical Sheets Required:</span>
            </span>
            <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.2 rounded border border-brand-200">
              {quote.totalSheets} {quote.totalSheets === 1 ? 'Sheet' : 'Sheets'} ({quote.duplex ? 'Duplex' : 'Single-side'})
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-600">Rate per side:</span>
            <span className="font-semibold text-slate-800">
              {quote.currencySymbol}{quote.ratePerSide.toFixed(2)}
            </span>
          </div>

          {quote.discount > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-50 text-emerald-700 font-bold">
              <span>Duplex Eco Discount:</span>
              <span>-{quote.currencySymbol}{quote.discount.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Grand Total Box */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-baseline justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Final Amount Payable
            </span>
            <span className="text-[11px] text-slate-400">Zero hidden fees or service charges</span>
          </div>

          <div className="text-right">
            <span className="text-3xl font-black text-brand-600 tracking-tight">
              {quote.currencySymbol}{quote.totalAmount.toFixed(2)}
            </span>
            <div className="text-[10px] text-slate-400">All campus taxes included</div>
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
          <span>Modify Settings</span>
        </button>

        <button
          onClick={handleProceedToPayment}
          disabled={submitting}
          className="touch-btn px-7 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 flex items-center space-x-2 transition active:scale-95"
        >
          <CreditCard className="w-4 h-4" />
          <span>{submitting ? 'Creating Order...' : 'Continue to Payment'}</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
