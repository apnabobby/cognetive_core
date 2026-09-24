import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MoodType } from '../../types';
import { getTranslation } from '../../utils/translations';
import { playClickSound } from '../../utils/sound';

interface MoodOption {
  type: MoodType;
  emoji: string;
  nameEn: string;
  nameHi: string;
  bgColor: string;
  borderColor: string;
}

const MOODS: MoodOption[] = [
  {
    type: 'happy',
    emoji: '😊',
    nameEn: 'Happy',
    nameHi: 'खुश व प्रसन्न',
    bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    borderColor: 'border-emerald-300',
  },
  {
    type: 'okay',
    emoji: '🙂',
    nameEn: 'Okay',
    nameHi: 'ठीक-ठाक',
    bgColor: 'bg-sky-50 hover:bg-sky-100',
    borderColor: 'border-sky-300',
  },
  {
    type: 'neutral',
    emoji: '😐',
    nameEn: 'Neutral',
    nameHi: 'सामान्य',
    bgColor: 'bg-slate-50 hover:bg-slate-100',
    borderColor: 'border-slate-300',
  },
  {
    type: 'sad',
    emoji: '😔',
    nameEn: 'Sad / Low',
    nameHi: 'उदास / सुस्त',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    borderColor: 'border-amber-300',
  },
  {
    type: 'worried',
    emoji: '😟',
    nameEn: 'Worried',
    nameHi: 'चिंतित / परेशान',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-300',
  },
];

export const MoodCheckIn: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, recordMoodAndProceed, recommendation, startActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [showNextStep, setShowNextStep] = useState<boolean>(false);

  const handleSelectMood = (mood: MoodType) => {
    playClickSound(soundEnabled);
    setSelectedMood(mood);
    setShowNextStep(true);
  };

  const handleDone = () => {
    if (selectedMood) {
      recordMoodAndProceed(selectedMood);
    } else {
      returnHome();
    }
  };

  const handleStartRecommendation = () => {
    if (selectedMood) {
      recordMoodAndProceed(selectedMood);
    }
    startActivity(recommendation.gameId);
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? 'आज आप कैसा महसूस कर रहे हैं? खुश, ठीक-ठाक, सामान्य, उदास या चिंतित। जो चेहरा आपके मन से मिलता हो, उसे दबाएं।'
          : 'How are you feeling today? Happy, Okay, Neutral, Sad, or Worried. Tap the button that matches how you feel right now.';
      speak(text);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top read aloud bar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleReadAloud}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-colors ${
            isSpeaking
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-500 mb-3">
          <Heart className="w-8 h-8 fill-rose-500 text-rose-500" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          {t.moodQuestion}
        </h1>

        <p className="text-slate-600 text-base md:text-lg mb-6">
          {t.moodSubtext}
        </p>

        {/* Large Mood Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4 mb-6">
          {MOODS.map((m) => {
            const isSelected = selectedMood === m.type;

            return (
              <button
                key={m.type}
                onClick={() => handleSelectMood(m.type)}
                className={`p-4 rounded-3xl font-bold flex flex-col items-center justify-center transition-all transform active:scale-95 border-3 select-none ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 text-slate-900 ring-4 ring-amber-200 shadow-md scale-105'
                    : `${m.bgColor} ${m.borderColor} text-slate-800 hover:scale-102`
                }`}
              >
                <span className="text-5xl md:text-6xl mb-2">{m.emoji}</span>
                <span className="text-sm md:text-base font-bold">
                  {language === 'hi' ? m.nameHi : m.nameEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Recorded Confirmation & AI Next Step */}
        {showNextStep && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4 animate-fade-in">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold text-base flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>{t.moodRecorded}</span>
            </div>

            {/* Recommended Next Activity Box */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-5 text-left">
              <div className="text-xs uppercase tracking-wider font-extrabold text-amber-900 mb-1">
                {t.recommendedForToday}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {language === 'hi' ? recommendation.titleHi : recommendation.titleEn}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {language === 'hi' ? recommendation.reasonHi : recommendation.reasonEn}
                  </p>
                </div>
                <button
                  onClick={handleStartRecommendation}
                  className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto"
                >
                  <span>{t.startActivity}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDone}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors"
              >
                {t.home}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        {language === 'hi'
          ? 'मनोदशा अवलोकन केवल देखभालकर्ता के सहयोग और व्यक्तिगत गतिविधि अनुकूलन के लिए है।'
          : 'Mood check-ins are designed to assist caregiver awareness and personalized activity comfort.'}
      </p>
    </div>
  );
};
