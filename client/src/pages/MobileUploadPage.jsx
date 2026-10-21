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
  Layers,
  RotateCcw
} from 'lucide-react';
import { getSession, createSession } from '../services/sessionService';
import { uploadFiles } from '../services/uploadService';

export default function MobileUploadPage() {
  const [searchParams] = useSearchParams();
  const sessionFromQuery = searchParams.get('session');
  const tokenFromQuery = searchParams.get('token');
  const kioskFromQuery = searchParams.get('kiosk');

  const [sessionIdInput, setSessionIdInput] = useState(sessionFromQuery || '');
  const [activeSession, setActiveSession] = useState(null);
  const [sessionClosedInfo, setSessionClosedInfo] = useState(null);
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
      setSessionClosedInfo(null);
      const res = await getSession(sId);
      
      // If session is not active or expired, terminate immediately
      if (res.isExpired || res.session?.status !== 'ACTIVE') {
        const status = res.session?.status || 'COMPLETED';
        setSessionClosedInfo({ sessionId: sId, status });
        setActiveSession(null);
        sessionStorage.removeItem('scp_session_id');
        sessionStorage.removeItem('scp_session_token');
        return;
      }

      setActiveSession(res.session);
      setUploadedFiles(res.documents || []);
      if (tokenFromQuery) {
        sessionStorage.setItem('scp_session_id', sId);
        sessionStorage.setItem('scp_session_token', tokenFromQuery);
      }
    } catch (err) {
      if (err.message && (err.message.includes('not found') || err.message.includes('expired') || err.message.includes('invalid'))) {
        setSessionClosedInfo({ sessionId: sId, status: 'EXPIRED' });
        setActiveSession(null);
      } else {
        setErrorMessage(err.message || 'Could not connect to kiosk session.');
        setActiveSession(null);
      }
    } finally {
      setLoadingSession(false);
    }
  };

  // Live session status heartbeat / polling:
  // Detects when the kiosk prints, confirms collection, or resets session
  useEffect(() => {
    if (!activeSession?.sessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await getSession(activeSession.sessionId);
        if (res.isExpired || res.session?.status !== 'ACTIVE') {
          clearInterval(interval);
          setSessionClosedInfo({
            sessionId: activeSession.sessionId,
            status: res.session?.status || 'COMPLETED'
          });
          setActiveSession(null);
          sessionStorage.removeItem('scp_session_id');
          sessionStorage.removeItem('scp_session_token');
        } else if (Array.isArray(res.documents)) {
          setUploadedFiles(res.documents);
        }
      } catch (err) {
        if (err.message && (err.message.includes('not found') || err.message.includes('invalid') || err.message.includes('expired'))) {
          clearInterval(interval);
          setSessionClosedInfo({
            sessionId: activeSession.sessionId,
            status: 'COMPLETED'
          });
          setActiveSession(null);
          sessionStorage.removeItem('scp_session_id');
          sessionStorage.removeItem('scp_session_token');
        }
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeSession?.sessionId]);

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
      // If backend rejected because session closed on kiosk
      if (err.message && (err.message.includes('no longer active') || err.message.includes('ended') || err.message.includes('expired'))) {
        setSessionClosedInfo({
          sessionId: activeSession.sessionId,
          status: 'COMPLETED'
        });
        setActiveSession(null);
        sessionStorage.removeItem('scp_session_id');
        sessionStorage.removeItem('scp_session_token');
      } else {
        setErrorMessage(err.message || 'File upload failed');
      }
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto space-y-6 pt-4">
        {/* Mobile Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#0071e3] rounded-2xl flex items-center justify-center mx-auto shadow-sm text-white">
            <Smartphone className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Mobile Document Transfer</h1>
          <p className="text-xs text-slate-500">
            Smart Campus Print • Cross-Device Session Sync
          </p>
        </div>

        {/* 1. Session Closed / Completed Screen */}
        {sessionClosedInfo ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                <Sparkles className="w-3 h-3 text-[#0071e3]" />
                <span>Session Ended</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900">
                Session Finished at Kiosk
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Your printing session has ended. Files from this session have been printed and safely erased from the kiosk server.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-600 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Previous Session:</span>
                <span className="font-mono font-semibold text-slate-800">{sessionClosedInfo.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-700">● {sessionClosedInfo.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Privacy Status:</span>
                <span className="font-semibold text-slate-700">Storage Purged</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSessionClosedInfo(null);
                setActiveSession(null);
                setSessionIdInput('');
                setErrorMessage(null);
                setSuccessMessage(null);
                window.history.replaceState({}, document.title, window.location.pathname);
              }}
              className="touch-btn w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-3.5 rounded-xl text-xs transition active:scale-[0.98]"
            >
              Connect to a New Session
            </button>
          </div>
        ) : !activeSession ? (
          /* 2. Connect Screen */
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Connect to Kiosk Terminal</h2>
            
            {/* Quick 1-click direct session creation for testing */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Quick Test / Direct Mobile Session</span>
              </span>
              <p className="text-[11px] text-slate-600">
                Don't have a session code? Tap below to start an instant upload session for the main campus kiosk:
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoadingSession(true);
                    setErrorMessage(null);
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
                className="touch-btn w-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold py-2.5 rounded-xl text-xs transition active:scale-[0.98]"
              >
                {loadingSession ? 'Initializing Session...' : 'Start Direct Mobile Upload Session'}
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0071e3] uppercase"
              />
            </div>

            <button
              onClick={() => loadSession(sessionIdInput)}
              disabled={!sessionIdInput.trim() || loadingSession}
              className="touch-btn w-full bg-slate-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl transition text-xs active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
            >
              {loadingSession ? 'Connecting...' : 'Connect with Code'}
            </button>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-rose-900">{errorMessage}</p>
                    {errorMessage.toLowerCase().includes('network') && (
                      <p className="text-[11px] text-rose-700 leading-relaxed">
                        Make sure your mobile phone is connected to the same Wi-Fi network as the kiosk computer.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loadSession(sessionIdInput || sessionFromQuery)}
                  className="w-full mt-1 bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold py-2 rounded-xl text-[11px] transition active:scale-[0.98]"
                >
                  Retry Connection
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 3. Active Upload Screen */
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
              className="bg-white rounded-3xl p-8 border-2 border-dashed border-[#0071e3]/40 hover:border-[#0071e3] shadow-xs text-center cursor-pointer transition space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="w-16 h-16 bg-blue-50 text-[#0071e3] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
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
                  <div className="bg-[#0071e3] h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
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
                    <FileText className="w-5 h-5 text-[#0071e3] flex-shrink-0" />
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

            {/* Live Guidance Card */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
              <span className="font-bold block flex items-center gap-1.5 text-blue-950">
                <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
                <span>Next on Kiosk Screen:</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
                When you're done selecting documents, look at the kiosk touch screen to choose paper size, B&W/color mode, and pay. This mobile session will automatically close once printing is complete.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 py-4">
        Smart Campus Print • Kiosk Mobile Upload Link
      </footer>
    </div>
  );
}
