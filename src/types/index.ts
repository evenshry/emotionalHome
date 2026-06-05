export interface Mood {
  name: string;
  emoji: string;
  color: string;
  nextStep: string;
}

export interface Quote {
  text: string;
  author: string;
}

export interface MoodEntry {
  mood: string;
  intensity: number;
  description: string;
  timestamp: number;
}

export interface GratitudeEntry {
  items: string[];
  date: string;
}

export interface MoodHistoryEntry {
  initialMood: string;
  finalMood?: string;
  date: string;
  activities?: string[];
}

export interface Stats {
  totalSessions: number;
  streakDays: number;
  lastSession: string | null;
}

export interface StorageKeys {
  MOOD_HISTORY: string;
  GRATITUDE_JOURNAL: string;
  STATS: string;
}
