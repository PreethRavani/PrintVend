import React, { useState } from 'react';
import { QrCode, X, Smartphone, ArrowRight, ExternalLink, Check, Copy } from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function QRTransferModal({ isOpen, onClose }) {
  const { session, currentKiosk, setCurrentStep } = useKiosk();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  const copyLink = () => {
    if (session.mobileUploadUrl) {
      navigator.clipboard.writeText(session.mobileUploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100 shadow-sm">
            <Smartphone className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900">Transfer from Your Phone</h3>
            <p className="text-sm text-slate-600 mt-1">
              Point your phone camera at this QR code to upload documents to <strong>{currentKiosk?.name || 'this kiosk'}</strong>.
            </p>
          </div>

          {/* Actual QR Code */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block shadow-inner">
            {session.qrCodeUrl ? (
              <img
                src={session.qrCodeUrl}
                alt="Upload Session QR Code"
                className="w-56 h-56 mx-auto rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-slate-200 text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
            <div className="mt-3 text-xs font-mono text-slate-500 font-bold tracking-wider">
              SESSION: {session.sessionId}
            </div>
          </div>

          {/* Quick tester simulation action */}
          <div className="space-y-2 pt-2">
            <div className="text-xs text-slate-500">
              Testing on one device? Open the mobile upload page in a new tab:
            </div>
            <div className="flex gap-2">
              <a
                href={session.mobileUploadUrl}
                target="_blank"
                rel="noreferrer"
                className="touch-btn flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Open Mobile Uploader</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={copyLink}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold flex items-center space-x-1 border border-slate-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Proceed button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                setCurrentStep(3);
              }}
              className="touch-btn w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 shadow-md transition active:scale-95 text-sm"
            >
              <span>Done Uploading / View Uploaded Files</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            This QR code expires in 30 minutes for security.
          </div>
        </div>
      </div>
    </div>
  );
}
