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
  Zap,
  FileText,
  Smartphone
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';

const FEEDBACK_TAGS = [
  { id: 'fast', label: 'Fast Printing', icon: Zap },
  { id: 'quality', label: 'Crisp Print Quality', icon: FileText },
  { id: 'mobile', label: 'Easy Mobile Sync', icon: Smartphone },
  { id: 'pricing', label: 'Clear Pricing', icon: CheckCircle2 },
  { id: 'touch', label: 'Responsive Touchscreen', icon: ThumbsUp }
];

export default function CollectionStep({ onCollected }) {
  const { activeJob, jobStatus, handleConfirmCollection } = useKiosk();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['fast', 'quality']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const collectionCode = jobStatus?.collectionCode || activeJob?.collectionCode || '4821';

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5:
        return '5/5 — Excellent & Fast';
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
    <div className="max-w-xl mx-auto w-full space-y-4 py-2">
      {/* Top Header */}
      <div className="flex-shrink-0 text-center space-y-1 pb-1">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold uppercase tracking-wider">
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Tray Dispensed • Ready for Pickup</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex flex-col gap-3 overflow-hidden">
        {/* Star Review & Feedback Section */}
        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-center space-y-2 flex-shrink-0">
          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>Kiosk Print Quality & Satisfaction</span>
          </div>

          <div className="text-xs font-medium text-slate-600">
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
                  className="touch-btn p-1 transition transform hover:scale-110 active:scale-95 focus:outline-none"
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

          <div className="inline-block px-3 py-0.5 bg-white rounded-full border border-slate-200 text-[11px] font-semibold text-slate-800">
            {getRatingLabel(hoverRating || rating)}
          </div>

          {/* Quick Experience Feedback Tags (Lucide SVG Icons, No Emojis) */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {FEEDBACK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              const TagIcon = tag.icon;
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <TagIcon className="w-3 h-3" />
                  <span>{tag.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collection Reminders */}
        <div className="text-xs text-slate-600 py-1 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
            <span>Retrieve all physical pages from the illuminated tray below.</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
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
          className="touch-btn w-full py-3.5 rounded-xl text-base font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm flex items-center justify-center space-x-2 transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>{isSubmitting ? 'Purging Files...' : 'I Have Collected My Prints'}</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
