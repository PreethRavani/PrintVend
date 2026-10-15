import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function PaymentStep({ onNext, onBack }) {
  const { activeJob, quote, handlePayment } = useKiosk();

  const [paymentMode, setPaymentMode] = useState('SIMULATED_UPI');
  const [upiIdInput, setUpiIdInput] = useState('student@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [forceFailTest, setForceFailTest] = useState(false);

  const amount = quote?.totalAmount || activeJob?.quote?.totalAmount || 0;
  const currencySymbol = quote?.currencySymbol || '₹';

  const processPaymentSubmission = async (simulateFailure = false) => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      await handlePayment({
        paymentMode,
        upiId: upiIdInput,
        forceFail: simulateFailure || forceFailTest
      });

      setIsProcessing(false);
      onNext();
    } catch (err) {
      setIsProcessing(false);
      setPaymentError(err.message || 'Payment simulation failed. You can retry with a different test method.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      {/* Step Header */}
      <div className="text-center space-y-2 pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 4 of 4</span>
        <h2 className="text-3xl font-extrabold text-slate-900">Complete Payment</h2>
        <p className="text-sm text-slate-500">
          Simulated test checkout for prototype demonstration.
        </p>
      </div>

      {/* Prototype Simulation Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-900">Prototype Demonstration Mode</div>
          <p>
            No real currency will be charged. This sandbox simulates the exact UPI and QR payment verification process for laboratory testing.
          </p>
        </div>
      </div>

      {/* Order Summary Pill */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase">Job Reference</span>
          <div className="text-base font-mono font-bold text-slate-800">
            {activeJob?.jobNumber || 'JOB-PENDING'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {quote?.totalSides || activeJob?.quote?.totalSides} sides ({quote?.totalSheets || activeJob?.quote?.totalSheets} physical sheets)
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold uppercase">Amount Due</span>
          <div className="text-3xl font-black text-brand-600">
            {currencySymbol}{amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Payment Method Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg space-y-5">
        <h3 className="text-base font-bold text-slate-800">Select Simulated Payment Method</h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMode('SIMULATED_UPI')}
            className={`touch-btn p-4 rounded-2xl border-2 text-left flex items-center space-x-3 transition ${
              paymentMode === 'SIMULATED_UPI'
                ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <Smartphone className="w-6 h-6 text-brand-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">UPI Collect (VPA)</div>
              <div className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMode('SIMULATED_QR')}
            className={`touch-btn p-4 rounded-2xl border-2 text-left flex items-center space-x-3 transition ${
              paymentMode === 'SIMULATED_QR'
                ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <QrCode className="w-6 h-6 text-cyan-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900">Scan UPI QR</div>
              <div className="text-[11px] text-slate-500">Simulate on-screen dynamic QR</div>
            </div>
          </button>
        </div>

        {/* Dynamic Payment Fields */}
        {paymentMode === 'SIMULATED_UPI' ? (
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Virtual Payment Address (UPI ID)
            </label>
            <input
              type="text"
              value={upiIdInput}
              onChange={(e) => setUpiIdInput(e.target.value)}
              placeholder="e.g. yourname@okhdfcbank"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400">
              Demo tip: Type "fail" in the UPI ID to simulate a bank decline for testing the retry flow.
            </p>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-40 h-40 bg-white p-3 rounded-xl mx-auto shadow-sm border border-slate-200 flex items-center justify-center">
              <QrCode className="w-32 h-32 text-slate-800" />
            </div>
            <div className="text-xs font-semibold text-slate-700">
              Simulated Dynamic Bharat-UPI QR ({currencySymbol}{amount.toFixed(2)})
            </div>
            <p className="text-[11px] text-slate-400">
              Tap "Confirm Simulated Payment" below to simulate approval from mobile banking app.
            </p>
          </div>
        )}

        {/* Error / Retry Banner */}
        {paymentError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Transaction Declined</span>
            </div>
            <p className="text-xs">{paymentError}</p>
            <button
              onClick={() => {
                setUpiIdInput('student@okhdfcbank');
                setForceFailTest(false);
                setPaymentError(null);
              }}
              className="text-xs text-rose-800 underline font-semibold mt-1"
            >
              Reset to successful test credentials
            </button>
          </div>
        )}

        {/* Lab Testing Simulator Controls */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={forceFailTest}
              onChange={(e) => setForceFailTest(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="text-slate-600">Simulate Payment Failure (Demonstrate Retry)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="touch-btn px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={() => processPaymentSubmission(forceFailTest)}
            disabled={isProcessing}
            className="touch-btn flex-1 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>
              {isProcessing
                ? 'Verifying Simulated Transaction...'
                : `Pay ${currencySymbol}${amount.toFixed(2)} (Simulated)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
