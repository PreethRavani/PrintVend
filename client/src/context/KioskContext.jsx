import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getKiosks, getKioskById } from '../services/kioskService';
import { createSession, getSession, closeSession } from '../services/sessionService';
import { getQuote, createJob, getJobStatus, simulatePayment, confirmCollection, cancelJob } from '../services/jobService';

const KioskContext = createContext();

export function KioskProvider({ children }) {
  // Navigation & Step Flow
  const [currentStep, setCurrentStep] = useState(1);

  // Kiosk hardware data
  const [kiosks, setKiosks] = useState([]);
  const [selectedKioskId, setSelectedKioskId] = useState(
    import.meta.env.VITE_KIOSK_ID || 'KIOSK-LIB-01'
  );
  const [currentKiosk, setCurrentKiosk] = useState(null);
  const [kiosksLoading, setKiosksLoading] = useState(true);

  // Active User Session
  const [session, setSession] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Print Configuration
  const [printSettings, setPrintSettings] = useState({
    paperSize: 'A4',
    printMode: 'BW',
    copies: 1,
    pageRange: 'all',
    duplex: false,
    orientation: 'PORTRAIT',
    pageOrdering: 'STANDARD'
  });

  // Authoritative Backend Quote
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Active Job & Tracking
  const [activeJob, setActiveJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [cleanupReport, setCleanupReport] = useState(null);

  // Accessibility & UI settings
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);

  // Fetch available kiosks
  const refreshKiosks = useCallback(async () => {
    try {
      setKiosksLoading(true);
      const data = await getKiosks();
      setKiosks(data);
      const found = data.find((k) => k.kioskId === selectedKioskId) || data[0];
      if (found) {
        setCurrentKiosk(found);
      }
    } catch (err) {
      console.error('Failed to load kiosks:', err);
    } finally {
      setKiosksLoading(false);
    }
  }, [selectedKioskId]);

  useEffect(() => {
    refreshKiosks();
  }, [refreshKiosks]);

  // Start new printing session
  const startNewSession = async (studentId = null) => {
    try {
      setSessionLoading(true);
      const sessionData = await createSession(selectedKioskId, studentId);
      setSession(sessionData);
      sessionStorage.setItem('scp_session_id', sessionData.sessionId);
      sessionStorage.setItem('scp_session_token', sessionData.token);
      setDocuments([]);
      setActiveJob(null);
      setJobStatus(null);
      setCleanupReport(null);
      setCurrentStep(3); // Direct to upload screen
      return sessionData;
    } catch (err) {
      console.error('Failed to create session:', err);
      throw err;
    } finally {
      setSessionLoading(false);
    }
  };

  // Sync / refresh documents for active session
  const refreshDocuments = useCallback(async () => {
    if (!session?.sessionId) return;
    try {
      const data = await getSession(session.sessionId);
      if (data?.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error refreshing session docs:', err);
    }
  }, [session?.sessionId]);

  // Polling for mobile QR uploads if user is waiting on upload screen
  useEffect(() => {
    if (currentStep === 3 && session?.sessionId) {
      const interval = setInterval(refreshDocuments, 3000);
      return () => clearInterval(interval);
    }
  }, [currentStep, session?.sessionId, refreshDocuments]);

  // Calculate quote automatically when settings or documents change
  const refreshQuote = useCallback(async () => {
    if (documents.length === 0) {
      setQuote(null);
      return;
    }

    try {
      setQuoteLoading(true);
      const totalDocumentPages = documents.reduce((sum, d) => sum + (d.pageCount || 1), 0);
      const quoteData = await getQuote({
        paperSize: printSettings.paperSize,
        printMode: printSettings.printMode,
        copies: printSettings.copies,
        pageRange: printSettings.pageRange,
        duplex: printSettings.duplex,
        totalDocumentPages
      });
      setQuote(quoteData);
    } catch (err) {
      console.error('Quote calculation error:', err);
    } finally {
      setQuoteLoading(false);
    }
  }, [documents, printSettings]);

  useEffect(() => {
    if (currentStep >= 4 && documents.length > 0) {
      refreshQuote();
    }
  }, [currentStep, documents, printSettings, refreshQuote]);

  // Create job from current session
  const submitJob = async () => {
    if (!session?.sessionId || documents.length === 0) return null;
    try {
      const job = await createJob({
        sessionId: session.sessionId,
        kioskId: selectedKioskId,
        documentIds: documents.map((d) => d.id || d._id),
        settings: printSettings
      });
      setActiveJob(job);
      setJobStatus({
        status: job.status,
        queuePosition: job.queuePosition,
        estimatedWaitMinutes: job.estimatedWaitMinutes,
        printingProgressPercentage: 0
      });
      return job;
    } catch (err) {
      console.error('Error creating job:', err);
      throw err;
    }
  };

  // Process simulated payment
  const handlePayment = async ({ paymentMode = 'SIMULATED_UPI', upiId = 'student@okhdfcbank', forceFail = false }) => {
    if (!activeJob) throw new Error('No active print job found');
    try {
      const res = await simulatePayment({
        jobNumber: activeJob.jobNumber,
        sessionId: session.sessionId,
        amount: quote?.totalAmount || activeJob.quote.totalAmount,
        paymentMode,
        upiId,
        forceFail
      });

      setActiveJob(res.job);
      setJobStatus({
        status: res.job.status,
        queuePosition: res.job.queuePosition,
        estimatedWaitMinutes: res.job.estimatedWaitMinutes,
        printingProgressPercentage: res.job.printingProgressPercentage || 10
      });
      return res;
    } catch (err) {
      console.error('Payment failed:', err);
      throw err;
    }
  };

  // Live polling for queue status and print progression
  useEffect(() => {
    if (!activeJob?.jobNumber) return;
    if (jobStatus?.status === 'COLLECTED' || jobStatus?.status === 'CANCELLED') return;

    const interval = setInterval(async () => {
      try {
        const statusData = await getJobStatus(activeJob.jobNumber);
        setJobStatus((prev) => ({
          ...prev,
          ...statusData
        }));
      } catch (err) {
        console.error('Status poll error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJob?.jobNumber, jobStatus?.status]);

  // Confirm collection and trigger cleanup
  const handleConfirmCollection = async (pinCode = null) => {
    if (!activeJob?.jobNumber) return;
    try {
      const res = await confirmCollection(activeJob.jobNumber, pinCode || jobStatus?.collectionCode);
      setCleanupReport(res.cleanupReport);
      setJobStatus((prev) => ({ ...prev, status: 'COLLECTED' }));
      setCurrentStep(9); // Success / Completion screen
      return res;
    } catch (err) {
      console.error('Collection confirmation error:', err);
      throw err;
    }
  };

  // Reset entire kiosk session
  const resetSession = async () => {
    if (session?.sessionId) {
      try {
        await closeSession(session.sessionId);
      } catch (e) {
        // Ignore cleanup on reset
      }
    }
    sessionStorage.removeItem('scp_session_id');
    sessionStorage.removeItem('scp_session_token');
    setSession(null);
    setDocuments([]);
    setActiveJob(null);
    setJobStatus(null);
    setCleanupReport(null);
    setPrintSettings({
      paperSize: 'A4',
      printMode: 'BW',
      copies: 1,
      pageRange: 'all',
      duplex: false,
      orientation: 'PORTRAIT',
      pageOrdering: 'STANDARD'
    });
    setQuote(null);
    setCurrentStep(1);
    refreshKiosks();
  };

  return (
    <KioskContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        kiosks,
        selectedKioskId,
        setSelectedKioskId,
        currentKiosk,
        kiosksLoading,
        refreshKiosks,
        session,
        sessionLoading,
        startNewSession,
        documents,
        setDocuments,
        refreshDocuments,
        printSettings,
        setPrintSettings,
        quote,
        quoteLoading,
        refreshQuote,
        activeJob,
        jobStatus,
        submitJob,
        handlePayment,
        handleConfirmCollection,
        cleanupReport,
        resetSession,
        highContrast,
        setHighContrast,
        largeText,
        setLargeText
      }}
    >
      {children}
    </KioskContext.Provider>
  );
}

export const useKiosk = () => useContext(KioskContext);
