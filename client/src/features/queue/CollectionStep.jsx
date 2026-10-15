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
      await handleConfirmCollection(collectionCode);
      onCollected();
    } catch (err) {
      setError(err.message || 'Collection confirmation failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden gap-2 max-w-xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex-shrink-0 text-center space-y-1 pb-1">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Tray Dispensed • Ready for Pickup</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
          Pick Up Your Documents
        </h2>
        <p className="text-xs text-slate-500">
          Your printed pages are resting in the lower output tray of this terminal.
        </p>
      </div>

      {error && (
        <div className="flex-shrink-0 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Collection & Feedback Card */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Star Review & Feedback Section */}
        <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-slate-50 p-4 rounded-xl border border-amber-200/80 text-center space-y-2 flex-shrink-0">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Kiosk Print Quality & Satisfaction</span>
          </div>

          <div className="text-xs font-semibold text-slate-700">
            How was your printing experience today?
          </div>

          {/* Interactive 5-Star Rating */}
          <div className="flex items-center justify-center space-x-2 py-0.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="touch-btn p-1 transition transform hover:scale-125 focus:outline-none"
                  title={`${star} star`}
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      active
                        ? 'text-amber-400 fill-amber-400 drop-shadow-2xs'
                        : 'text-slate-300 fill-slate-100 hover:text-amber-200'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="inline-block px-3 py-0.5 bg-white rounded-full border border-amber-200 text-[11px] font-bold text-amber-900">
            {getRatingLabel(hoverRating || rating)}
          </div>

          {/* Quick Experience Feedback Tags */}
          <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition ${
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

        {/* Collection Reminders */}
        <div className="text-xs text-slate-600 py-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            <span>Retrieve all physical pages from the illuminated tray below.</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            <span>Tap <strong>"I Have Collected My Prints"</strong> below to securely wipe files.</span>
          </div>
        </div>

        {/* Secure Deletion Notice */}
        <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-800 text-[11px] flex items-start space-x-2">
          <Trash2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
          <span>
            <strong>Automatic Document Shredding:</strong> Once confirmed, all uploaded files are permanently deleted from server disk.
          </span>
        </div>
      </div>

      {/* Docked Action Button */}
      <div className="flex-shrink-0 pt-2 border-t border-slate-200">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="touch-btn w-full py-3.5 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center space-x-2 transition active:scale-95 disabled:bg-slate-300"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isSubmitting ? 'Purging Files...' : 'I Have Collected My Prints'}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
