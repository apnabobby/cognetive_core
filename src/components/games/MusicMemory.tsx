import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, ArrowLeft, Play, Pause, Sparkles, Heart, Music, Check, Smile } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../utils/translations';
import { playClickSound, playSuccessChime, playMusicSample, stopMusicSample } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface MusicCategory {
  id: 'old_hindi' | 'devotional' | 'folk' | 'classic_bollywood';
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  icon: string;
  songExampleEn: string;
  songExampleHi: string;
  color: string;
}

const CATEGORIES: MusicCategory[] = [
  {
    id: 'old_hindi',
    nameEn: 'Old Hindi Songs',
    nameHi: 'पुराने सदाबहार गीत',
    descriptionEn: 'Golden era melodies of Kishore Kumar, Lata Mangeshkar & Rafi Sahab',
    descriptionHi: 'किशोर कुमार, लता मंगेशकर और रफ़ी साहब के सुनहरे तराने',
    icon: '📻',
    songExampleEn: 'Classic Golden Era Melody (Kahiin Door motif)',
    songExampleHi: 'सदाबहार पुरानी धुन (कहीं दूर जब दिन ढल जाए)',
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'devotional',
    nameEn: 'Devotional Songs',
    nameHi: 'भक्ति व भजन संगीत',
    descriptionEn: 'Calm morning bhajans and spiritual ragas',
    descriptionHi: 'सुबह के शांत भजन और प्रभु की आराधना',
    icon: '🪔',
    songExampleEn: 'Raga Bhupali Morning Bhajan',
    songExampleHi: 'राग भूपाली शांत प्रभात भजन',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'folk',
    nameEn: 'Folk Songs',
    nameHi: 'पारंपरिक लोक संगीत',
    descriptionEn: 'Rooted rhythmic melodies and festive village tunes',
    descriptionHi: 'मिट्टी की सौंधी खुशबू और उत्सव की धुनें',
    icon: '🪕',
    songExampleEn: 'Festive Folk Rhythms',
    songExampleHi: 'माटी के लोकगीत व धुन',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'classic_bollywood',
    nameEn: 'Classic Bollywood',
    nameHi: 'क्लासिक बॉलीवुड',
    descriptionEn: 'Joyful nostalgic tunes that make the heart smile',
    descriptionHi: 'मन को आनंदित करने वाले लोकप्रिय फिल्मी गीत',
    icon: '🎬',
    songExampleEn: 'Upbeat Golden Hits',
    songExampleHi: 'उत्साहवर्धक सुनहरे गीत',
    color: 'from-rose-500 to-rose-600',
  },
];

