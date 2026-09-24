import React from 'react';
import { Mic, Sparkles, Volume2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound } from '../../utils/sound';
import { unlockAudioContext } from '../../utils/voiceCompanion';

export const VoiceCompanionWidget: React.FC = () => {
  const { role, setShowVoiceModal, language, soundEnabled, isCompanionSpeaking } = useApp();
  const t = getTranslation(language);

  // Only show floating button on elderly mode or caregiver mode
  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center">
      <button
        onClick={() => {
          playClickSound(soundEnabled);
          unlockAudioContext();
          setShowVoiceModal(true);
        }}
        className={`group flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 ${
          isCompanionSpeaking
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-300 ring-4 ring-emerald-200 animate-pulse'
            : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-800 text-white border-amber-300 ring-4 ring-amber-200/60'
        }`}
        aria-label={t.voiceCompanion}
        title={t.voiceCompanion}
      >
        {/* Animated Icon Avatar */}
        <div className="relative flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg border border-white/30">
            {isCompanionSpeaking ? '🔊' : '🎙️'}
          </div>
          {/* Subtle radar pulse ring */}
          <span className="absolute -inset-1 rounded-full bg-white/30 animate-ping opacity-75" />
        </div>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight leading-tight">
              {t.voiceCompanion}
            </span>
            <span className="text-[10px] bg-white/30 px-1.5 py-0.2 rounded-full uppercase font-black tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[11px] text-amber-100 font-medium leading-none mt-0.5">
            {language === 'hi' ? 'बोलने के लिए छुएं' : 'Tap to speak anytime'}
          </span>
        </div>
      </button>
    </div>
  );
};
