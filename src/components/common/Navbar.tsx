import React from 'react';
import { Settings, Globe, Sparkles, User, HeartHandshake, HelpCircle, Mic, Building2, Pill, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { Language, UserRole } from '../../types';
import { unlockAudioContext } from '../../utils/voiceCompanion';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    setShowAccessibilityModal,
    setShowDemoTourModal,
    setShowVoiceModal,
    setShowMedicalModal,
    setShowPharmacyModal,
    cartCount,
    loadDemoData,
  } = useApp();
  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white font-black text-xl shadow-xs">
            🌸
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
              {t.appName}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-amber-800 tracking-wide hidden sm:block">
              {t.appTagline}
            </span>
          </div>
        </div>

        {/* Zone 2: Role Switcher Tabs */}
        <nav className="flex items-center p-1 bg-amber-50/80 border border-amber-200 rounded-2xl">
          <button
            onClick={() => setRole('elderly')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'elderly'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>👴</span>
            <span className="hidden xs:inline">{t.elderlyMode}</span>
          </button>

          <button
            onClick={() => setRole('caregiver')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              role === 'caregiver'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>👩‍⚕️</span>
            <span className="hidden xs:inline">{t.caregiverMode}</span>
          </button>
        </nav>

        {/* Zone 3: Actions (Medicine Store, Medical/Hospitals, Voice Companion, Language, Accessibility, SIH Demo Mode) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Medicine Store Online Button */}
          <button
            onClick={() => setShowPharmacyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs transition-all shadow-2xs active:scale-95 relative"
            title="Online Medicine Store & Refills"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">{language === 'hi' ? 'दवा स्टोर' : 'Medicine Store'}</span>
            {cartCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-amber-950 text-[10px] font-black flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Nearest Hospitals & Neuro Button */}
          <button
            onClick={() => setShowMedicalModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 font-extrabold text-xs transition-all shadow-2xs active:scale-95"
            title="Nearest Hospitals & Neurosurgeons"
          >
            <Building2 className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">{language === 'hi' ? 'अस्पताल व न्यूरो' : 'Hospitals & Neuro'}</span>
          </button>

          {/* AI Voice Companion Button */}
          <button
            onClick={() => {
              unlockAudioContext();
              setShowVoiceModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs transition-all shadow-xs active:scale-95"
            title="Open AI Voice Companion"
          >
            <Mic className="w-3.5 h-3.5 fill-current animate-pulse" />
            <span className="hidden sm:inline">{language === 'hi' ? 'आवाज़ साथी' : 'AI Voice'}</span>
          </button>

          {/* SIH Demo Tour Button */}
          <button
            onClick={() => setShowDemoTourModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs transition-colors shadow-2xs"
            title="SIH Presentation Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden md:inline">{t.demoMode}</span>
          </button>

          {/* Language Toggle Button */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Accessibility Settings */}
          <button
            onClick={() => setShowAccessibilityModal(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title={t.accessibility}
            aria-label={t.accessibility}
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
