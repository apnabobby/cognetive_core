export type Language = 'en' | 'hi';

export type UserRole = 'elderly' | 'caregiver';

export type TextSize = 'normal' | 'large' | 'xlarge';

export type MoodType = 'happy' | 'okay' | 'neutral' | 'sad' | 'worried';

export type GameDifficulty = 'easy' | 'medium';

export type GameId =
  | 'memory-match'
  | 'picture-recall'
  | 'number-match'
  | 'color-pattern'
  | 'music-memory'
  | 'simple-quiz';

export interface GameInfo {
  id: GameId;
  titleEn: string;
  titleHi: string;
  categoryEn: string;
  categoryHi: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  estimatedMinutes: number;
  difficulty: GameDifficulty;
  descriptionEn: string;
  descriptionHi: string;
  instructionsEn: string;
  instructionsHi: string;
}

export interface ActivityRecord {
  id: string;
  gameId: GameId;
  gameTitle: string;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;
  timestamp: string; // ISO date string or formatted time
  mood?: MoodType;
  difficulty: GameDifficulty;
  dateKey: string; // YYYY-MM-DD
}

export type ReminderType = 'medication' | 'cognitive' | 'hydration' | 'walk' | 'music';

export interface Reminder {
  id: string;
  titleEn: string;
  titleHi: string;
  time: string;
  completed: boolean;
  type: ReminderType;
  medicineName?: string;
  dosage?: string;
  timing?: string;
  instructionsEn?: string;
  instructionsHi?: string;
  status?: 'pending' | 'taken' | 'snoozed';
  takenAt?: string;
  snoozedUntil?: string;
  snoozeCount?: number;
  importance?: 'critical' | 'routine';
}

export interface CaregiverObservation {
  id: string;
  date: string;
  note: string;
  tags: string[];
}

export interface AIRecommendation {
  gameId: GameId;
  difficulty: GameDifficulty;
  estimatedMinutes: number;
  titleEn: string;
  titleHi: string;
  reasonEn: string;
  reasonHi: string;
  trigger: 'low_recent_memory' | 'high_accuracy_upgrade' | 'morning_routine' | 'calm_music_needed';
}

export interface UserProfile {
  name: string;
  age: number;
  relation: string;
  caregiverName: string;
  caregiverPhone: string;
  emergencyContact: string;
  primaryCondition: string;
  favoriteMusic: string;
  dailyGoalMinutes: number;
}

export interface VoiceSuggestedAction {
  type:
    | 'start_game'
    | 'call_caregiver'
    | 'deep_breath'
    | 'play_music'
    | 'show_medical'
    | 'mark_medicine'
    | 'show_caregiver'
    | 'switch_language'
    | 'log_mood'
    | 'open_pharmacy';
  gameId?: GameId;
  targetLang?: Language;
  targetMood?: MoodType;
  labelEn: string;
  labelHi: string;
  autoExecute?: boolean;
}

export * from './medical';
export * from './pharmacy';

export interface VoiceMessage {
  id: string;
  role: 'user' | 'saathi';
  text: string;
  timestamp: string;
  sentiment?: 'warm' | 'calm' | 'reflective' | 'cheerful' | 'encouraging';
  suggestedAction?: VoiceSuggestedAction;
  quickFollowUps?: string[];
  audioBase64?: string;
}

export interface VoiceInteractionLog {
  id: string;
  timestamp: string;
  userQuery: string;
  saathiResponse: string;
  detectedMood?: string;
  topic?: string;
}
