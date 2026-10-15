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
  Leaf
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function PriceQuoteStep({ onNext, onBack }) {
  const { quote, printSettings, documents, currentKiosk, submitJob } = useKiosk();
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
      <div className="py-12 text-center text-slate-500">
        Calculating price quote...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Step Header */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 3 of 4</span>
        <h2 className="text-3xl font-extrabold text-slate-900">Transparent Price Breakdown</h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Review your itemized print configuration before proceeding to simulated payment.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Main Breakdown Receipt Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400" />

        {/* Top Summary Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              ₹
            </span>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase">Pricing Engine</span>
              <div className="font-bold text-slate-800 text-sm">Official Campus Tariff</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              {quote.paperSize} Standard
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                quote.printMode === 'COLOR'
                  ? 'bg-gradient-to-r from-pink-500/10 to-cyan-500/10 text-brand-700 border border-brand-200'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {quote.printMode === 'COLOR' ? 'Color Mode' : 'Black & White'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Uploaded Documents ({documents.length}):</span>
            </span>
            <span className="font-medium text-slate-800">{quote.selectedPagesCount} target pages</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 flex items-center gap-2">
              <Copy className="w-4 h-4 text-slate-400" />
              <span>Copies Requested:</span>
            </span>
            <span className="font-medium text-slate-800">× {quote.copies}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Total Printed Sides:</span>
            </span>
            <span className="font-semibold text-slate-900">{quote.totalSides} sides</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" />
              <span>Physical Sheets Required:</span>
            </span>
            <div className="text-right">
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                {quote.totalSheets} {quote.totalSheets === 1 ? 'Sheet' : 'Sheets'}
              </span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {quote.duplex ? '2 sides per sheet (Duplex)' : '1 side per sheet (Single-sided)'}
              </div>
            </div>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Tariff Rate:</span>
            <span className="font-semibold text-slate-800">
              {quote.currencySymbol}{quote.ratePerSide.toFixed(2)} per printed side
            </span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-600">Subtotal ({quote.totalSides} sides × {quote.currencySymbol}{quote.ratePerSide}):</span>
            <span className="font-semibold text-slate-800">
              {quote.currencySymbol}{quote.subtotal.toFixed(2)}
            </span>
          </div>

          {quote.discount > 0 && (
            <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Duplex Paper-Saving Eco Discount:</span>
              </span>
              <span>-{quote.currencySymbol}{quote.discount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-baseline justify-between mt-4">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Final Amount Payable
              </span>
              <span className="text-xs text-slate-400">Zero hidden fees or service charges</span>
            </div>

            <div className="text-right">
              <span className="text-4xl font-black text-brand-600 tracking-tight">
                {quote.currencySymbol}{quote.totalAmount.toFixed(2)}
              </span>
              <div className="text-xs text-slate-500 font-medium">Indian Rupees ({quote.currency})</div>
            </div>
          </div>
        </div>

        {/* Security & Verification Note */}
        <div className="flex items-start space-x-2 text-xs text-slate-500 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Server Verified:</strong> This price quote is cryptographically verified by the central campus printing backend to prevent client tampering.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            className="touch-btn px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Modify Settings</span>
          </button>

          <button
            onClick={handleProceedToPayment}
            disabled={submitting}
            className="touch-btn flex-1 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <CreditCard className="w-5 h-5" />
            <span>{submitting ? 'Creating Print Order...' : 'Continue to Payment'}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
