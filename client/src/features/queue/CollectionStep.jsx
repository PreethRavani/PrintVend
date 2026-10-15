import React, { useState } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Star,
  ThumbsUp,
  Sparkles,
  Heart
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

const FEEDBACK_TAGS = [
  '⚡ Super Fast Printing',
  '📄 Crisp Paper & Toner Quality',
  '📱 Easy Mobile QR Transfer',
  '💰 Transparent Pricing',
  '🖥️ Smooth Touchscreen'
];

export default function CollectionStep({ onCollected }) {
  const { activeJob, jobStatus, handleConfirmCollection } = useKiosk();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['⚡ Super Fast Printing', '📄 Crisp Paper & Toner Quality']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const collectionCode = jobStatus?.collectionCode || activeJob?.collectionCode || '4821';

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5:
        return '5/5 — Excellent & Super Fast!';
      case 4:
        return '4/5 — Great & Smooth Experience';
      case 3:
        return '3/5 — Good & Satisfactory';
      case 2:
        return '2/5 — Needs Improvement';
      case 1:
        return '1/5 — Poor Experience';
      default:
        return 'Tap a star to rate';
    }
  };

  const onConfirm = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      // Pass collectionCode (or default) to backend to finalize job and trigger secure document shredding
      await handleConfirmCollection(collectionCode);
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
          <span>Tray Dispensed • Ready for Pickup</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900">Pick Up Your Documents</h2>
        <p className="text-sm text-slate-500">
          Your printed pages are resting in the lower output tray of this terminal.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Collection & Feedback Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
        {/* Replaced PIN verification code with interactive Star Review & Feedback */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 p-6 rounded-2xl border border-amber-200/80 text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Kiosk Service & Print Quality Satisfaction</span>
          </div>

          <div className="text-sm font-semibold text-slate-700">
            How was your printing experience today?
          </div>

          {/* Interactive 5-Star Rating */}
          <div className="flex items-center justify-center space-x-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="touch-btn p-1.5 transition transform hover:scale-125 focus:outline-none"
                  title={`${star} star`}
                >
                  <Star
                    className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-slate-300 fill-slate-100 hover:text-amber-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Dynamic Satisfaction Score Tag */}
          <div className="inline-block px-3.5 py-1 bg-white rounded-full border border-amber-200 text-xs font-bold text-amber-900 shadow-2xs">
            {getRatingLabel(hoverRating || rating)}
          </div>

          {/* Quick Experience Feedback Tags */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`touch-btn px-2.5 py-1 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collection Instructions */}
        <div className="space-y-2 text-sm text-slate-600">
          <h4 className="font-bold text-slate-800 text-sm">Collection Reminders:</h4>
          <ul className="space-y-1.5 text-xs list-disc pl-5">
            <li>Retrieve all physical pages from the output tray below the screen.</li>
            <li>Double-check your sheets and stapled copies before stepping away.</li>
            <li>Tap <strong>"I Have Collected My Prints"</strong> below to complete session and trigger immediate server document shredding.</li>
          </ul>
        </div>

        {/* Secure Deletion Notice */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs flex items-start space-x-3">
          <Trash2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <span className="font-bold block">Permanent Document Shredding</span>
            <span>
              Once confirmed, all uploaded PDF and image files stored on the kiosk's internal server are irreversibly erased from disk for student privacy.
            </span>
          </div>
        </div>

        {/* Confirmation Button */}
        <div className="pt-2">
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="touch-btn w-full py-4 rounded-2xl text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:bg-slate-300"
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
