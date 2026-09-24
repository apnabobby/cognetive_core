import React, { useState } from 'react';
import { ArrowRight, Check, Heart, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Language, UserRole } from '../../types';
import { getTranslation } from '../../utils/translations';
import { playClickSound } from '../../utils/sound';

export const OnboardingModal: React.FC = () => {
  const { hasSeenOnboarding, completeOnboarding, soundEnabled } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');
  const [selectedLang, setSelectedLang] = useState<Language>('en');

  if (hasSeenOnboarding) return null;

  const t = getTranslation(selectedLang);

  const handleNext = () => {
    playClickSound(soundEnabled);
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      completeOnboarding(selectedRole, selectedLang);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-amber-200 shadow-2xl relative overflow-hidden animate-fade-in">
        {/* Glow decoration */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-amber-600' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Screen 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 border-2 border-amber-300 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
              🌸
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.onboardingTitle}
            </h2>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              {t.onboardingDesc}
            </p>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-left text-xs sm:text-sm text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Smart India Hackathon (SIH) Prototype</span>
              </div>
              <p className="text-slate-600">
                Designed for inclusive dementia care with large buttons, high contrast, voice assistance, and real-time caregiver progress tracking.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>{t.getStarted}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 2: Choose User Role */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {t.chooseRole}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {t.chooseRoleDesc}
              </p>
            </div>

            <div className="space-y-3">
              {/* Option A: Elderly User */}
              <button
                onClick={() => setSelectedRole('elderly')}
                className={`w-full p-4 rounded-2xl border-3 text-left transition-all flex items-start gap-4 ${
                  selectedRole === 'elderly'
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shrink-0">
                  👴
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-lg">
                      {t.elderlyUser}
                    </span>
                    {selectedRole === 'elderly' && (
                      <Check className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {t.elderlyUserDesc}
                  </p>
                </div>
              </button>

              {/* Option B: Caregiver */}
              <button
                onClick={() => setSelectedRole('caregiver')}
                className={`w-full p-4 rounded-2xl border-3 text-left transition-all flex items-start gap-4 ${
                  selectedRole === 'caregiver'
                    ? 'bg-slate-50 border-slate-800 shadow-md ring-2 ring-slate-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0">
                  👩‍⚕️
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-lg">
                      {t.caregiverUser}
                    </span>
                    {selectedRole === 'caregiver' && (
                      <Check className="w-5 h-5 text-slate-900" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {t.caregiverUserDesc}
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Screen 3: Choose Language */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-slate-900">
                {t.selectLanguage}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Both Hindi & English are fully supported with voice assistance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hindi */}
              <button
                onClick={() => setSelectedLang('hi')}
                className={`p-5 rounded-2xl border-3 text-center transition-all flex flex-col items-center justify-center ${
                  selectedLang === 'hi'
                    ? 'bg-amber-50 border-amber-600 shadow-md ring-2 ring-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-4xl mb-2">🇮🇳</span>
                <span className="font-extrabold text-xl text-slate-900">हिंदी</span>
                <span className="text-xs text-slate-500 mt-1">आवाज़ व बड़े अक्षर</span>
              </button>

              {/* English */}
              <button
                onClick={() => setSelectedLang('en')}
                className={`p-5 rounded-2xl border-3 text-center transition-all flex flex-col items-center justify-center ${
                  selectedLang === 'en'
                    ? 'bg-sky-50 border-sky-600 shadow-md ring-2 ring-sky-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-4xl mb-2">🇬🇧</span>
                <span className="font-extrabold text-xl text-slate-900">English</span>
                <span className="text-xs text-slate-500 mt-1">High-contrast text</span>
              </button>
            </div>

            <div className="pt-4">
              <button
                onClick={handleNext}
                className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>{selectedLang === 'hi' ? 'मानस साथी खोलें ➔' : 'Open Manas Saathi ➔'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
