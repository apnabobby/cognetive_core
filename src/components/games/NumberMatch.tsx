import React, { useState } from 'react';
import { Volume2, VolumeX, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playGentleRetry } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface RoundData {
  roundNumber: number;
  targetNumber: number;
  targetHindiText: string;
  targetEnglishText: string;
  gridNumbers: number[];
}

const ROUNDS: RoundData[] = [
  {
    roundNumber: 1,
    targetNumber: 7,
    targetHindiText: 'संख्या 7 (सात) ढूंढें',
    targetEnglishText: 'Find the number 7 (Seven)',
    gridNumbers: [2, 7, 4, 9, 3, 1],
  },
  {
    roundNumber: 2,
    targetNumber: 5,
    targetHindiText: 'संख्या 5 (पाँच) ढूंढें',
    targetEnglishText: 'Find the number 5 (Five)',
    gridNumbers: [8, 3, 5, 2, 6, 9],
  },
  {
    roundNumber: 3,
    targetNumber: 12,
    targetHindiText: 'संख्या 12 (बारह) ढूंढें',
    targetEnglishText: 'Find the number 12 (Twelve)',
    gridNumbers: [14, 7, 12, 18, 9, 21],
  },
];

export const NumberMatch: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [attempts, setAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const currentRound = ROUNDS[currentRoundIdx];

  const handleSelect = (num: number) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setSelectedNum(num);
    setAttempts((prev) => prev + 1);

    if (num === currentRound.targetNumber) {
      playSuccessChime(soundEnabled);
      setCorrectCount((prev) => prev + 1);

      const praise =
        language === 'hi'
          ? `बिल्कुल सही! आपने ${currentRound.targetNumber} को ढूंढ लिया! 🌟`
          : `Spot on! You found number ${currentRound.targetNumber}! 🌟`;
      setFeedback(praise);

      setTimeout(() => {
        if (currentRoundIdx + 1 < ROUNDS.length) {
          setCurrentRoundIdx((prev) => prev + 1);
          setSelectedNum(null);
          setFeedback('');
          setIsProcessing(false);
        } else {
          // All rounds finished
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          const duration = Math.round((Date.now() - startTime) / 1000);
          setTimeout(() => {
            finishActivity(ROUNDS.length, ROUNDS.length, duration, 'easy');
          }, 1200);
        }
      }, 1200);
    } else {
      playGentleRetry(soundEnabled);
      setFeedback(
        language === 'hi'
          ? `यह ${num} है। आइए फिर से ${currentRound.targetNumber} ढूंढते हैं!`
          : `That is ${num}. Let's look for ${currentRound.targetNumber} again!`
      );
      setTimeout(() => {
        setSelectedNum(null);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? `संख्या मिलान। दिए गए बड़े बटनों में से ${currentRound.targetHindiText}। आराम से सही बटन को छुएं।`
          : `Number Match. ${currentRound.targetEnglishText}. Tap the large button showing that number.`;
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
              ? 'bg-sky-500 text-white animate-pulse'
              : 'bg-sky-100 hover:bg-sky-200 text-sky-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-sky-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      {/* Header with target number highlighted */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-sky-200 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-800 font-bold px-4 py-1.5 rounded-full text-sm mb-3">
          <span>
            {language === 'hi'
              ? `चरण ${currentRoundIdx + 1} / ${ROUNDS.length}`
              : `Round ${currentRoundIdx + 1} of ${ROUNDS.length}`}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-700 mb-2">
          {language === 'hi' ? 'नीचे दिए गए बटनों में से' : 'From the buttons below:'}
        </h1>

        <div className="my-3 inline-block bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-8 py-4 rounded-3xl shadow-md">
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {language === 'hi' ? currentRound.targetHindiText : currentRound.targetEnglishText}
          </span>
        </div>

        <p className="text-slate-500 text-sm md:text-base mt-2">
          {language === 'hi' ? 'सही अंक वाले बटन पर धीरे से उंगली रखें' : 'Gently tap the matching number button below'}
        </p>

        {feedback && (
          <div className="mt-4 p-3 bg-sky-50 border border-sky-300 rounded-2xl animate-fade-in inline-flex items-center gap-2 text-sky-900 font-bold text-base md:text-lg">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Large Tactile Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
        {currentRound.gridNumbers.map((num) => {
          const isTarget = num === currentRound.targetNumber;
          const isThisSelected = selectedNum === num;

          return (
            <button
              key={num}
              onClick={() => handleSelect(num)}
              disabled={isProcessing}
              className={`min-h-[110px] md:min-h-[140px] rounded-3xl font-extrabold text-4xl md:text-6xl flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-md border-4 select-none ${
                isThisSelected
                  ? isTarget
                    ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-200 hover:border-sky-400'
              }`}
              aria-label={`Number ${num}`}
            >
              <span className="tabular-nums">{num}</span>
              {isThisSelected && isTarget && (
                <span className="text-xs md:text-sm font-bold flex items-center gap-1 mt-1 text-white">
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'hi' ? 'सही!' : 'Correct!'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-6 flex items-center justify-between text-slate-500 text-sm px-2">
        <span>
          {t.score}: <span className="font-bold text-slate-800 tabular-nums">{correctCount}</span>
        </span>
        <span>
          {t.attempts}: <span className="font-bold text-slate-800 tabular-nums">{attempts}</span>
        </span>
      </div>
    </div>
  );
};
