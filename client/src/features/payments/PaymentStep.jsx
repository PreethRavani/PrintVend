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
  Zap,
  XCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

const KIOSK_VPA_ID = 'smartcampus.kiosk@upi';

export default function PaymentStep({ onNext, onBack }) {
  const { activeJob, quote, handlePayment, resetSession } = useKiosk();

  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [forceFailTest, setForceFailTest] = useState(false);

  const amount = quote?.totalAmount || activeJob?.quote?.totalAmount || 2.0;
  const currencySymbol = quote?.currencySymbol || '₹';
  const jobRef = activeJob?.jobNumber || 'JOB-PRINT';

  useEffect(() => {
    let isMounted = true;
    async function generateUPIQR() {
      try {
        const upiUri = `upi://pay?pa=${encodeURIComponent(KIOSK_VPA_ID)}&pn=SmartCampusPrint&am=${amount.toFixed(
          2
        )}&cu=INR&tn=${encodeURIComponent(jobRef)}`;
        const dataUrl = await QRCode.toDataURL(upiUri, {
          width: 200,
          margin: 1,
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
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2 max-w-xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
            4/4
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 leading-tight">
              Complete Payment
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Scan dynamic UPI QR or verify VPA ID to pay
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetSession}
          className="touch-btn px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition"
          title="Cancel session"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Order Summary Pill */}
      <div className="flex-shrink-0 bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Job Reference</span>
          <div className="text-sm font-mono font-bold text-slate-800 leading-none mt-0.5">
            {jobRef}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {quote?.totalSides || activeJob?.quote?.totalSides || 1} sides ({quote?.totalSheets || activeJob?.quote?.totalSheets || 1} sheets)
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Amount Due</span>
          <div className="text-2xl font-semibold text-slate-900 leading-none mt-0.5 tracking-tight">
            {currencySymbol}{amount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Unified Single-View Payment Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
        {/* VPA ID Banner */}
        <div className="flex-shrink-0 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Virtual Payment Address (VPA ID)
            </span>
            <span className="text-xs font-mono font-semibold text-slate-900 truncate block">
              {KIOSK_VPA_ID}
            </span>
          </div>

          <button
            type="button"
            onClick={copyVpa}
            className="touch-btn px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 flex items-center space-x-1 shadow-2xs transition"
          >
            {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copiedVpa ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Dynamic QR Code */}
        <div className="flex-1 flex flex-col items-center justify-center text-center py-2 min-h-0">
          <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
            {upiQrDataUrl ? (
              <img
                src={upiQrDataUrl}
                alt="UPI Payment QR Code"
                className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded"
              />
            ) : (
              <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs">
                Generating UPI QR...
              </div>
            )}
            <div className="text-[10px] font-semibold text-slate-600 mt-1">
              Pay: <strong className="text-slate-900">{currencySymbol}{amount.toFixed(2)}</strong>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            GPay • PhonePe • Paytm • BHIM • Cred
          </p>
        </div>

        {paymentError && (
          <div className="flex-shrink-0 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{paymentError}</span>
          </div>
        )}

        <div className="flex-shrink-0 pt-1">
          <label className="flex items-center space-x-2 text-[11px] text-slate-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={forceFailTest}
              onChange={(e) => setForceFailTest(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
            />
            <span>Simulate Payment Failure (Retry Demo)</span>
          </label>
        </div>
      </div>

      {/* Docked Navigation Footer */}
      <div className="flex-shrink-0 pt-2 flex items-center space-x-3 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="touch-btn px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={() => processPaymentSubmission(false)}
          disabled={isProcessing}
          className="touch-btn flex-1 py-3 px-6 rounded-xl text-sm font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm flex items-center justify-center space-x-2 active:scale-[0.98] transition disabled:bg-slate-200 disabled:text-slate-400"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying UPI...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Pay {currencySymbol}{amount.toFixed(2)} (Simulated)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
