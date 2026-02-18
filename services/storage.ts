import { JournalEntry, QuranProgress } from '../types';

const KEYS = {
  JOURNAL: 'noor_journal_entries',
  QURAN: 'noor_quran_progress'
};

export const storageService = {
  // Journal Methods
  getJournalEntries: (): JournalEntry[] => {
    try {
      const data = localStorage.getItem(KEYS.JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addJournalEntry: (entry: JournalEntry) => {
    const entries = storageService.getJournalEntries();
    const updated = [entry, ...entries];
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(updated));
    return updated;
  },

  deleteJournalEntry: (id: string) => {
    const entries = storageService.getJournalEntries();
    const updated = entries.filter(e => e.id !== id);
    localStorage.setItem(KEYS.JOURNAL, JSON.stringify(updated));
    return updated;
  },

  // Quran Methods
  getQuranProgress: (): QuranProgress => {
    try {
      const data = localStorage.getItem(KEYS.QURAN);
      if (!data) return storageService.getDefaultProgress();
      
      const progress = JSON.parse(data);
      // Ensure new fields exist for legacy data
      return {
        ...storageService.getDefaultProgress(),
        ...progress
      };
    } catch {
      return storageService.getDefaultProgress();
    }
  },

  getDefaultProgress: (): QuranProgress => ({
    currentPage: 0,
    totalPagesRead: 0,
    khatamGoal: 1,
    lastReadDate: new Date().toISOString(),
    streak: 0,
    lastSurah: 1,
    lastAyah: 1
  }),

  saveQuranProgress: (progress: QuranProgress) => {
    // Calculate Streak
    const lastDate = new Date(progress.lastReadDate);
    const today = new Date();
    
    // Normalize to midnight for accurate day comparison
    lastDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = progress.streak;

    if (diffDays === 1) {
      // Consecutive day
      newStreak += 1;
    } else if (diffDays > 1) {
      // Broken streak, but if it's the first update today, reset to 1
      newStreak = 1;
    } else if (diffDays === 0 && newStreak === 0) {
        // First time reading today ever
        newStreak = 1;
    }
    // If diffDays === 0 (same day), keep current streak

    const updatedProgress = {
      ...progress,
      streak: newStreak,
      lastReadDate: new Date().toISOString()
    };

    localStorage.setItem(KEYS.QURAN, JSON.stringify(updatedProgress));
    return updatedProgress;
  }
};
