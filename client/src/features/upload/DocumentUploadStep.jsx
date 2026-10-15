import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Building,
  Smartphone,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  RefreshCw,
  BookOpen,
  Layers,
  Sparkles,
  BadgeCheck
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import {
  uploadFiles,
  removeDocument,
  getCatalogDocuments,
  addCatalogDocument
} from '../../services/uploadService';

const BRANCHES = [
  { code: 'CS', label: 'CS', full: 'Computer Science' },
  { code: 'IT', label: 'IT', full: 'Information Tech' },
  { code: 'CSEDS', label: 'CSE-DS', full: 'CSE Data Science' },
  { code: 'AIDS', label: 'AI-DS', full: 'AI & Data Science' },
  { code: 'AIML', label: 'AI-ML', full: 'AI & Machine Learning' },
  { code: 'ICB', label: 'ICB', full: 'IoT & Cyber Security' },
  { code: 'EXTC', label: 'EXTC', full: 'Electronics & Telecom' },
  { code: 'MECH', label: 'MECH', full: 'Mechanical Engg' }
];

const YEARS = [
  { code: 'FY', label: 'FY', full: 'First Year' },
  { code: 'SY', label: 'SY', full: 'Second Year' },
  { code: 'TY', label: 'TY', full: 'Third Year' },
  { code: 'BE', label: 'BE', full: 'Final Year (BE)' }
];

const CATEGORIES = ['All', 'Lab Manual', 'Assignment Sheet', 'Submission Template', 'College Form'];

