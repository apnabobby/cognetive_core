import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playGentleRetry } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface PatternRound {
  sequence: { emoji: string; nameEn: string; nameHi: string; colorClass: string }[];
  correctAnswer: { emoji: string; nameEn: string; nameHi: string; colorClass: string };
  options: { emoji: string; nameEn: string; nameHi: string; colorClass: string }[];
}

const PATTERN_ROUNDS: PatternRound[] = [
  {
    sequence: [
      { emoji: '🔴', nameEn: 'Red', nameHi: 'लाल', colorClass: 'bg-rose-500' },
      { emoji: '🔵', nameEn: 'Blue', nameHi: 'नीला', colorClass: 'bg-blue-500' },
      { emoji: '🔴', nameEn: 'Red', nameHi: 'लाल', colorClass: 'bg-rose-500' },
    ],
    correctAnswer: { emoji: '🔵', nameEn: 'Blue', nameHi: 'नीला', colorClass: 'bg-blue-500' },
    options: [
      { emoji: '🔴', nameEn: 'Red', nameHi: 'लाल', colorClass: 'bg-rose-500' },
      { emoji: '🔵', nameEn: 'Blue', nameHi: 'नीला', colorClass: 'bg-blue-500' },
      { emoji: '🟡', nameEn: 'Yellow', nameHi: 'पीला', colorClass: 'bg-amber-400' },
    ],
  },
  {
    sequence: [
      { emoji: '🟢', nameEn: 'Green', nameHi: 'हरा', colorClass: 'bg-emerald-500' },
      { emoji: '🟡', nameEn: 'Yellow', nameHi: 'पीला', colorClass: 'bg-amber-400' },
      { emoji: '🟢', nameEn: 'Green', nameHi: 'हरा', colorClass: 'bg-emerald-500' },
      { emoji: '🟡', nameEn: 'Yellow', nameHi: 'पीला', colorClass: 'bg-amber-400' },
    ],
    correctAnswer: { emoji: '🟢', nameEn: 'Green', nameHi: 'हरा', colorClass: 'bg-emerald-500' },
    options: [
      { emoji: '🟢', nameEn: 'Green', nameHi: 'हरा', colorClass: 'bg-emerald-500' },
      { emoji: '🟣', nameEn: 'Purple', nameHi: 'बैंगनी', colorClass: 'bg-purple-500' },
      { emoji: '🟡', nameEn: 'Yellow', nameHi: 'पीला', colorClass: 'bg-amber-400' },
    ],
  },
  {
    sequence: [
      { emoji: '🌸', nameEn: 'Flower', nameHi: 'फूल', colorClass: 'bg-pink-400' },
      { emoji: '🍃', nameEn: 'Leaf', nameHi: 'पत्ता', colorClass: 'bg-emerald-500' },
      { emoji: '🌸', nameEn: 'Flower', nameHi: 'फूल', colorClass: 'bg-pink-400' },
    ],
    correctAnswer: { emoji: '🍃', nameEn: 'Leaf', nameHi: 'पत्ता', colorClass: 'bg-emerald-500' },
    options: [
      { emoji: '🌸', nameEn: 'Flower', nameHi: 'फूल', colorClass: 'bg-pink-400' },
      { emoji: '🍃', nameEn: 'Leaf', nameHi: 'पत्ता', colorClass: 'bg-emerald-500' },
      { emoji: '🍎', nameEn: 'Apple', nameHi: 'सेब', colorClass: 'bg-rose-500' },
    ],
  },
];

