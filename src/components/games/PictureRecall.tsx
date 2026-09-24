import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowLeft, Check, Sparkles, Eye, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playGentleRetry } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface PictureItem {
  id: string;
  icon: string;
  nameEn: string;
  nameHi: string;
  wasPresent: boolean;
}

const SCENE_ITEMS: PictureItem[] = [
  { id: '1', icon: '☕', nameEn: 'Tea Cup', nameHi: 'चाय का कप', wasPresent: true },
  { id: '2', icon: '⏰', nameEn: 'Clock', nameHi: 'घड़ी', wasPresent: true },
  { id: '3', icon: '👓', nameEn: 'Spectacles', nameHi: 'चश्मा', wasPresent: true },
  { id: '4', icon: '🦚', nameEn: 'Peacock Feather', nameHi: 'मोर पंख', wasPresent: true },
  { id: '5', icon: '📻', nameEn: 'Radio', nameHi: 'रेडियो', wasPresent: true },
  { id: '6', icon: '🍎', nameEn: 'Red Apple', nameHi: 'लाल सेब', wasPresent: false },
  { id: '7', icon: '🚗', nameEn: 'Blue Car', nameHi: 'नीली कार', wasPresent: false },
  { id: '8', icon: '🐶', nameEn: 'Puppy', nameHi: 'कुत्ता', wasPresent: false },
];