export default function DocumentUploadStep({ onNext, onBack }) {
  const { session, documents, setDocuments, currentKiosk, refreshDocuments } = useKiosk();

  // Branch & Year selection state for Pre-Uploaded College Docs
  const [selectedBranch, setSelectedBranch] = useState('CS');
  const [selectedYear, setSelectedYear] = useState('TY');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Catalog items fetched from backend
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addingDocId, setAddingDocId] = useState(null);

  // QR transfer helper state
  const [copied, setCopied] = useState(false);

  // Kiosk local upload / drag-drop fallback state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch official college catalog whenever branch, year or category changes
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        const catFilter = selectedCategory === 'All' ? '' : selectedCategory;
        const res = await getCatalogDocuments(selectedBranch, selectedYear, catFilter);
        if (isMounted && res?.documents) {
          setCatalogItems(res.documents);
        }
      } catch (err) {
        console.error('Failed to load college catalog:', err);
      } finally {
        if (isMounted) setCatalogLoading(false);
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, [selectedBranch, selectedYear, selectedCategory]);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Check if a catalog document is already added to current session
  const isDocInSession = (item) => {
    return documents.some(
      (d) =>
        (d.courseCode && d.courseCode === item.code) ||
        (d.originalFilename && d.originalFilename.includes(item.code)) ||
        (d.originalFilename && d.originalFilename.toLowerCase().includes(item.title.toLowerCase().slice(0, 15)))
    );
  };

  // Add an official college document into active session
  const handleAddCatalogDoc = async (item) => {
    if (!session?.sessionId) {
      setUploadError('Active printing session required. Please restart.');
      return;
    }

    if (documents.length >= 10) {
      setUploadError('Maximum 10 documents allowed per print session.');
      return;
    }

    try {
      setAddingDocId(item.id);
      setUploadError(null);
      const newDoc = await addCatalogDocument(session.sessionId, item.id);
      setDocuments((prev) => [...prev, newDoc]);
    } catch (err) {
      setUploadError(err.message || 'Could not add college document to print list');
    } finally {
      setAddingDocId(null);
    }
  };

  // Remove document from session
  const handleDelete = async (docId) => {
    try {
      await removeDocument(docId, session.sessionId);
      setDocuments((prev) => prev.filter((d) => (d.id || d._id) !== docId));
    } catch (err) {
      alert(`Could not remove document: ${err.message}`);
    }
  };

  // Copy mobile upload link
  const handleCopyLink = () => {
    if (session?.mobileUploadUrl) {
      navigator.clipboard.writeText(session.mobileUploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Terminal file upload handler (USB / Local file browsing)
  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setUploadError(null);

    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validFiles = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setUploadError(`File "${file.name}" has an unsupported format. Please upload PDF, JPG, or PNG files.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 25MB maximum size limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (documents.length + validFiles.length > 10) {
      setUploadError('Maximum 10 documents allowed per printing session.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const uploadedDocs = await uploadFiles(session.sessionId, validFiles, (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percent);
      });

      setDocuments((prev) => [...prev, ...uploadedDocs]);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload document');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Step 1 of 4: Select & Upload
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs text-slate-500 font-medium">
              Terminal: <strong className="text-slate-700">{currentKiosk?.name || 'Central Library'}</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Choose Documents to Print
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Select faculty-verified college documents from the repository or scan the QR code to transfer personal files from your phone.
          </p>
        </div>

        {/* Live sync pill & session token badge */}
        <div className="flex items-center space-x-2 self-start md:self-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono font-bold border border-slate-200">
            {session?.sessionId || 'SESSION'}
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm flex items-start space-x-3 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p>{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-700 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2-COLUMN SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Pre-Uploaded Official College Documents (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Official College Documents</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pre-Uploaded
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Select department & academic year to pick faculty-approved manuals & sheets
                </p>
              </div>
            </div>
          </div>

          {/* Department / Branch Selection Touch Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Select Branch:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BRANCHES.map((b) => {
                const isActive = selectedBranch === b.code;
                return (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setSelectedBranch(b.code)}
                    title={b.full}
                    className={`touch-btn py-2 px-1 rounded-xl text-xs font-extrabold text-center transition ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-500 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Academic Year Selection Touch Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              2. Select Year:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {YEARS.map((y) => {
                const isActive = selectedYear === y.code;
                return (
                  <button
                    key={y.code}
                    type="button"
                    onClick={() => setSelectedYear(y.code)}
                    className={`touch-btn py-2.5 px-3 rounded-xl text-xs font-bold text-center transition flex flex-col items-center justify-center ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-md ring-2 ring-navy-800 ring-offset-1'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span className="font-extrabold text-sm">{y.label}</span>
                    <span className="text-[10px] opacity-80">{y.full}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-slate-400 font-semibold flex-shrink-0 text-[11px] mr-1">Filter:</span>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 transition text-[11px] ${
                    isActive
                      ? 'bg-brand-100 text-brand-800 border border-brand-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Catalog Document List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {catalogLoading ? (
              <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
                <span>Loading official documents for {selectedBranch} ({selectedYear})...</span>
              </div>
            ) : catalogItems.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-500 text-sm">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No documents found for this selection</p>
                <p className="text-xs text-slate-400 mt-1">Try choosing "All" categories or another year.</p>
              </div>
            ) : (
              catalogItems.map((item) => {
                const added = isDocInSession(item);
                const isAdding = addingDocId === item.id;
                const isForm = item.category === 'College Form';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      added
                        ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-300'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isForm
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-brand-50 text-brand-700 border border-brand-200'
                        }`}
                      >
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {item.code}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              isForm
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-cyan-100 text-cyan-800'
                            }`}
                          >
                            {item.category}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {item.branch === 'ALL' ? 'College-wide' : `${item.branch} • ${item.year}`}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          <span className="font-semibold text-brand-700">
                            {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
                          </span>
                          <span>•</span>
                          <span>{formatFileSize(item.fileSizeBytes)}</span>
                          <span>•</span>
                          <span className="truncate max-w-[200px] text-slate-400">
                            {item.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center self-end sm:self-center flex-shrink-0">
                      {added ? (
                        <div className="px-3.5 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-emerald-300">
                          <Check className="w-4 h-4 text-emerald-700" />
                          <span>Added</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCatalogDoc(item)}
                          disabled={isAdding || documents.length >= 10}
                          className="touch-btn px-4 py-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          {isAdding ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              <span>Add to Print</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Mobile Upload via Live QR Code (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Mobile Phone Upload</span>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Instant QR
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Scan code to transfer personal PDFs or photos directly to this kiosk
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="mt-4 text-center bg-slate-50/90 p-5 rounded-2xl border border-slate-200 shadow-inner">
              {session?.qrCodeUrl ? (
                <div className="relative inline-block group">
                  <img
                    src={session.qrCodeUrl}
                    alt="Upload Session QR Code"
                    className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-xl shadow-md border-2 border-white bg-white p-1"
                  />
                  <div className="absolute inset-0 bg-navy-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition pointer-events-none" />
                </div>
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 mx-auto flex items-center justify-center bg-slate-200 rounded-xl text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mr-2" />
                  Generating QR...
                </div>
              )}

              <div className="mt-3 flex items-center justify-center space-x-2 text-xs font-mono text-slate-700 font-bold">
                <span>SESSION:</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-300 text-brand-700">
                  {session?.sessionId || '...'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                No app install needed • Open default camera or scanner
              </p>
            </div>

            {/* 3 Step Instructions */}
            <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  1
                </span>
                <span>Scan this QR code with your mobile phone camera</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  2
                </span>
                <span>Select your PDF, JPG, or PNG files on mobile upload page</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-4 h-4 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                  3
                </span>
                <span>Files sync automatically to <strong>Ready to Print</strong> below!</span>
              </div>
            </div>
          </div>

          {/* Single-device testing shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
              <span>Prototype Testing Options:</span>
              <button
                type="button"
                onClick={refreshDocuments}
                className="text-brand-600 hover:text-brand-800 text-[11px] font-bold flex items-center gap-1"
                title="Force refresh documents"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Now</span>
              </button>
            </div>

            <div className="flex gap-2">
              <a
                href={session?.mobileUploadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="touch-btn flex-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
              >
                <span>Open Mobile Uploader</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Direct Kiosk / USB browse fallback */}
            <div className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
              >
                <UploadCloud className="w-4 h-4 text-slate-400" />
                <span>Or browse files directly on kiosk / USB</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Uploading progress bar */}
      {uploading && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Uploading document(s)...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Ready to Print (X/10 Files) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
              Ready to Print ({documents.length}/10 files)
            </h3>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Page Counts & Pricing Verified</span>
              </span>
              <span className="text-slate-500 font-bold">
                Total:{' '}
                {documents.reduce((acc, d) => acc + (d.pageCount || 1), 0)} pages
              </span>
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No documents staged for printing yet</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select pre-uploaded official faculty documents from the left or scan the mobile QR code on the right to transfer your files.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.map((doc, idx) => {
              const docId = doc.id || doc._id;
              const isPdf =
                doc.mimeType?.includes('pdf') ||
                (doc.originalFilename && doc.originalFilename.endsWith('.pdf')) ||
                (doc.filename && doc.filename.endsWith('.pdf'));
              const isCatalog = doc.source === 'COLLEGE_CATALOG';

              return (
                <div
                  key={docId || idx}
                  className="bg-slate-50/80 hover:bg-slate-100/90 rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isCatalog
                          ? 'bg-brand-100 text-brand-700 border border-brand-200'
                          : isPdf
                          ? 'bg-rose-50 text-rose-600 border border-rose-100'
                          : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                      }`}
                    >
                      {isCatalog ? (
                        <GraduationCap className="w-6 h-6" />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        {isCatalog ? (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                            🏛️ Official Doc {doc.branch ? `• ${doc.branch} ${doc.year || ''}` : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
                            📱 Mobile Upload
                          </span>
                        )}
                        {doc.courseCode && (
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            [{doc.courseCode}]
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {doc.originalFilename || doc.filename}
                      </p>

                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-bold text-brand-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {doc.pageCount || 1} {(doc.pageCount || 1) === 1 ? 'page' : 'pages'}
                        </span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSizeBytes)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(docId)}
                    className="touch-btn p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex-shrink-0"
                    title="Remove document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="touch-btn px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kiosk Home</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={documents.length === 0 || uploading}
          className={`touch-btn px-8 py-3.5 rounded-xl text-base font-bold shadow-md flex items-center space-x-2 transition ${
            documents.length > 0 && !uploading
              ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-95'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Configure Print Settings ({documents.length} {documents.length === 1 ? 'file' : 'files'})</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
