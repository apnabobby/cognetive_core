import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playGentleRetry } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  questionEn: string;
  questionHi: string;
  icon: string;
  options: {
    textEn: string;
    textHi: string;
    icon: string;
    isCorrect: boolean;
  }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    questionEn: 'Which fruit is bright yellow and known as the king of fruits in India?',
    questionHi: 'भारत में पीले रंग का कौन सा मीठा फल "फलों का राजा" कहलाता है?',
    icon: '👑',
    options: [
      { textEn: 'Ripe Mango', textHi: 'पका हुआ आम', icon: '🥭', isCorrect: true },
      { textEn: 'Apple', textHi: 'सेब', icon: '🍎', isCorrect: false },
      { textEn: 'Watermelon', textHi: 'तरबूज', icon: '🍉', isCorrect: false },
    ],
  },
  {
    questionEn: 'Which magnificent bird spreads its colorful feathers to dance when clouds arrive?',
    questionHi: 'बादल घिरने पर अपने सुंदर पंख फैलाकर कौन सा राष्ट्रीय पक्षी नाचता है?',
    icon: '🌧️',
    options: [
      { textEn: 'Peacock', textHi: 'मोर', icon: '🦚', isCorrect: true },
      { textEn: 'Sparrow', textHi: 'चिड़िया', icon: '🐦', isCorrect: false },
      { textEn: 'Parrot', textHi: 'तोता', icon: '🦜', isCorrect: false },
    ],
  },
  {
    questionEn: 'Which day of the week comes right after Monday?',
    questionHi: 'सोमवार के ठीक बाद सप्ताह का कौन सा दिन आता है?',
    icon: '📅',
    options: [
      { textEn: 'Tuesday', textHi: 'मंगलवार', icon: '☀️', isCorrect: true },
      { textEn: 'Sunday', textHi: 'रविवार', icon: '🌅', isCorrect: false },
      { textEn: 'Friday', textHi: 'शुक्रवार', icon: '🌙', isCorrect: false },
    ],
  },
];

export const SimpleQuiz: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (idx: number, isCorrect: boolean) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedIdx(idx);

    if (isCorrect) {
      playSuccessChime(soundEnabled);
      setScore((prev) => prev + 1);
      const praise =
        language === 'hi'
          ? 'बहुत सुंदर! बिल्कुल सही उत्तर! 🌟'
          : 'Wonderful! Perfectly correct answer! 🌟';
      setFeedback(praise);

      setTimeout(() => {
        if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
          setCurrentIdx((prev) => prev + 1);
          setSelectedIdx(null);
          setFeedback('');
          setIsProcessing(false);
        } else {
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          const duration = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => {
            finishActivity(QUIZ_QUESTIONS.length, QUIZ_QUESTIONS.length, duration, 'easy');
          }, 1200);
        }
      }, 1200);
    } else {
      playGentleRetry(soundEnabled);
      setFeedback(
        language === 'hi'
          ? 'कोई बात नहीं, आइए दूसरा विकल्प सोचकर देखते हैं! 🌸'
          : 'No worries, let us try another option! 🌸'
      );
      setTimeout(() => {
        setSelectedIdx(null);
        setIsProcessing(false);
      }, 1100);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const qText = language === 'hi' ? currentQ.questionHi : currentQ.questionEn;
      speak(`${language === 'hi' ? 'सरल प्रश्नोत्तरी।' : 'Simple Quiz.'} ${qText}`);
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
              ? 'bg-teal-500 text-white animate-pulse'
              : 'bg-teal-100 hover:bg-teal-200 text-teal-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-teal-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-teal-200 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 font-bold px-4 py-1.5 rounded-full text-sm mb-3">
          <span>
            {language === 'hi'
              ? `प्रश्न ${currentIdx + 1} / ${QUIZ_QUESTIONS.length}`
              : `Question ${currentIdx + 1} of ${QUIZ_QUESTIONS.length}`}
          </span>
        </div>

        <div className="my-2 text-5xl">{currentQ.icon}</div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-4">
          {language === 'hi' ? currentQ.questionHi : currentQ.questionEn}
        </h1>

        <p className="text-slate-500 text-base">
          {language === 'hi'
            ? 'नीचे दिए गए विकल्पों में से सबसे सही उत्तर पर उंगली रखें:'
            : 'Select the best answer from the options below:'}
        </p>

        {feedback && (
          <div className="mt-4 p-3.5 bg-teal-50 border border-teal-300 rounded-2xl inline-flex items-center gap-2 text-teal-900 font-bold text-base md:text-lg animate-fade-in">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Choices Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {currentQ.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx, opt.isCorrect)}
              disabled={isProcessing}
              className={`min-h-[110px] md:min-h-[140px] p-5 rounded-3xl font-bold flex flex-col items-center justify-center transition-all transform active:scale-95 border-3 shadow-md select-none ${
                isSelected
                  ? opt.isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-white hover:bg-teal-50 text-slate-900 border-slate-200 hover:border-teal-400'
              }`}
            >
              <span className="text-5xl mb-2">{opt.icon}</span>
              <span className="text-lg md:text-xl font-bold">
                {language === 'hi' ? opt.textHi : opt.textEn}
              </span>

              {isSelected && opt.isCorrect && (
                <span className="inline-flex items-center gap-1 text-xs text-white mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'hi' ? 'सही उत्तर!' : 'Correct!'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-6 flex items-center justify-between text-slate-500 text-sm px-2">
        <span>
          {t.score}: <span className="font-bold text-slate-800 tabular-nums">{score}</span>
        </span>
        <span>
          {t.progress}:{' '}
          <span className="font-bold text-slate-800 tabular-nums">
            {currentIdx + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </span>
      </div>
    </div>
  );
};
