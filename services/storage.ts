
import { supabase } from '../lib/supabaseClient';
import { JournalEntry, QuranProgress, UserData } from '../types';

// Default Data State
const DEFAULT_DATA: UserData = {
  journal: [],
  quran: {
    currentPage: 0,
    totalPagesRead: 0,
    khatamGoal: 1, // Default 1
    lastReadDate: new Date().toISOString(),
    streak: 0,
    lastSurah: 1,
    lastAyah: 1
  },
  settings: {
    hijriAdjustment: 0,
    location: {
      latitude: 21.4225, // Mecca default
      longitude: 39.8262,
      method: 4, // Umm al-Qura
      name: 'مكة المكرمة'
    },
    notifications: {
      prayers: true,
      hadith: true
    }
  }
};

// Helper for Guest Mode (LocalStorage)
const getLocalData = (): UserData => {
  try {
    const item = localStorage.getItem('guest_user_data');
    if (!item) return DEFAULT_DATA;
    const parsed = JSON.parse(item);
    // Merge with default to ensure new fields exist
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return DEFAULT_DATA;
  }
};

const setLocalData = (data: UserData) => {
  localStorage.setItem('guest_user_data', JSON.stringify(data));
};

export const storageService = {
  // --- CORE DATA FETCHING ---
  getUserData: async (): Promise<UserData> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return getLocalData();
      }

      // Fetch from Profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.warn('Profile not found, using default');
        return DEFAULT_DATA;
      }

      return { ...DEFAULT_DATA, ...data.data };
    } catch (e) {
      console.error('Error fetching user data:', e);
      return getLocalData();
    }
  },

  // --- CORE DATA SAVING ---
  saveUserData: async (newData: UserData): Promise<UserData> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLocalData(newData);
        return newData;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          data: newData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      return newData;
    } catch (e) {
      console.error('Error saving user data:', e);
      return newData;
    }
  },

  // --- SPECIFIC ADAPTERS (To maintain API compatibility) ---

  getJournalEntries: async (): Promise<JournalEntry[]> => {
    const data = await storageService.getUserData();
    return data.journal || [];
  },

  addJournalEntry: async (entry: JournalEntry): Promise<JournalEntry[]> => {
    const data = await storageService.getUserData();
    const newEntry = { ...entry, id: `entry_${Date.now()}` };
    const updatedJournal = [newEntry, ...data.journal];
    
    await storageService.saveUserData({
      ...data,
      journal: updatedJournal
    });

    return updatedJournal;
  },

  deleteJournalEntry: async (id: string): Promise<JournalEntry[]> => {
    const data = await storageService.getUserData();
    const updatedJournal = data.journal.filter(j => j.id !== id);
    
    await storageService.saveUserData({
      ...data,
      journal: updatedJournal
    });

    return updatedJournal;
  },

  getQuranProgress: async (): Promise<QuranProgress> => {
    const data = await storageService.getUserData();
    return data.quran || DEFAULT_DATA.quran;
  },

  saveQuranProgress: async (progress: QuranProgress): Promise<QuranProgress> => {
    const data = await storageService.getUserData();
    
    // Calculate Streak Logic locally before saving
    const lastDate = new Date(data.quran.lastReadDate);
    const today = new Date();
    lastDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = progress.streak;
    // If saving progress for the first time today, check streak
    if (diffDays === 1) newStreak += 1;
    else if (diffDays > 1) newStreak = 1; 
    
    const updatedProgress = {
        ...progress,
        streak: newStreak,
        lastReadDate: new Date().toISOString()
    };

    await storageService.saveUserData({
      ...data,
      quran: updatedProgress
    });

    return updatedProgress;
  },
  
  getDefaultProgress: (): QuranProgress => DEFAULT_DATA.quran
};
