
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface HijriDate {
  date: string;
  format: string;
  day: string;
  weekday: {
    en: string;
    ar: string;
  };
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  designation: {
    abbreviated: string;
    expanded: string;
  };
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    hijri: HijriDate;
  };
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: 'peaceful' | 'grateful' | 'reflecting' | 'challenging';
}

export interface QuranProgress {
  currentPage: number; // 1-604
  totalPagesRead: number;
  khatamGoal: number; // e.g., 1, 2, 3
  lastReadDate: string;
  streak: number;
  lastSurah?: number;
  lastAyah?: number;
}

export interface UserData {
  journal: JournalEntry[];
  quran: QuranProgress;
  settings: {
    hijriAdjustment: number;
    theme?: string;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  data: UserData;
}

export interface Hadith {
  id: string | number;
  text: string; // The Arabic text or English if Arabic missing
  arabic?: string;
  english?: string;
  source: string; // e.g., "Sahih Al-Bukhari"
  hadithNumber?: string;
  narrator?: string;
  chapter?: string;
  bookSlug?: string;
}

export interface Dua {
  id: string;
  category: string;
  arabic: string;
  translation?: string;
  source: string;
  reference?: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
  startPage: number;
}

export enum AppTab {
  HOME = 'HOME',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  JOURNAL = 'JOURNAL',
  QIBLA = 'QIBLA',
  SETTINGS = 'SETTINGS'
}
