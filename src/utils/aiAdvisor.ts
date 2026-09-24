import { ActivityRecord, AIRecommendation, MoodType } from '../types';

export function getAIActivityRecommendation(
  history: ActivityRecord[],
  currentMood?: MoodType | null
): AIRecommendation {
  // If user feels sad or worried, prioritize emotional calm and nostalgic connection
  if (currentMood === 'sad' || currentMood === 'worried') {
    return {
      gameId: 'music-memory',
      difficulty: 'easy',
      estimatedMinutes: 5,
      titleEn: 'Music Memory',
      titleHi: 'संगीत स्मृति',
      reasonEn: 'Sharma Ji noted feeling quiet/concerned today. Soothing melodies help reduce anxiety and elevate mood gently.',
      reasonHi: 'शर्मा जी आज थोड़े शांत/चिंतित महसूस कर रहे हैं। मधुर पुरानी धुनें मन को शांत और प्रफुल्लित करती हैं।',
      trigger: 'calm_music_needed',
    };
  }

  // Look at recent sessions
  if (history.length === 0) {
    return {
      gameId: 'memory-match',
      difficulty: 'easy',
      estimatedMinutes: 5,
      titleEn: 'Memory Match — Easy',
      titleHi: 'स्मृति मिलान — सरल',
      reasonEn: 'A welcoming initial exercise to gently stimulate visual association and working recall.',
      reasonHi: 'दृश्य जुड़ाव और कामकाजी स्मरणशक्ति को धीरे-धीरे सक्रिय करने के लिए एक आदर्श शुरुआत।',
      trigger: 'morning_routine',
    };
  }

  const recent = history.slice(0, 3);
  const memorySessions = recent.filter((r) => r.gameId === 'memory-match' || r.gameId === 'picture-recall');

  // Check if struggled (accuracy < 70% or took excessive attempts)
  const hadStruggle = memorySessions.some((s) => s.score / s.maxScore < 0.7);

  if (hadStruggle) {
    return {
      gameId: 'memory-match',
      difficulty: 'easy',
      estimatedMinutes: 4,
      titleEn: 'Memory Match — Gentle Focus',
      titleHi: 'स्मृति मिलान — सरल अभ्यास',
      reasonEn: 'Recent memory session had minor hesitation. Re-engaging with 4 familiar pairs builds confidence without fatigue.',
      reasonHi: 'हालिया सत्र में थोड़ा समय लगा था। 4 सरल जोड़ों के साथ पुनः प्रयास करने से बिना थकावट आत्मविश्वास बढ़ता है।',
      trigger: 'low_recent_memory',
    };
  }

  // Check if performed exceptionally well (100% accuracy on last 2 games)
  const isHighPerformer = recent.length >= 2 && recent.every((s) => s.score / s.maxScore >= 0.9);

  if (isHighPerformer) {
    // Recommend slightly richer task
    return {
      gameId: 'picture-recall',
      difficulty: 'medium',
      estimatedMinutes: 5,
      titleEn: 'Picture Recall — Detail Focus',
      titleHi: 'चित्र स्मरण — एकाग्रता',
      reasonEn: 'Sharma Ji demonstrated sharp accuracy across recent tasks. A visual recall exercise offers engaging stimulation.',
      reasonHi: 'शर्मा जी ने हाल के खेलों में शानदार सटीकता दिखाई है। चित्र स्मरण उनकी दृश्य एकाग्रता को और सुदृढ़ करेगा।',
      trigger: 'high_accuracy_upgrade',
    };
  }

  // Alternate between categories for balanced cognitive stimulation
  const lastGame = history[0];
  if (lastGame.gameId === 'memory-match') {
    return {
      gameId: 'color-pattern',
      difficulty: 'easy',
      estimatedMinutes: 4,
      titleEn: 'Color & Pattern — Easy',
      titleHi: 'रंग और पैटर्न — सरल',
      reasonEn: 'Balancing memory with logical sequence recognition maintains high cognitive engagement.',
      reasonHi: 'स्मृति के साथ पैटर्न पहचान का संतुलन मस्तिष्क को सक्रिय और तरोताजा रखता है।',
      trigger: 'morning_routine',
    };
  }

  return {
    gameId: 'memory-match',
    difficulty: 'easy',
    estimatedMinutes: 5,
    titleEn: 'Memory Match — Easy',
    titleHi: 'स्मृति मिलान — सरल',
    reasonEn: 'Based on recent activity, Manas Saathi recommends 5 minutes of familiar object association.',
    reasonHi: 'हालिया गतिविधि के आधार पर, मानस साथी 5 मिनट की जानी-पहचानी वस्तुओं के मिलान का सुझाव देता है।',
    trigger: 'morning_routine',
  };
}
