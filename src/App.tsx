import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { ElderlyHome } from './components/elderly/ElderlyHome';
import { CaregiverDashboard } from './components/caregiver/CaregiverDashboard';
import { MemoryMatch } from './components/games/MemoryMatch';
import { PictureRecall } from './components/games/PictureRecall';
import { NumberMatch } from './components/games/NumberMatch';
import { ColorPattern } from './components/games/ColorPattern';
import { MusicMemory } from './components/games/MusicMemory';
import { SimpleQuiz } from './components/games/SimpleQuiz';
import { GameResultModal } from './components/elderly/GameResultModal';
import { MoodCheckIn } from './components/elderly/MoodCheckIn';
import { ContactCaregiverModal } from './components/common/ContactCaregiverModal';
import { AccessibilityModal } from './components/common/AccessibilityModal';
import { OnboardingModal } from './components/common/OnboardingModal';
import { SIHDemoTourModal } from './components/common/SIHDemoTourModal';
import { AIVoiceCompanionModal } from './components/voice/AIVoiceCompanionModal';
import { VoiceCompanionWidget } from './components/voice/VoiceCompanionWidget';
import { NearestHospitalsModal } from './components/medical/NearestHospitalsModal';
import { MedicineStoreModal } from './components/pharmacy/MedicineStoreModal';

const AppContent: React.FC = () => {
  const {
    role,
    activeScreen,
    activeGameId,
    setActiveScreen,
    showMedicalModal,
    setShowMedicalModal,
    medicalModalTab,
  } = useApp();

  const renderElderlyScreen = () => {
    if (activeScreen === 'home') {
      return <ElderlyHome />;
    }

    if (activeScreen === 'game') {
      switch (activeGameId) {
        case 'memory-match':
          return <MemoryMatch />;
        case 'picture-recall':
          return <PictureRecall />;
        case 'number-match':
          return <NumberMatch />;
        case 'color-pattern':
          return <ColorPattern />;
        case 'music-memory':
          return <MusicMemory />;
        case 'simple-quiz':
          return <SimpleQuiz />;
        default:
          return <ElderlyHome />;
      }
    }

    if (activeScreen === 'result') {
      return <GameResultModal onProceedToMood={() => setActiveScreen('mood')} />;
    }

    if (activeScreen === 'mood') {
      return <MoodCheckIn />;
    }

    return <ElderlyHome />;
  };

  return (
    <div className="min-h-screen bg-amber-50/20 text-slate-800 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <main className="flex-1 pb-16">
        {role === 'elderly' ? renderElderlyScreen() : <CaregiverDashboard />}
      </main>

      {/* Global Modals */}
      <ContactCaregiverModal />
      <AccessibilityModal />
      <OnboardingModal />
      <SIHDemoTourModal />
      <AIVoiceCompanionModal />
      <VoiceCompanionWidget />
      <NearestHospitalsModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        defaultTab={medicalModalTab}
      />
      <MedicineStoreModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
