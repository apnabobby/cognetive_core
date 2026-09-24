import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playGentleRetry } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface CardItem {
  id: number;
  pairId: number;
  icon: string;
  nameEn: string;
  nameHi: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_CARDS_DATA = [
  { pairId: 1, icon: '🍎', nameEn: 'Apple', nameHi: 'सेब' },
  { pairId: 2, icon: '🌸', nameEn: 'Flower', nameHi: 'फूल' },
  { pairId: 3, icon: '🐶', nameEn: 'Dog', nameHi: 'कुत्ता' },
  { pairId: 4, icon: '🚗', nameEn: 'Car', nameHi: 'गाड़ी' },
  { pairId: 5, icon: '🦚', nameEn: 'Peacock', nameHi: 'मोर' },
  { pairId: 6, icon: '☕', nameEn: 'Chai', nameHi: 'चाय' },
];

export const MemoryMatch: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [encouragement, setEncouragement] = useState<string>('');
  const [startTime] = useState<number>(Date.now());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const totalPairs = difficulty === 'easy' ? 4 : 6;

  // Initialize or reset cards
  const initGame = (diff = difficulty) => {
    const selectedPairs = ALL_CARDS_DATA.slice(0, diff === 'easy' ? 4 : 6);
    const duplicated: CardItem[] = [];

    selectedPairs.forEach((item, idx) => {
      duplicated.push({
        id: idx * 2,
        pairId: item.pairId,
        icon: item.icon,
        nameEn: item.nameEn,
        nameHi: item.nameHi,
        isFlipped: false,
        isMatched: false,
      });
      duplicated.push({
        id: idx * 2 + 1,
        pairId: item.pairId,
        icon: item.icon,
        nameEn: item.nameEn,
        nameHi: item.nameHi,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle
    const shuffled = duplicated.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setAttempts(0);
    setMatchedPairs(0);
    setEncouragement('');
    setIsProcessing(false);
  };

  useEffect(() => {
    initGame(difficulty);
  }, [difficulty]);

  const handleCardClick = (index: number) => {
    if (isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    playClickSound(soundEnabled);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setAttempts((prev) => prev + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        // Match found!
        playSuccessChime(soundEnabled);
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsProcessing(false);
          setMatchedPairs((prev) => {
            const nextCount = prev + 1;
            if (nextCount === totalPairs) {
              // Game Won!
              try {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              } catch {
                // ignore
              }
              const duration = Math.round((Date.now() - startTime) / 1000);
              setTimeout(() => {
                finishActivity(totalPairs, totalPairs, duration, difficulty);
              }, 1200);
            }
            return nextCount;
          });

          // Encouraging prompt
          const praises =
            language === 'hi'
              ? ['शानदार! 🌟', 'बहुत खूब! 🌸', 'सही मिलाया! 👏']
              : ['Great job! 🌟', 'Wonderful match! 🌸', 'Spot on! 👏'];
          setEncouragement(praises[Math.floor(Math.random() * praises.length)]);
        }, 500);
      } else {
        // No match
        playGentleRetry(soundEnabled);
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
          setIsProcessing(false);
          setEncouragement(
            language === 'hi' ? 'कोई बात नहीं, जारी रखें! ✨' : 'Keep going! Take your time ✨'
          );
        }, 1100);
      }
    }
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? 'स्मृति मिलान। किसी भी कार्ड को छूकर पलटें, फिर उसी के जैसा दूसरा कार्ड ढूंढें। आराम से खेलें।'
          : 'Memory Match. Tap any card to flip it over, then find its matching twin. Take all the time you need.';
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
          aria-label={t.home}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.home}</span>
        </button>

        <div className="flex items-center gap-2">
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

          <button
            onClick={() => initGame()}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Reset"
            aria-label="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header card with difficulty toggle */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧩</span>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {language === 'hi' ? 'स्मृति मिलान' : 'Memory Match'}
              </h1>
            </div>
            <p className="text-slate-600 mt-1 text-base md:text-lg">
              {language === 'hi'
                ? 'दो एक जैसे कार्ड ढूंढें। हर सही जोड़ पर तालियां!'
                : 'Tap cards to uncover matching pairs. No rush!'}
            </p>
          </div>

          {/* Difficulty selector tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => {
                setDifficulty('easy');
                initGame('easy');
              }}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                difficulty === 'easy'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.easy} (4 Pairs)
            </button>
            <button
              onClick={() => {
                setDifficulty('medium');
                initGame('medium');
              }}
              className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                difficulty === 'medium'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.medium} (6 Pairs)
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm md:text-base text-slate-700">
          <div className="flex items-center gap-4">
            <span className="font-semibold">
              {t.progress}:{' '}
              <span className="text-emerald-700 font-bold tabular-nums">
                {matchedPairs} / {totalPairs}
              </span>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              {t.attempts}: <span className="font-bold tabular-nums">{attempts}</span>
            </span>
          </div>

          {encouragement && (
            <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg animate-fade-in">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{encouragement}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-3 md:gap-4 ${
          difficulty === 'easy' ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4'
        }`}
      >
        {cards.map((card, idx) => {
          const showFace = card.isFlipped || card.isMatched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={card.isMatched || isProcessing}
              className={`min-h-[110px] md:min-h-[140px] p-3 rounded-2xl font-bold flex flex-col items-center justify-center transition-all transform active:scale-95 border-2 text-center select-none shadow-sm ${
                card.isMatched
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-90'
                  : showFace
                  ? 'bg-amber-50 border-amber-400 text-slate-900 shadow-md ring-2 ring-amber-200'
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-400 hover:border-amber-300'
              }`}
              aria-label={showFace ? (language === 'hi' ? card.nameHi : card.nameEn) : 'Hidden card'}
            >
              {showFace ? (
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-4xl md:text-5xl">{card.icon}</span>
                  <span className="text-sm md:text-base font-semibold text-slate-800 mt-1">
                    {language === 'hi' ? card.nameHi : card.nameEn}
                  </span>
                  {card.isMatched && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'hi' ? 'मिला!' : 'Matched'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl text-slate-300">❓</span>
                  <span className="text-xs text-slate-500 mt-1">
                    {language === 'hi' ? 'छुएं' : 'Tap'}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