export const MusicMemory: React.FC = () => {
  const { language, soundEnabled, speak, isSpeaking, stopVoice, finishActivity, returnHome } = useApp();
  const t = getTranslation(language);

  const [activeCategory, setActiveCategory] = useState<MusicCategory>(CATEGORIES[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [recognized, setRecognized] = useState<'yes' | 'no' | null>(null);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopMusicSample();
    };
  }, []);

  const handlePlayToggle = () => {
    if (isPlaying) {
      stopMusicSample();
      setIsPlaying(false);
    } else {
      stopMusicSample();
      setIsPlaying(true);
      playMusicSample(activeCategory.id, volume, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (isPlaying) {
      // Re-trigger with new volume
      playMusicSample(activeCategory.id, newVol, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleSelectCategory = (cat: MusicCategory) => {
    stopMusicSample();
    setIsPlaying(false);
    setActiveCategory(cat);
    setRecognized(null);
    setFeeling(null);
    setFeedback('');
  };

  const handleAnswerRecognition = (answer: 'yes' | 'no') => {
    playClickSound(soundEnabled);
    setRecognized(answer);

    if (answer === 'yes') {
      playSuccessChime(soundEnabled);
      setFeedback(
        language === 'hi'
          ? 'बहुत सुंदर! संगीत से जुड़ी यादें मन को गहरी शांति और खुशी देती हैं। 🌸'
          : 'Wonderful! Music activates deep nostalgic pathways in the brain and lifts the spirit! 🌸'
      );
    } else {
      setFeedback(
        language === 'hi'
          ? 'कोई बात नहीं! संगीत का आनंद लेना ही सबसे बड़ा व्यायाम है। ✨'
          : 'No worries at all! Gently relaxing to melodies is wonderful cognitive nourishment. ✨'
      );
    }
  };

  const handleFinishRound = () => {
    playClickSound(soundEnabled);
    const nextCount = roundsCompleted + 1;
    setRoundsCompleted(nextCount);

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }

    const duration = Math.round((Date.now() - startTime) / 1000);
    setTimeout(() => {
      finishActivity(3, 3, duration, 'easy');
    }, 1200);
  };

  const handleReadAloud = () => {
    if (isSpeaking) {
      stopVoice();
    } else {
      const text =
        language === 'hi'
          ? `संगीत स्मृति। ${activeCategory.nameHi} चुनें। प्ले बटन दबाकर धुन सुनें। फिर बताएं कि क्या आप यह धुन पहचानते हैं।`
          : `Music Memory. Selected category is ${activeCategory.nameEn}. Press the play button to hear a gentle sample, then tell us if you recognize it.`;
      speak(text);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => {
            stopMusicSample();
            returnHome();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.home}</span>
        </button>

        <button
          onClick={handleReadAloud}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm md:text-base transition-colors ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-rose-100 hover:bg-rose-200 text-rose-950'
          }`}
        >
          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-rose-700" />}
          <span>{isSpeaking ? t.stopReading : t.readAloud}</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-rose-200 shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎵</span>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {language === 'hi' ? 'संगीत स्मृति' : 'Music Memory'}
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              {language === 'hi'
                ? 'पुरानी और प्रिय धुनों को सुनें और यादों को ताज़ा करें।'
                : 'Listen to familiar nostalgic tunes and gently recall memories.'}
            </p>
          </div>
        </div>

        {/* Category Selection Tabs */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
            {language === 'hi' ? 'संगीत की श्रेणी चुनें:' : 'Choose Music Category:'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'bg-rose-50 border-rose-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:border-rose-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-bold text-slate-900">
                    {language === 'hi' ? cat.nameHi : cat.nameEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Music Player Box */}
        <div className="bg-gradient-to-br from-rose-50 via-amber-50/40 to-pink-50 rounded-3xl p-6 border-2 border-rose-200 text-center">
          <div className="inline-flex items-center gap-2 bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-rose-900 mb-4 shadow-xs">
            <Music className="w-3.5 h-3.5 text-rose-600" />
            <span>
              {language === 'hi' ? activeCategory.songExampleHi : activeCategory.songExampleEn}
            </span>
          </div>

          {/* Big Play/Pause Button */}
          <div className="my-3 flex items-center justify-center">
            <button
              onClick={handlePlayToggle}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl transition-transform active:scale-95 ${
                isPlaying
                  ? 'bg-amber-600 ring-8 ring-amber-200 animate-pulse'
                  : 'bg-gradient-to-br from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700'
              }`}
              aria-label={isPlaying ? 'Pause Song' : 'Play Song'}
            >
              {isPlaying ? <Pause className="w-10 h-10 sm:w-12 sm:h-12" /> : <Play className="w-10 h-10 sm:w-12 sm:h-12 ml-1" />}
              <span className="text-xs uppercase tracking-wider font-extrabold mt-1">
                {isPlaying
                  ? language === 'hi' ? 'रूकें' : 'Pause'
                  : language === 'hi' ? 'सुनें' : 'Play'}
              </span>
            </button>
          </div>

          {/* Sound waves animation when playing */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1.5 my-3">
              {[40, 75, 55, 90, 60, 85, 45, 95, 65, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-rose-500 rounded-full animate-bounce"
                  style={{
                    height: `${h * 0.3}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Volume Control */}
          <div className="mt-4 max-w-xs mx-auto flex items-center gap-3 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-2xl border border-rose-200">
            <Volume2 className="w-5 h-5 text-rose-700 shrink-0" />
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
              aria-label="Volume slider"
            />
            <span className="text-xs font-bold text-rose-950 w-8 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Cognitive Engagement Question */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
            {language === 'hi' ? 'क्या आप यह धुन पहचानते हैं?' : 'Do you recognize this song?'}
          </h2>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleAnswerRecognition('yes')}
              className={`px-8 py-3.5 rounded-2xl font-bold text-lg md:text-xl border-3 transition-all flex items-center gap-2 ${
                recognized === 'yes'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-200'
                  : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-400'
              }`}
            >
              <Check className="w-6 h-6" />
              <span>{language === 'hi' ? 'हाँ (पहचानता हूँ)' : 'YES (I recognize)'}</span>
            </button>

            <button
              onClick={() => handleAnswerRecognition('no')}
              className={`px-8 py-3.5 rounded-2xl font-bold text-lg md:text-xl border-3 transition-all flex items-center gap-2 ${
                recognized === 'no'
                  ? 'bg-slate-700 text-white border-slate-800 shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
            >
              <span>{language === 'hi' ? 'नहीं' : 'NO'}</span>
            </button>
          </div>

          {/* Feedback & Emotion Prompt */}
          {feedback && (
            <div className="mt-5 p-4 bg-rose-50 border border-rose-200 rounded-2xl animate-fade-in">
              <p className="text-base md:text-lg font-bold text-rose-900 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-600" />
                {feedback}
              </p>

              <div className="mt-4 pt-3 border-t border-rose-200/60">
                <span className="text-sm font-semibold text-rose-800 block mb-2">
                  {language === 'hi'
                    ? 'यह धुन सुनकर कैसा महसूस हुआ?'
                    : 'How did this tune make you feel?'}
                </span>
                <div className="flex items-center justify-center gap-3">
                  {[
                    { label: language === 'hi' ? 'खुशी 😊' : 'Happy 😊', id: 'happy' },
                    { label: language === 'hi' ? 'शांति 🕊️' : 'Peaceful 🕊️', id: 'peace' },
                    { label: language === 'hi' ? 'पुरानी यादें ✨' : 'Nostalgic ✨', id: 'nostalgia' },
                  ].map((feel) => (
                    <button
                      key={feel.id}
                      onClick={() => setFeeling(feel.id)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-colors ${
                        feeling === feel.id
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-white text-rose-900 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {feel.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {recognized && (
            <div className="mt-6 text-center">
              <button
                onClick={handleFinishRound}
                className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {language === 'hi' ? 'गतिविधि पूरी करें ✔️' : 'Complete Activity ✔️'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
