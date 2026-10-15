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
  XCircle
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
  const { session, documents, setDocuments, currentKiosk, refreshDocuments, resetSession } = useKiosk();

  // Branch & Year selection
  const [selectedBranch, setSelectedBranch] = useState('CS');
  const [selectedYear, setSelectedYear] = useState('TY');
  const [selectedCategory, setSelectedCategory] = useState('All');

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

  // Load catalog
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

  return (
    <div className="h-full flex flex-col overflow-hidden gap-2.5">
      {/* Top Bar: Compact Header & Live Sync Status */}
      <div className="flex-shrink-0 flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3] text-white flex items-center justify-center font-bold text-xs">
            1/4
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 leading-tight">
              Select Documents to Print
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Choose approved college documents or scan QR from your phone
            </p>
          </div>
        </div>

        {/* Live sync & Cancel button */}
        <div className="flex items-center space-x-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-medium border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </div>

          <div className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-mono font-semibold border border-slate-200">
            {session?.sessionId || 'SESSION'}
          </div>

          <button
            type="button"
            onClick={resetSession}
            className="touch-btn px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition"
            title="Cancel and clear this session"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="flex-shrink-0 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </span>
          <button onClick={() => setUploadError(null)} className="font-semibold text-xs underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* 2-COLUMN SPLIT SECTION (Constrained height with zero outer scroll) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch overflow-hidden">
        {/* LEFT COLUMN: Pre-Uploaded Official Documents (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
          {/* Top Control Cluster: Header + Branch pills + Year pills grouped tightly with zero voids */}
          <div className="flex-shrink-0 space-y-2 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-[#0071e3]" />
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Official College Documents
                </h3>
              </div>
              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                Verified Repository
              </span>
            </div>

            {/* Branch Pills: iOS Segmented Control */}
            <div>
              <div className="grid grid-cols-8 gap-0.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
                {BRANCHES.map((b) => {
                  const isActive = selectedBranch === b.code;
                  return (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setSelectedBranch(b.code)}
                      className={`py-1 px-0.5 rounded-lg text-[11px] text-center transition font-semibold ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={b.full}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year Pills: iOS Segmented Control & Category filter */}
            <div className="flex items-center justify-between gap-2">
              <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 flex-1">
                {YEARS.map((y) => {
                  const isActive = selectedYear === y.code;
                  return (
                    <button
                      key={y.code}
                      type="button"
                      onClick={() => setSelectedYear(y.code)}
                      className={`py-1 rounded-lg text-[11px] text-center transition font-semibold ${
                        isActive
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {y.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
                {CATEGORIES.slice(0, 3).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition flex-shrink-0 ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog Document List (Strictly scrollable inside card only) */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pt-2 pr-1">
            {catalogLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs py-6">
                <RefreshCw className="w-4 h-4 animate-spin mr-1.5 text-brand-600" />
                <span>Loading documents...</span>
              </div>
            ) : catalogItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-4 text-center">
                <BookOpen className="w-6 h-6 text-slate-300 mb-1" />
                <span>No files found for this selection</span>
              </div>
            ) : (
              catalogItems.map((item) => {
                const added = isDocInSession(item);
                const isAdding = addingDocId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition ${
                      added
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-slate-500">
                          <span className="bg-white px-1 rounded border border-slate-200">{item.code}</span>
                          <span>•</span>
                          <span className="font-sans text-brand-700 font-bold">{item.pageCount}p</span>
                          <span>•</span>
                          <span className="font-sans text-slate-400">{formatFileSize(item.fileSizeBytes)}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">
                          {item.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {added ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddCatalogDoc(item)}
                          disabled={isAdding || documents.length >= 10}
                          className="touch-btn px-2.5 py-1 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 transition active:scale-95 disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {isAdding ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
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

        {/* RIGHT COLUMN: Mobile Phone QR Upload (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-[#0071e3]" />
              <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                Mobile Phone QR Upload
              </h3>
            </div>
            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
              Instant Sync
            </span>
          </div>

          {/* Centered QR code and Structured 3-Step Guide */}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center py-2 px-1">
            {session?.qrCodeUrl ? (
              <div className="p-2 bg-white rounded-2xl shadow-xs border border-slate-200">
                <img
                  src={session.qrCodeUrl}
                  alt="Upload QR"
                  className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl"
                />
              </div>
            ) : (
              <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center bg-slate-100 rounded-2xl text-slate-400 text-xs">
                Generating QR...
              </div>
            )}

            {/* 3-Step Clear Visual Flow */}
            <div className="w-full max-w-xs mt-2.5 grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-1.5">
                <span className="text-[9px] font-bold text-[#0071e3] block">1. SCAN</span>
                <span className="text-[10px] text-slate-600 font-medium leading-tight block mt-0.5">Open camera</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-1.5">
                <span className="text-[9px] font-bold text-[#0071e3] block">2. UPLOAD</span>
                <span className="text-[10px] text-slate-600 font-medium leading-tight block mt-0.5">Pick files</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-1.5">
                <span className="text-[9px] font-bold text-[#0071e3] block">3. PRINT</span>
                <span className="text-[10px] text-slate-600 font-medium leading-tight block mt-0.5">Syncs here</span>
              </div>
            </div>
          </div>

          {/* Testing actions row */}
          <div className="flex-shrink-0 space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex gap-1.5">
              <a
                href={session?.mobileUploadUrl || '#'}
                target="_blank"
                rel="noreferrer"
                className="touch-btn flex-1 bg-slate-900 hover:bg-black text-white text-[11px] font-semibold py-1.5 px-2 rounded-xl flex items-center justify-center space-x-1 shadow-xs transition active:scale-[0.98]"
              >
                <span>Open Mobile Uploader</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold flex items-center space-x-1 border border-slate-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
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
              className="w-full py-1 text-slate-500 hover:text-slate-800 text-[10px] font-medium flex items-center justify-center space-x-1 transition"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Or browse local files / USB</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar if uploading */}
      {uploading && (
        <div className="flex-shrink-0 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex justify-between text-[11px] font-bold text-slate-700">
            <span>Uploading document(s)...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-brand-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Ready to Print (X/10 Files) */}
      <div className="flex-shrink-0 bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-brand-600" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide">
              Ready to Print ({documents.length}/10 files)
            </h3>
          </div>

          {documents.length > 0 && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Verified</span>
              </span>
              <span className="text-slate-600 font-extrabold text-[11px]">
                Total: {documents.reduce((acc, d) => acc + (d.pageCount || 1), 0)} pages
              </span>
            </div>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="py-2.5 text-center text-slate-400 text-xs flex items-center justify-center space-x-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <FileText className="w-4 h-4 text-slate-300" />
            <span>No documents added yet. Select college files on the left or scan mobile QR on the right.</span>
          </div>
        ) : (
          <div className="max-h-[110px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pr-1">
            {documents.map((doc, idx) => {
              const docId = doc.id || doc._id;
              const isCatalog = doc.source === 'COLLEGE_CATALOG';
              return (
                <div
                  key={docId || idx}
                  className="bg-slate-50/80 hover:bg-slate-100/90 rounded-xl p-2 border border-slate-200 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                          {isCatalog ? (
                            <>
                              <GraduationCap className="w-2.5 h-2.5 text-slate-500" />
                              <span>Official</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-2.5 h-2.5 text-slate-500" />
                              <span>Mobile</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600">
                          {doc.pageCount || 1}p
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {doc.originalFilename || doc.filename}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(docId)}
                    className="touch-btn p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition flex-shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DOCKED NAVIGATION FOOTER */}
      <div className="flex-shrink-0 pt-2 flex items-center justify-between border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="touch-btn px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Kiosk Home</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={documents.length === 0 || uploading}
          className={`touch-btn px-7 py-3 rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition ${
            documents.length > 0 && !uploading
              ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Configure Print Settings ({documents.length} {documents.length === 1 ? 'file' : 'files'})</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
