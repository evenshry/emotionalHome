import { MoodEntry, GratitudeEntry, Stats } from '@/types';

export const STORAGE_KEYS = {
  MOOD_HISTORY: 'moodHistory',
  GRATITUDE_JOURNAL: 'gratitudeJournal',
  STATS: 'stats',
};

export function getMoodHistory(): MoodEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveMoodHistory(entry: Omit<MoodEntry, 'timestamp'>): void {
  const history = getMoodHistory();
  history.push({
    ...entry,
    timestamp: Date.now(),
  });
  localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(history));
}

export function getGratitudeJournal(): GratitudeEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.GRATITUDE_JOURNAL);
  return data ? JSON.parse(data) : [];
}

export function saveGratitudeJournal(entry: Omit<GratitudeEntry, 'date'>): void {
  const journal = getGratitudeJournal();
  journal.push({
    ...entry,
    date: new Date().toISOString().split('T')[0],
  });
  localStorage.setItem(STORAGE_KEYS.GRATITUDE_JOURNAL, JSON.stringify(journal));
}

export function getStats(): Stats {
  const data = localStorage.getItem(STORAGE_KEYS.STATS);
  return data ? JSON.parse(data) : {
    totalSessions: 0,
    streakDays: 0,
    lastSession: null,
  };
}

export function updateStats(): Stats {
  const stats = getStats();
  const today = new Date().toISOString().split('T')[0];

  if (stats.lastSession !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    stats.streakDays = stats.lastSession === yesterday ? stats.streakDays + 1 : 1;
    stats.lastSession = today;
    stats.totalSessions += 1;
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  return stats;
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function exportAllData(): void {
  const data = {
    moodHistory: getMoodHistory(),
    gratitudeJournal: getGratitudeJournal(),
    stats: getStats(),
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `情绪港湾数据_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
