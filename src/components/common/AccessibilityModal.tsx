import React from 'react';
import { X, Type, Volume2, Globe, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { TextSize, Language } from '../../types';

export const AccessibilityModal: React.FC = () => {
  const {
    language,
    setLanguage,
    textSize,
    setTextSize,
    soundEnabled,
    setSoundEnabled,
    showAccessibilityModal,
    setShowAccessibilityModal,
  } = useApp();
  const t = getTranslation(language);

  if (!showAccessibilityModal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t.accessibility}
          </h3>
          <button
            onClick={() => setShowAccessibilityModal(false)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Text Size */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-600" />
            <span>{t.textSize}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'xlarge'] as TextSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setTextSize(size)}
                className={`py-3 px-2 rounded-xl text-center font-bold text-sm border-2 transition-all ${
                  textSize === size
                    ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs ring-2 ring-amber-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {size === 'normal' ? t.normal : size === 'large' ? t.large : t.xlarge}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sound Effects */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>{t.sound}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSoundEnabled(true)}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-100 border-emerald-600 text-emerald-950 shadow-xs ring-2 ring-emerald-200'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {soundEnabled && <Check className="w-4 h-4 text-emerald-700" />}
              <span>{t.soundOn}</span>
            </button>
            <button
              onClick={() => setSoundEnabled(false)}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-1.5 ${
                !soundEnabled
                  ? 'bg-slate-200 border-slate-600 text-slate-900 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {!soundEnabled && <Check className="w-4 h-4" />}
              <span>{t.soundOff}</span>
            </button>
          </div>
        </div>

        {/* 3. Language */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span>{t.language}</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['hi', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-3 rounded-xl font-bold text-sm border-2 transition-all flex items-center justify-center gap-1.5 ${
                  language === lang
                    ? 'bg-sky-100 border-sky-600 text-sky-950 shadow-xs ring-2 ring-sky-200'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {language === lang && <Check className="w-4 h-4 text-sky-700" />}
                <span>{lang === 'hi' ? '🇮🇳 ' + t.hindi : '🇬🇧 ' + t.english}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowAccessibilityModal(false)}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-sm"
        >
          {t.done}
        </button>
      </div>
    </div>
  );
};
