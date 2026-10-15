import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
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
  Copy,
  Check,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

const KIOSK_VPA_ID = 'smartcampus.kiosk@upi';

export default function PaymentStep({ onNext, onBack }) {
  const { activeJob, quote, handlePayment } = useKiosk();

  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [forceFailTest, setForceFailTest] = useState(false);

  const amount = quote?.totalAmount || activeJob?.quote?.totalAmount || 2.0;
  const currencySymbol = quote?.currencySymbol || '₹';
  const jobRef = activeJob?.jobNumber || 'JOB-PRINT';

  // Automatically generate dynamic UPI QR code on mount or when amount/job changes
  useEffect(() => {
    let isMounted = true;
    async function generateUPIQR() {
      try {
        const upiUri = `upi://pay?pa=${encodeURIComponent(KIOSK_VPA_ID)}&pn=SmartCampusPrint&am=${amount.toFixed(
          2
        )}&cu=INR&tn=${encodeURIComponent(jobRef)}`;
        const dataUrl = await QRCode.toDataURL(upiUri, {
          width: 260,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        if (isMounted) {
          setUpiQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate dynamic UPI QR:', err);
      }
    }

    generateUPIQR();
    return () => {
      isMounted = false;
    };
  }, [amount, jobRef]);

  const copyVpa = () => {
    navigator.clipboard.writeText(KIOSK_VPA_ID);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const processPaymentSubmission = async (simulateFailure = false) => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      await handlePayment({
        paymentMode: 'SIMULATED_UPI',
        upiId: KIOSK_VPA_ID,
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
      <div className="text-center space-y-1.5 pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
          Step 4 of 4: Payment
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Complete Payment</h2>
        <p className="text-sm text-slate-500">
          Scan the dynamic UPI QR code or verify the VPA ID to approve simulated payment.
        </p>
      </div>

      {/* Order Summary Pill */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase">Job Reference</span>
          <div className="text-base font-mono font-bold text-slate-800">
            {jobRef}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {quote?.totalSides || activeJob?.quote?.totalSides || 1} sides ({quote?.totalSheets || activeJob?.quote?.totalSheets || 1} physical sheets)
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-semibold uppercase">Amount Due</span>
          <div className="text-3xl font-black text-brand-600">
            {currencySymbol}{amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Unified Single-View Payment Card: VPA ID + Auto QR Code */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-lg space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Instant UPI Payment</h3>
              <p className="text-xs text-slate-500">Scan code with any UPI app on your smartphone</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            ● Dynamic QR Ready
          </span>
        </div>

        {/* VPA ID mentioned right above the QR code */}
        <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Virtual Payment Address (VPA ID)
            </span>
            <span className="text-sm font-mono font-black text-brand-700 truncate block">
              {KIOSK_VPA_ID}
            </span>
          </div>

          <button
            type="button"
            onClick={copyVpa}
            className="touch-btn px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 shadow-2xs transition"
          >
            {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedVpa ? 'Copied' : 'Copy VPA'}</span>
          </button>
        </div>

        {/* Dynamic UPI QR Code centered automatically */}
        <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="inline-block p-3.5 bg-white rounded-2xl shadow-md border border-slate-200">
            {upiQrDataUrl ? (
              <img
                src={upiQrDataUrl}
                alt="UPI Payment QR Code"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                Generating UPI QR...
              </div>
            )}
            <div className="text-[11px] font-bold text-slate-600 mt-2">
              Scan & Pay: <strong className="text-brand-700">{currencySymbol}{amount.toFixed(2)}</strong>
            </div>
          </div>

          {/* Supported UPI Apps logos / text */}
          <div className="text-[11px] text-slate-500 font-medium">
            Supported Apps: <span className="text-slate-700 font-semibold">Google Pay • PhonePe • Paytm • BHIM • Cred</span>
          </div>
        </div>

        {/* Error / Retry Banner */}
        {paymentError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold block">Payment Declined</span>
              <span>{paymentError}</span>
            </div>
          </div>
        )}

        {/* Test simulation failure checkbox */}
        <div className="pt-1">
          <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceFailTest}
              onChange={(e) => setForceFailTest(e.target.checked)}
              className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
            />
            <span>Simulate Payment Failure (To demonstrate retry workflow)</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="touch-btn px-5 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center space-x-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => processPaymentSubmission(false)}
            disabled={isProcessing}
            className="touch-btn flex-1 py-3.5 px-6 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 active:scale-95 transition disabled:bg-slate-300"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Verifying UPI Transaction...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Pay {currencySymbol}{amount.toFixed(2)} (Simulated)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
