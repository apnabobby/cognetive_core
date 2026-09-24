import React from 'react';
import { Sparkles, Trophy, Clock, ArrowRight, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { GAMES_CATALOG } from '../../utils/demoData';

interface GameResultModalProps {
  onProceedToMood: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({ onProceedToMood }) => {
  const { language, lastResult, returnHome } = useApp();
  const t = getTranslation(language);

  if (!lastResult) return null;

  const gameInfo = GAMES_CATALOG.find((g) => g.id === lastResult.gameId);
  const minutes = Math.floor(lastResult.duration / 60);
  const seconds = lastResult.duration % 60;
  const timeFormatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Celebration Trophy Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 text-amber-600 mb-4 shadow-inner">
          <Trophy className="w-12 h-12 text-amber-600" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t.wellDone}
        </h1>

        <p className="text-slate-600 text-lg md:text-xl font-medium mb-6">
          {language === 'hi'
            ? `आपने "${gameInfo?.titleHi || 'गतिविधि'}" सफलता से पूरी कर ली है।`
            : `You successfully completed "${gameInfo?.titleEn || 'Activity'}"!`}
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1">
              {t.score}
            </span>
            <span className="text-3xl font-extrabold text-emerald-700 tabular-nums">
              {lastResult.score} / {lastResult.maxScore}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {t.timeSpent}
            </span>
            <span className="text-3xl font-extrabold text-slate-800 tabular-nums">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Encouraging message */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-amber-900 font-bold text-base md:text-lg flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>
              {language === 'hi'
                ? 'नियमित मानसिक व्यायाम से मस्तिष्क चुस्त और तरोताजा रहता है।'
                : 'Regular gentle cognitive practice keeps the mind active and bright.'}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onProceedToMood}
            className="w-full py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg md:text-xl shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
          >
            <Heart className="w-6 h-6 text-amber-200" />
            <span>
              {language === 'hi' ? 'मनोदशा चेक-इन (कैसा लग रहा है?) ➔' : 'Mood Check-In (How do you feel?) ➔'}
            </span>
          </button>

          <button
            onClick={returnHome}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-colors"
          >
            {t.home}
          </button>
        </div>
      </div>
    </div>
  );
};
