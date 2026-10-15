import React, { useState } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

export default function CollectionStep({ onCollected }) {
  const { activeJob, jobStatus, handleConfirmCollection } = useKiosk();
  const [pinInput, setPinInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const collectionCode = jobStatus?.collectionCode || activeJob?.collectionCode || '4821';

  const onConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await handleConfirmCollection(pinInput || collectionCode);
      onCollected();
    } catch (err) {
      setError(err.message || 'Collection confirmation failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Tray Dispensed • Ready Now</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Pick Up Your Documents</h2>
        <p className="text-sm text-slate-500">
          Your documents are resting in the lower output tray of this terminal.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Collection Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Verification PIN Code Badge */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>Collection Verification PIN</span>
          </span>

          <div className="text-5xl font-mono font-black text-slate-900 tracking-widest py-2">
            {collectionCode}
          </div>

          <p className="text-xs text-slate-500">
            For hardware kiosks equipped with locked security trays, enter this 4-digit code on the tray keypad.
          </p>
        </div>

        {/* Collection Instructions */}
        <div className="space-y-3 text-sm text-slate-600">
          <h4 className="font-bold text-slate-800 text-sm">Collection Instructions:</h4>
          <ul className="space-y-2 text-xs list-disc pl-5">
            <li>Retrieve all physical pages from the illuminated tray below the screen.</li>
            <li>Verify that the total sheet count matches your receipt.</li>
            <li>Tap <strong>"I Have Collected My Prints"</strong> below to securely shred your temporary files from the server.</li>
          </ul>
        </div>

        {/* Secure Deletion Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs flex items-start space-x-3">
          <Trash2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <span className="font-bold block">Permanent Document Shredding</span>
            <span>
              Once you confirm collection, all uploaded PDF and image files stored on the kiosk's internal server are irreversibly erased from disk.
            </span>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-2">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="touch-btn w-full py-4 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Purging Files & Completing...' : 'I Have Collected My Prints'}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
