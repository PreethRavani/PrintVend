import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  AlertTriangle,
  QrCode,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Plus
} from 'lucide-react';
import { useKiosk } from '../../context/KioskContext';
import { uploadFiles, removeDocument } from '../../services/uploadService';

export default function DocumentUploadStep({ onNext, onBack, onShowQrModal }) {
  const { session, documents, setDocuments, currentKiosk } = useKiosk();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setUploadError(null);

    // Validate client-side
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

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Step 1 of 4</span>
          <h2 className="text-2xl font-bold text-slate-900">Upload Your Documents</h2>
          <p className="text-sm text-slate-500">
            Select files from this kiosk terminal or transfer them directly from your mobile phone.
          </p>
        </div>

        <button
          onClick={onShowQrModal}
          className="touch-btn self-start sm:self-auto px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
        >
          <QrCode className="w-4 h-4 text-brand-600" />
          <span>Scan Phone QR</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Touch Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-3 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand-500 bg-brand-50/70 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/60 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-800">
              Tap here to browse or drag & drop files
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supported Formats: <strong>PDF</strong> (primary), <strong>JPG</strong>, <strong>PNG</strong> (Up to 25MB each)
            </p>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-medium">
            <span>Terminal: {currentKiosk?.name || 'Local Kiosk'}</span>
          </div>
        </div>
      </div>

      {/* Upload Progress Bar */}
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

      {/* Uploaded Documents List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Ready to Print ({documents.length}/10 files)
          </h3>
          {documents.length > 0 && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Metadata & Page Counts Verified</span>
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400 text-sm">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            No documents uploaded yet. Upload a PDF or picture above to proceed.
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, idx) => {
              const docId = doc.id || doc._id;
              const isPdf = doc.mimeType?.includes('pdf') || doc.filename?.endsWith('.pdf');
              return (
                <div
                  key={docId || idx}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isPdf ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                      }`}
                    >
                      {isPdf ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{doc.filename || doc.originalFilename}</p>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>{formatFileSize(doc.fileSizeBytes)}</span>
                        <span>•</span>
                        <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                          {doc.pageCount || 1} {doc.pageCount === 1 ? 'page' : 'pages'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600">Securely Stored</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(docId)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
          onClick={onBack}
          className="touch-btn px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onNext}
          disabled={documents.length === 0 || uploading}
          className={`touch-btn px-8 py-3.5 rounded-xl text-base font-bold shadow-md flex items-center space-x-2 transition ${
            documents.length > 0 && !uploading
              ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 active:scale-95'
              : 'bg-slate-300 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>Configure Print Settings</span>
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </div>
    </div>
  );
}
