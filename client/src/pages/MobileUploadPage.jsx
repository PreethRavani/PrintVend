import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Printer,
  Smartphone,
  UploadCloud,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import { getSession } from '../services/sessionService';
import { uploadFiles } from '../services/uploadService';

export default function MobileUploadPage() {
  const [searchParams] = useSearchParams();
  const sessionFromQuery = searchParams.get('session');
  const tokenFromQuery = searchParams.get('token');
  const kioskFromQuery = searchParams.get('kiosk');

  const [sessionIdInput, setSessionIdInput] = useState(sessionFromQuery || '');
  const [activeSession, setActiveSession] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingSession, setLoadingSession] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (sessionFromQuery) {
      loadSession(sessionFromQuery);
    }
  }, [sessionFromQuery]);

  const loadSession = async (sId) => {
    try {
      setLoadingSession(true);
      setErrorMessage(null);
      const res = await getSession(sId);
      if (res.isExpired) {
        setErrorMessage('This printing session has expired. Please scan a fresh QR code at the kiosk.');
        setActiveSession(null);
      } else {
        setActiveSession(res.session);
        setUploadedFiles(res.documents || []);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Could not connect to kiosk session.');
      setActiveSession(null);
    } finally {
      setLoadingSession(false);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeSession) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate
    const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(ext)) {
        setErrorMessage(`"${file.name}" is not a supported format (PDF, JPG, PNG).`);
        return;
      }
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 25MB limit.`);
        return;
      }
      validFiles.push(file);
    }

    try {
      setUploading(true);
      setUploadProgress(20);

      const newDocs = await uploadFiles(activeSession.sessionId, validFiles, (pe) => {
        const percent = Math.round((pe.loaded * 100) / pe.total);
        setUploadProgress(percent);
      });

      setUploadedFiles((prev) => [...prev, ...newDocs]);
      setSuccessMessage('File(s) transferred successfully! Look at the kiosk screen.');
      setUploadProgress(100);
      setTimeout(() => setUploading(false), 500);
    } catch (err) {
      setErrorMessage(err.message || 'File upload failed');
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto space-y-6 pt-4">
        {/* Mobile Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-brand-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-md text-white">
            <Smartphone className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Mobile Document Transfer</h1>
          <p className="text-xs text-slate-500">
            Smart Campus Print • Cross-Device Session Sync
          </p>
        </div>

        {/* Session Card */}
        {!activeSession ? (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Connect to Kiosk Terminal</h2>
            
            {/* Quick 1-click direct session creation for testing */}
            <div className="p-3.5 bg-brand-50 rounded-2xl border border-brand-200/80 space-y-2">
              <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Quick Test / Direct Mobile Session</span>
              </span>
              <p className="text-[11px] text-brand-700">
                Don't have a session code? Tap below to start an instant upload session for the main campus kiosk:
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoadingSession(true);
                    setErrorMessage(null);
                    const { createSession } = await import('../services/sessionService');
                    const res = await createSession('KIOSK-LIB-01');
                    setActiveSession(res);
                    sessionStorage.setItem('scp_session_id', res.sessionId);
                    sessionStorage.setItem('scp_session_token', res.token);
                  } catch (e) {
                    setErrorMessage(e.message || 'Could not start mobile session');
                  } finally {
                    setLoadingSession(false);
                  }
                }}
                disabled={loadingSession}
                className="touch-btn w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm transition"
              >
                {loadingSession ? 'Initializing Session...' : '⚡ Start Direct Mobile Upload Session'}
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">OR ENTER SESSION ID</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-500">Enter Session ID (displayed on kiosk)</label>
              <input
                type="text"
                placeholder="e.g. SES-1029-A1B2"
                value={sessionIdInput}
                onChange={(e) => setSessionIdInput(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
              />
            </div>

            <button
              onClick={() => loadSession(sessionIdInput)}
              disabled={!sessionIdInput.trim() || loadingSession}
              className="touch-btn w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-md transition text-xs"
            >
              {loadingSession ? 'Connecting...' : 'Connect with Code'}
            </button>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Connected Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold">Connected to Kiosk</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                {activeSession.sessionId}
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Upload Action Card */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-brand-300 hover:border-brand-500 shadow-md text-center cursor-pointer transition space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">Tap to Choose Files from Phone</h3>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 25MB</p>
              </div>

              <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600 font-semibold">
                Select from Files or Photos
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Transferring to kiosk...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-brand-600 h-2 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* List of Files Already Sent */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Files on Kiosk Screen ({uploadedFiles.length})
              </div>

              {uploadedFiles.map((f, i) => (
                <div
                  key={f.id || f._id || i}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-slate-800 truncate">
                      {f.filename || f.originalFilename}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Uploaded</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Finish Guidance */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-900 space-y-1">
              <span className="font-bold block">Next Step:</span>
              <p>
                Turn back to the physical kiosk touchscreen to configure copies, check the price, and finalize your print!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        <Link to="/" className="hover:text-brand-600 font-semibold">
          Return to Kiosk Terminal View
        </Link>
      </footer>
    </div>
  );
}
