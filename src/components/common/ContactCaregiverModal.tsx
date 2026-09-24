import React, { useState } from 'react';
import { PhoneCall, X, User, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound } from '../../utils/sound';

export const ContactCaregiverModal: React.FC = () => {
  const { language, userProfile, showCallModal, setShowCallModal, soundEnabled } = useApp();
  const t = getTranslation(language);

  const [callInitiated, setCallInitiated] = useState(false);

  if (!showCallModal) return null;

  const handleCall = () => {
    playClickSound(soundEnabled);
    setCallInitiated(true);
    setTimeout(() => {
      setCallInitiated(false);
      setShowCallModal(false);
    }, 3000);
  };

  const handleClose = () => {
    playClickSound(soundEnabled);
    setCallInitiated(false);
    setShowCallModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-rose-200 shadow-2xl text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-rose-100 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          aria-label={t.cancel}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-100 border-4 border-rose-300 text-rose-600 mb-4 shadow-inner">
          <PhoneCall className="w-10 h-10 animate-bounce" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {t.callModalTitle}
        </h3>

        <p className="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
          {t.callModalDesc}
        </p>

        {/* Contact details box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
              👩‍⚕️
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg">
                {userProfile.caregiverName}
              </div>
              <div className="text-sm font-semibold text-rose-700">
                {userProfile.caregiverPhone}
              </div>
              <div className="text-xs text-slate-500">
                {language === 'hi' ? 'प्राथमिक परिवार देखभालकर्ता' : 'Primary Family Caregiver'}
              </div>
            </div>
          </div>
        </div>

        {callInitiated ? (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 font-bold text-base flex items-center justify-center gap-2 animate-pulse">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <span>
              {language === 'hi'
                ? `अनीता जी से संपर्क किया जा रहा है... (${userProfile.caregiverPhone})`
                : `Calling Anita Sharma now... (${userProfile.caregiverPhone})`}
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleCall}
              className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-6 h-6" />
              <span>{t.callButton}</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
