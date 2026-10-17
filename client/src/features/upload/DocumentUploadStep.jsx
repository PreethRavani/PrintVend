import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Smartphone,
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
  XCircle,
  Search,
  X,
  Sparkles,
  Filter,
  CheckCircle2,
  QrCode
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
  { code: 'CSEDS', label: 'CSE-DS', full: 'Data Science' },
  { code: 'AIDS', label: 'AI-DS', full: 'AI & Data Science' },
  { code: 'AIML', label: 'AI-ML', full: 'AI & Machine Learning' },
  { code: 'ICB', label: 'ICB', full: 'IoT & Blockchain' },
  { code: 'EXTC', label: 'EXTC', full: 'Electronics & Telecom' },
  { code: 'MECH', label: 'MECH', full: 'Mechanical' }
];

const YEARS = [
  { code: 'FY', label: 'FY', full: '1st Year' },
  { code: 'SY', label: 'SY', full: '2nd Year' },
  { code: 'TY', label: 'TY', full: '3rd Year' },
  { code: 'BE', label: 'BE', full: 'Final Year' }
];

const CATEGORIES = ['All', 'Lab Manual', 'Assignment Sheet', 'Submission Template', 'College Form'];

export default function DocumentUploadStep({ onNext, onBack }) {
  const { session, documents, setDocuments, resetSession } = useKiosk();

  // Branch & Year selection: starts null so user chooses their branch & year first as requested
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Catalog items
  const [catalogItems, setCatalogItems] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [addingDocId, setAddingDocId] = useState(null);

  // QR link copy
  const [copied, setCopied] = useState(false);

  // Kiosk local upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const hasMadeChoices = Boolean(selectedBranch && selectedYear);

  // Load catalog only after branch and year choices are made
  useEffect(() => {
    let isMounted = true;
    async function loadCatalog() {
      if (!selectedBranch || !selectedYear) {
        setCatalogItems([]);
        return;
      }
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

  const isDocInSession = (item) => {
    return documents.some(
      (d) =>
        (d.courseCode && d.courseCode === item.code) ||
        (d.originalFilename && d.originalFilename.includes(item.code)) ||
        (d.originalFilename && d.originalFilename.toLowerCase().includes(item.title.toLowerCase().slice(0, 15)))
    );
  };

  const handleAddCatalogDoc = async (item) => {
    if (!session?.sessionId) {
      setUploadError('Active printing session required.');
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
      setUploadError(err.message || 'Could not add document to print list');
    } finally {
      setAddingDocId(null);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await removeDocument(docId, session.sessionId);
      setDocuments((prev) => prev.filter((d) => (d.id || d._id) !== docId));
    } catch (err) {
      alert(`Could not remove document: ${err.message}`);
    }
  };

  const handleCopyLink = () => {
    if (session?.mobileUploadUrl) {
      navigator.clipboard.writeText(session.mobileUploadUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setUploadError(null);

    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validFiles = [];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setUploadError(`Unsupported format for "${file.name}". PDF, JPG, PNG only.`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setUploadError(`File exceeds 25MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    if (documents.length + validFiles.length > 10) {
      setUploadError('Max 10 files allowed.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(30);
      const uploadedDocs = await uploadFiles(session.sessionId, validFiles, (pe) => {
        setUploadProgress(Math.round((pe.loaded * 100) / pe.total));
      });
      setDocuments((prev) => [...prev, ...uploadedDocs]);
      setUploadProgress(100);
      setTimeout(() => setUploading(false), 400);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  // Live search filtering by title, course code, or category
  const filteredCatalogItems = catalogItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-4">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            1/4
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              Select Documents to Print
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pick official college lab files, or transfer assignments directly from your phone
            </p>
          </div>
        </div>

        {/* Live sync & Cancel button */}
        <div className="flex items-center space-x-2.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync Active</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-mono font-bold border border-slate-200">
            {session?.sessionId || 'SESSION'}
          </div>

          <button
            type="button"
            onClick={resetSession}
            className="touch-btn px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
            title="Cancel session"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between shadow-xs">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </span>
          <button onClick={() => setUploadError(null)} className="font-semibold text-xs underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Pre-Uploaded Official Documents (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071e3] flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Official College Repository
                </h3>
                <p className="text-xs text-slate-500">
                  Select your branch and year to browse faculty-uploaded files
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Verified Files
            </span>
          </div>

          {/* STEP 1: Branch Selection Pills */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">1</span>
                <span>Select Your Engineering Branch:</span>
              </span>
              {selectedBranch && (
                <span className="text-xs font-semibold text-[#0071e3]">
                  {BRANCHES.find((b) => b.code === selectedBranch)?.full}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {BRANCHES.map((b) => {
                const isActive = selectedBranch === b.code;
                return (
                  <button
                    key={b.code}
                    type="button"
                    onClick={() => setSelectedBranch(b.code)}
                    className={`touch-btn py-2 px-1 text-xs sm:text-sm font-semibold rounded-xl text-center transition-all ${
                      isActive
                        ? 'bg-[#0071e3] text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/70'
                    }`}
                    title={b.full}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Year Selection Pills */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center">2</span>
                <span>Select Academic Year:</span>
              </span>
              {selectedYear && (
                <span className="text-xs font-semibold text-[#0071e3]">
                  {YEARS.find((y) => y.code === selectedYear)?.full}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {YEARS.map((y) => {
                const isActive = selectedYear === y.code;
                return (
                  <button
                    key={y.code}
                    type="button"
                    onClick={() => setSelectedYear(y.code)}
                    className={`touch-btn py-2 text-xs sm:text-sm font-semibold rounded-xl text-center transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/70'
                    }`}
                  >
                    <span>{y.label}</span>
                    <span className="hidden sm:inline text-xs opacity-75 ml-1">({y.full})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Document Catalog & Search Bar (Only appears after choices are made) */}
          {hasMadeChoices ? (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
              {/* Search Bar & Category Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, subject, code (e.g. OS, Lab, Bonafide)..."
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex-shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Documents List */}
              <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                {catalogLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#0071e3]" />
                    <span>Loading documents for {selectedBranch} {selectedYear}...</span>
                  </div>
                ) : filteredCatalogItems.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-xs sm:text-sm text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4">
                    <BookOpen className="w-7 h-7 text-slate-300 mb-1.5" />
                    <span className="font-semibold text-slate-600">No documents match your filter</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      Try a different keyword or reset category to "All"
                    </span>
                  </div>
                ) : (
                  filteredCatalogItems.map((item) => {
                    const added = isDocInSession(item);
                    const isAdding = addingDocId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          added
                            ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                            : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            added ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-[#0071e3]'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                              <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                                {item.code}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-slate-700">{item.pageCount} pages</span>
                              <span>•</span>
                              <span>{formatFileSize(item.fileSizeBytes)}</span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug mt-0.5">
                              {item.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          {added ? (
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Added</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddCatalogDoc(item)}
                              disabled={isAdding || documents.length >= 10}
                              className="touch-btn px-4 py-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 shadow-xs"
                            >
                              {isAdding ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Plus className="w-3.5 h-3.5" />
                              )}
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Prompt to make choices first */
            <div className="py-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-6 flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0071e3] flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Choose Branch & Year Above
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Select your engineering discipline and year to display official curriculum documents, lab templates, and college forms.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Mobile Phone QR Upload (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mobile QR Upload
                </h3>
                <p className="text-xs text-slate-500">
                  Transfer personal PDF/photos directly
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
              No Flash Drive Needed
            </span>
          </div>

          {/* QR Code Container with High-Tech Frame */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 relative group">
              {session?.qrCodeUrl ? (
                <img
                  src={session.qrCodeUrl}
                  alt="Upload QR"
                  className="w-40 h-40 rounded-xl"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-slate-100 rounded-xl text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Waiting for Mobile Files...</span>
            </div>
          </div>

          {/* 3-Step Clear Visual Flow */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-[#0071e3] uppercase block">Step 1</span>
              <span className="text-xs font-bold text-slate-800 block">Open Camera</span>
              <span className="text-[11px] text-slate-500 block leading-tight">Scan QR code</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-[#0071e3] uppercase block">Step 2</span>
              <span className="text-xs font-bold text-slate-800 block">Pick Files</span>
              <span className="text-[11px] text-slate-500 block leading-tight">PDF, JPG, PNG</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-[#0071e3] uppercase block">Step 3</span>
              <span className="text-xs font-bold text-slate-800 block">Syncs Live</span>
              <span className="text-[11px] text-slate-500 block leading-tight">Ready to print</span>
            </div>
          </div>

          {/* Action Links */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              <a
                href={session?.mobileUploadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="touch-btn flex-1 bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-[0.98]"
              >
                <span>Open Mobile Uploader</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1 border border-slate-200 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

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
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Or browse local files / USB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar if uploading */}
      {uploading && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Uploading document(s)...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-[#0071e3] h-2 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Ready to Print Tray (Compact and clean) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Ready to Print ({documents.length}/10 files)
            </h3>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center space-x-2.5 text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
              <span className="text-slate-700 font-extrabold">
                Total: {documents.reduce((acc, d) => acc + (d.pageCount || 1), 0)} pages
              </span>
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="py-3 px-4 text-center text-slate-500 text-xs sm:text-sm flex items-center justify-center space-x-2 bg-slate-50 rounded-xl border border-slate-200/80">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>No documents added yet. Select official files from the catalog on the left, or scan the mobile QR code on the right.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {documents.map((doc, idx) => {
              const docId = doc.id || doc._id;
              const isCatalog = doc.source === 'COLLEGE_CATALOG';
              return (
                <div
                  key={docId || idx}
                  className="bg-slate-50 hover:bg-slate-100/90 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-2.5 transition shadow-2xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#0071e3] flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                          {isCatalog ? 'Official' : 'Mobile'}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          {doc.pageCount || 1}p
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate mt-0.5">
                        {doc.originalFilename || doc.filename}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(docId)}
                    className="touch-btn p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex-shrink-0"
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

      {/* Docked Navigation Footer */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="touch-btn px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center space-x-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kiosk Home</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={documents.length === 0 || uploading}
          className={`touch-btn px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold shadow-md flex items-center space-x-2 transition ${
            documents.length > 0 && !uploading
              ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Configure Print Settings ({documents.length} {documents.length === 1 ? 'file' : 'files'})</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