export const ColorPattern: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const currentRound = PATTERN_ROUNDS[currentRoundIdx];

  const handleSelectOption = (option: { emoji: string; nameEn: string; nameHi: string }) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedAnswer(option.nameEn);

    if (option.nameEn === currentRound.correctAnswer.nameEn) {
      playSuccessChime(soundEnabled);
      setScore((prev) => prev + 1);
      const praise =
        language === 'hi'
          ? 'बिल्कुल सही! आपने पैटर्न पहचान लिया! 🌟'
          : 'Spot on! You recognized the pattern! 🌟';
      setFeedback(praise);

      setTimeout(() => {
        if (currentRoundIdx + 1 < PATTERN_ROUNDS.length) {
          setCurrentRoundIdx((prev) => prev + 1);
          setSelectedAnswer(null);
          setFeedback('');
          setIsProcessing(false);
        } else {
          // Finished
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          const duration = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => {
            finishActivity(PATTERN_ROUNDS.length, PATTERN_ROUNDS.length, duration, 'easy');
          }, 1200);
        }
      }, 1200);
    } else {
      playGentleRetry(soundEnabled);
      setFeedback(
        language === 'hi'
          ? 'पैटर्न को दोबारा देखें — कौन सा रंग बारी-बारी आ रहा है?'
          : 'Look at the pattern once more — which color comes in turn?'
      );
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsProcessing(false);
      }, 1100);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? 'रंग और पैटर्न। पंक्ति में रंगों के क्रम को देखें। प्रश्न चिह्न के स्थान पर कौन सा रंग आएगा, नीचे से चुनें।'
          : 'Color and pattern. Look at the sequence of colors. Choose what color comes next in place of the question mark.';
      speak(text);
    }
  };

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
              ? 'bg-violet-500 text-white animate-pulse'
              : 'bg-violet-100 hover:bg-violet-200 text-violet-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-violet-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      {/* Question Header Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-violet-200 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-800 font-bold px-4 py-1.5 rounded-full text-sm mb-3">
          <span>
            {language === 'hi'
              ? `पैटर्न ${currentRoundIdx + 1} / ${PATTERN_ROUNDS.length}`
              : `Pattern ${currentRoundIdx + 1} of ${PATTERN_ROUNDS.length}`}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          {language === 'hi' ? 'अगला रंग कौन सा होगा?' : 'What comes next in the pattern?'}
        </h1>
        <p className="text-slate-600 text-base md:text-lg mb-6">
          {language === 'hi'
            ? 'क्रम को देखें और प्रश्न चिह्न (?) की जगह आने वाला रंग चुनें:'
            : 'Observe the sequence and select the missing piece for the question mark (?):'}
        </p>

        {/* The Sequence Display */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-slate-50 border-2 border-slate-200 rounded-3xl">
          {currentRound.sequence.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm min-w-[70px] sm:min-w-[85px]"
            >
              <span className="text-4xl sm:text-5xl">{item.emoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                {language === 'hi' ? item.nameHi : item.nameEn}
              </span>
            </div>
          ))}

          {/* Missing slot with question mark */}
          <div className="flex flex-col items-center justify-center p-3 sm:p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-400 min-w-[70px] sm:min-w-[85px] animate-pulse">
            <span className="text-4xl sm:text-5xl font-extrabold text-amber-600">❓</span>
            <span className="text-xs sm:text-sm font-bold text-amber-800 mt-1">
              {language === 'hi' ? 'अगला?' : 'Next?'}
            </span>
          </div>
        </div>

        {feedback && (
          <div className="mt-5 p-3.5 bg-violet-50 border border-violet-300 rounded-2xl inline-flex items-center gap-2 text-violet-900 font-bold text-base md:text-lg">
            <Sparkles className="w-5 h-5 text-violet-600" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-3">
        <h2 className="text-center font-bold text-slate-700 text-base md:text-lg">
          {language === 'hi' ? 'सही विकल्प चुनें:' : 'Choose the correct answer:'}
        </h2>

        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {currentRound.options.map((opt) => {
            const isCorrect = opt.nameEn === currentRound.correctAnswer.nameEn;
            const isChosen = selectedAnswer === opt.nameEn;

            return (
              <button
                key={opt.nameEn}
                onClick={() => handleSelectOption(opt)}
                disabled={isProcessing}
                className={`min-h-[110px] md:min-h-[135px] p-4 rounded-3xl font-bold flex flex-col items-center justify-center transition-all transform active:scale-95 border-3 shadow-md select-none ${
                  isChosen
                    ? isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-200'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-white hover:bg-violet-50 text-slate-900 border-slate-200 hover:border-violet-400'
                }`}
              >
                <span className="text-5xl md:text-6xl mb-1">{opt.emoji}</span>
                <span className="text-base md:text-lg font-bold">
                  {language === 'hi' ? opt.nameHi : opt.nameEn}
                </span>

                {isChosen && isCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs text-white mt-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'hi' ? 'सही!' : 'Correct!'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-6 flex items-center justify-between text-slate-500 text-sm px-2">
        <span>
          {t.score}: <span className="font-bold text-slate-800 tabular-nums">{score}</span>
        </span>
        <span>
          {t.progress}:{' '}
          <span className="font-bold text-slate-800 tabular-nums">
            {currentRoundIdx + 1} / {PATTERN_ROUNDS.length}
          </span>
        </span>
      </div>
    </div>
  );
};
