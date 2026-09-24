import React from 'react';
import { Volume2, VolumeX, PhoneCall, Sparkles, Play, ArrowRight, ShieldCheck, Heart, Mic, MessageSquareQuote, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { GAMES_CATALOG } from '../../utils/demoData';
import { ElderlyMedicationCard } from './ElderlyMedicationCard';
import { unlockAudioContext } from '../../utils/voiceCompanion';

export const ElderlyHome: React.FC = () => {
  const {
    language,
    setLanguage,
    speak,
    stopVoice,
    isSpeaking,
    recommendation,
    startActivity,
    setShowCallModal,
    setShowVoiceModal,
    setShowMedicalModal,
    currentMood,
  } = useApp();
  const t = getTranslation(language);

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? 'नमस्ते शर्मा जी! मानस साथी में आपका स्वागत है। आज की गतिविधियां नीचे दी गई हैं: स्मृति मिलान, चित्र स्मरण, संख्या मिलान, रंग और पैटर्न, संगीत स्मृति, और सरल प्रश्नोत्तरी। कोई भी गतिविधि शुरू करने के लिए बड़े हरे बटन पर टैप करें।'
          : "Namaste Sharma Ji! Welcome to Manas Saathi. Today's activities are ready for you below. Tap the large green Start button on any activity you wish to begin.";
      speak(text);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-6">
      {/* Elderly Greeting Header Card */}
      <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/80 to-amber-50 rounded-3xl p-6 md:p-8 border-2 border-amber-300 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl md:text-4xl">👋</span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t.patientGreeting}
              </h1>
            </div>
            <p className="text-slate-700 text-lg md:text-xl font-medium mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* Read Aloud Button */}
          <button
            onClick={handleReadAloud}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-base shadow-sm transition-all self-start sm:self-auto ${
              isSpeaking
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-white hover:bg-amber-50 text-amber-950 border-2 border-amber-300'
            }`}
            aria-label={isSpeaking ? t.stopReading : t.readAloud}
          >
            {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6 text-amber-700" />}
            <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
          </button>
        </div>

        {/* Quick Mood Reminder Indicator */}
        {currentMood && (
          <div className="mt-4 pt-4 border-t border-amber-200/80 flex items-center justify-between text-sm md:text-base text-amber-950 font-semibold">
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>
                {language === 'hi' ? 'आज की मनोदशा:' : "Today's Mood:"}{' '}
                {currentMood === 'happy'
                  ? '😊 ' + t.happy
                  : currentMood === 'okay'
                  ? '🙂 ' + t.okay
                  : currentMood === 'neutral'
                  ? '😐 ' + t.neutral
                  : currentMood === 'sad'
                  ? '😔 ' + t.sad
                  : '😟 ' + t.worried}
              </span>
            </span>

            <span className="text-xs uppercase tracking-wider bg-white/70 px-3 py-1 rounded-full text-amber-900">
              {language === 'hi' ? 'सक्रिय देखभाल' : 'Gentle Care'}
            </span>
          </div>
        )}
      </div>

      {/* Medication Schedule & Interactive Reminder Card */}
      <ElderlyMedicationCard />

      {/* AI Voice Companion Interactive Hero Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-7 border-2 border-amber-300 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-black/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider">
              <span>🌸</span>
              <span>{t.voiceCompanion}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              {language === 'hi'
                ? 'साथी से आवाज़ में बात करें'
                : 'Speak with Saathi, your Voice Companion'}
            </h2>

            <p className="text-amber-100 text-base sm:text-lg max-w-xl font-medium leading-snug">
              {language === 'hi'
                ? 'पुरानी यादें ताजा करें, अपनी पसंद का गाना चुनें, या पूछें कि आज आपके लिए कौन सी गतिविधि सबसे अच्छी है।'
                : 'Share your thoughts, reminisce about old days, or ask Saathi which pleasant activity to try today.'}
            </p>

            {/* Quick 1-tap prompts preview */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span
                onClick={() => {
                  unlockAudioContext();
                  setShowVoiceModal(true);
                }}
                className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                💬 {language === 'hi' ? 'आज क्या नया है?' : 'What should I do today?'}
              </span>
              <span
                onClick={() => {
                  unlockAudioContext();
                  setShowVoiceModal(true);
                }}
                className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                🎶 {language === 'hi' ? 'पुरानी यादें व संगीत' : 'Nostalgic memories & music'}
              </span>
              <span
                onClick={() => {
                  unlockAudioContext();
                  setShowVoiceModal(true);
                }}
                className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                🍃 {language === 'hi' ? 'गहरी सांस लें' : 'Gentle deep breathing'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              unlockAudioContext();
              setShowVoiceModal(true);
            }}
            className="px-6 py-4 rounded-2xl bg-white hover:bg-amber-50 text-amber-950 font-black text-lg sm:text-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0 self-start md:self-auto border-2 border-amber-200"
          >
            <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white">
              <Mic className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <span>{t.talkToSaathi}</span>
          </button>
        </div>
      </div>

      {/* AI Recommendation Highlight Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 rounded-3xl p-6 border-2 border-emerald-300 shadow-md">
        <div className="flex items-center gap-2 text-emerald-800 text-xs md:text-sm font-extrabold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{t.recommendedForToday}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {language === 'hi' ? recommendation.titleHi : recommendation.titleEn}
            </h2>
            <p className="text-slate-700 text-base md:text-lg">
              {language === 'hi' ? recommendation.reasonHi : recommendation.reasonEn}
            </p>
            <div className="text-xs font-semibold text-emerald-900 pt-1">
              ⏱ {recommendation.estimatedMinutes} {t.minutes} · {t.easy}
            </div>
          </div>

          <button
            onClick={() => startActivity(recommendation.gameId)}
            className="px-6 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-lg md:text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
          >
            <span>{t.startRecommended}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Today's Activities Section Title */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.todaysActivities}
        </h2>
        <span className="text-sm font-bold text-slate-500">
          6 {language === 'hi' ? 'गतिविधियां उपलब्ध' : 'Activities Ready'}
        </span>
      </div>

      {/* Large Activity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {GAMES_CATALOG.map((game) => (
          <div
            key={game.id}
            className={`rounded-3xl p-5 md:p-6 border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${game.bgColor}`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-white/90 border border-slate-200/80 flex items-center justify-center text-4xl shadow-xs">
                  {game.icon}
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-white/90 text-slate-700 shadow-2xs">
                    {game.difficulty === 'easy' ? t.easy : t.medium}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    ⏱ {game.estimatedMinutes} {t.minutes}
                  </span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {language === 'hi' ? game.titleHi : game.titleEn}
              </h3>
              <p className="text-slate-700 text-base md:text-lg mb-4 font-normal">
                {language === 'hi' ? game.descriptionHi : game.descriptionEn}
              </p>
            </div>

            <button
              onClick={() => startActivity(game.id)}
              className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-lg shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.startActivity}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Need Help? / Contact Caregiver Banner */}
      <div className="bg-rose-50/80 rounded-3xl p-5 md:p-6 border-2 border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div>
          <h3 className="text-xl font-bold text-rose-950 flex items-center gap-2">
            <span>{t.needHelp}</span>
          </h3>
          <p className="text-slate-600 text-base mt-0.5">
            {language === 'hi'
              ? 'अनीता शर्मा (देखभालकर्ता) से बात करने के लिए यहां दबाएं।'
              : 'Anita Sharma (Caregiver) is available to assist you anytime.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCallModal(true)}
            className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-base shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <PhoneCall className="w-5 h-5" />
            <span>{t.contactCaregiver}</span>
          </button>

          <button
            onClick={() => setShowMedicalModal(true)}
            className="px-5 py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-950 font-extrabold text-base border-2 border-rose-300 shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Building2 className="w-5 h-5 text-rose-600" />
            <span>{language === 'hi' ? '🏥 नजदीकी अस्पताल व डॉक्टर' : '🏥 Nearest Hospitals & Neuro'}</span>
          </button>
        </div>
      </div>

      {/* Non-Diagnostic Disclaimer Note */}
      <div className="text-center pt-4 pb-8">
        <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{t.disclaimerText}</span>
        </p>
      </div>
    </div>
  );
};
