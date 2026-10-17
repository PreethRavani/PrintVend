import React, { useState } from 'react';
import Header from '../components/Header';
import { useKiosk } from '../context/KioskContext';
import WelcomeScreen from '../features/kiosk/WelcomeScreen';
import QRTransferModal from '../features/kiosk/QRTransferModal';
import DocumentUploadStep from '../features/upload/DocumentUploadStep';
import PrintSettingsStep from '../features/print-settings/PrintSettingsStep';
import PriceQuoteStep from '../features/print-settings/PriceQuoteStep';
import PaymentStep from '../features/payments/PaymentStep';
import QueueProgressStep from '../features/queue/QueueProgressStep';
import CollectionStep from '../features/queue/CollectionStep';
import CompletionStep from '../features/queue/CompletionStep';

export default function KioskPage() {
  const { currentStep, setCurrentStep, startNewSession, session } = useKiosk();
  const [showQrModal, setShowQrModal] = useState(false);

  const handleStartSession = async (studentId) => {
    try {
      await startNewSession(studentId);
    } catch (err) {
      alert(`Could not start printing session: ${err.message}`);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation bar ONLY shown on Home / Welcome Screen as requested */}
      {currentStep === 1 && <Header />}

      {/* Main Kiosk Viewport: occupies remaining height with natural comfortable scroll when needed */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-2 sm:py-3 flex flex-col min-h-0 overflow-y-auto">
        {currentStep === 1 && (
          <div className="w-full mx-auto my-auto py-1">
            <WelcomeScreen onStartSession={handleStartSession} />
          </div>
        )}

        {currentStep === 3 && (
          <DocumentUploadStep
            onNext={() => setCurrentStep(4)}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 4 && (
          <PrintSettingsStep
            onNext={() => setCurrentStep(5)}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <PriceQuoteStep
            onNext={() => setCurrentStep(6)}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <PaymentStep
            onNext={() => setCurrentStep(7)}
            onBack={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 7 && (
          <QueueProgressStep
            onReadyForCollection={() => setCurrentStep(8)}
          />
        )}

        {currentStep === 8 && (
          <CollectionStep
            onCollected={() => setCurrentStep(9)}
          />
        )}

        {currentStep === 9 && (
          <CompletionStep
            onFinish={() => setCurrentStep(1)}
          />
        )}
      </main>

      {/* QR Code Transfer Modal */}
      <QRTransferModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
}