export const PictureRecall: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [phase, setPhase] = useState<'observe' | 'recall' | 'completed'>('observe');
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string>('');
  const [startTime] = useState<number>(Date.now());

  // 10-second countdown in observe phase
  useEffect(() => {
    if (phase !== 'observe') return;

    if (secondsLeft <= 0) {
      setPhase('recall');
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, secondsLeft]);

  const handleReadyEarly = () => {
    playClickSound(soundEnabled);
    setPhase('recall');
  };

  const handleToggleItem = (id: string) => {
    playClickSound(soundEnabled);
    if (selectedItems.includes(id)) {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedItems((prev) => [...prev, id]);
    }
  };

  const handleCheckAnswers = () => {
    playClickSound(soundEnabled);
    const presentItems = SCENE_ITEMS.filter((i) => i.wasPresent).map((i) => i.id);
    const correctChoices = selectedItems.filter((id) => presentItems.includes(id));
    const incorrectChoices = selectedItems.filter((id) => !presentItems.includes(id));

    const finalScore = Math.max(0, correctChoices.length - incorrectChoices.length);

    if (correctChoices.length >= 3) {
      playSuccessChime(soundEnabled);
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setFeedback(
        language === 'hi'
          ? `शानदार स्मरणशक्ति! आपने ${correctChoices.length} सही चीजें याद रखीं! 🌟`
          : `Wonderful recall! You remembered ${correctChoices.length} items correctly! 🌟`
      );
    } else {
      playGentleRetry(soundEnabled);
      setFeedback(
        language === 'hi'
          ? 'अच्छा प्रयास! हर अभ्यास से याददाश्त तेज होती है। 🌸'
          : 'Good effort! Daily practice gently strengthens recall. 🌸'
      );
    }

    setPhase('completed');
    const duration = Math.round((Date.now() - startTime) / 1000);
    setTimeout(() => {
      finishActivity(Math.max(1, finalScore), presentItems.length, duration, 'easy');
    }, 1600);
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        phase === 'observe'
          ? language === 'hi'
            ? 'चित्र स्मरण। इस तस्वीर को 10 सेकंड तक ध्यान से देखें। समय पूरा होने पर हम पूछेंगे कि आपने क्या देखा था।'
            : 'Picture Recall. Look at this warm scene for 10 seconds. When time is up, we will ask what you saw.'
          : language === 'hi'
          ? 'आपने तस्वीर में कौन-सी चीजें देखी थीं? नीचे दी गई सूची में से सही चीजों पर टिक करें और उत्तर जांचें।'
          : 'What objects did you see in the picture? Tap the items you remember and check your answer.';
      speak(text);
    }
  };

  const presentItemsOnly = SCENE_ITEMS.filter((i) => i.wasPresent);

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={returnHome}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.home}</span>
        </button>

        <button
          onClick={handleReadAloud}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-colors ${
            isSpeaking
              ? 'bg-emerald-500 text-white animate-pulse'
              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🖼️</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {language === 'hi' ? 'चित्र स्मरण' : 'Picture Recall'}
            </h1>
            <p className="text-slate-600 mt-1 text-base md:text-lg">
              {phase === 'observe'
                ? language === 'hi'
                  ? 'तस्वीर को ध्यान से देखें। चीजों को मन में दोहराएं।'
                  : 'Look closely at the items in this cozy morning room.'
                : language === 'hi'
                ? 'आपने तस्वीर में कौन-कौन सी चीजें देखी थीं? उन्हें चुनें:'
                : 'Which objects did you see in the picture? Tap your choices:'}
            </p>
          </div>
        </div>

        {/* Phase Indicator & 10s Timer */}
        {phase === 'observe' && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                {language === 'hi' ? 'देखने का समय:' : 'Viewing Time:'}
              </span>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {secondsLeft} {t.minutes === 'min' ? 'seconds' : 'सेकंड'}
              </span>
            </div>
            {/* Visual progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(secondsLeft / 10) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Observing the scene */}
      {phase === 'observe' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 rounded-3xl p-6 md:p-8 border-2 border-amber-200 text-center shadow-md">
            <div className="inline-block bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-amber-900 mb-4 uppercase tracking-wider">
              {language === 'hi' ? 'सुबह की बैठक का दृश्य' : "Morning Living Room Scene"}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 my-2">
              {presentItemsOnly.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/95 rounded-2xl p-4 border border-amber-200/80 shadow-sm flex flex-col items-center justify-center transform transition hover:scale-105"
                >
                  <span className="text-5xl md:text-6xl mb-2">{item.icon}</span>
                  <span className="text-base font-bold text-slate-800">
                    {language === 'hi' ? item.nameHi : item.nameEn}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-sm md:text-base text-amber-900/80 mt-4 font-medium">
              {language === 'hi'
                ? '5 वस्तुएं: चाय, घड़ी, चश्मा, मोर पंख, और रेडियो'
                : '5 items: Tea, Clock, Spectacles, Peacock Feather, and Radio'}
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleReadyEarly}
              className="px-8 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {language === 'hi' ? 'मुझे याद हो गया, आगे बढ़ें ➔' : "I'm Ready Now ➔"}
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Recall & Questions */}
      {phase !== 'observe' && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
            <span className="text-sm font-semibold text-slate-600 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              {language === 'hi'
                ? 'तस्वीर अब छुप गई है। आपने क्या-क्या देखा था? (कई विकल्प चुन सकते हैं)'
                : 'The picture is now hidden. Which items were present? (Select all that apply)'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {SCENE_ITEMS.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const showResultStatus = phase === 'completed';

              return (
                <button
                  key={item.id}
                  onClick={() => phase === 'recall' && handleToggleItem(item.id)}
                  disabled={phase === 'completed'}
                  className={`min-h-[110px] md:min-h-[130px] p-3 rounded-2xl font-bold flex flex-col items-center justify-center transition-all border-2 text-center select-none ${
                    showResultStatus
                      ? item.wasPresent && isSelected
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-300'
                        : isSelected && !item.wasPresent
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'bg-white border-slate-200 text-slate-400'
                      : isSelected
                      ? 'bg-emerald-50 border-emerald-500 text-slate-900 ring-2 ring-emerald-200 shadow-md'
                      : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-4xl md:text-5xl mb-1">{item.icon}</span>
                  <span className="text-sm md:text-base font-bold">
                    {language === 'hi' ? item.nameHi : item.nameEn}
                  </span>

                  <div className="mt-2">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-semibold">
                        <Check className="w-3 h-3" />
                        {language === 'hi' ? 'चुना' : 'Selected'}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        {language === 'hi' ? 'चुनने के लिए छुएं' : 'Tap to select'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {feedback && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 text-center animate-fade-in">
              <p className="text-lg font-bold text-emerald-900 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                {feedback}
              </p>
            </div>
          )}

          {phase === 'recall' && (
            <div className="text-center pt-2">
              <button
                onClick={handleCheckAnswers}
                disabled={selectedItems.length === 0}
                className={`px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                  selectedItems.length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {language === 'hi' ? 'उत्तर की जांच करें ✔️' : 'Check My Answers ✔️'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
