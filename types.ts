
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
    location?: {
      latitude: number;
      longitude: number;
      method: number;
      name: string;
    };
    notifications?: {
      prayers: boolean;
      hadith: boolean;
    };
  };
}

export interface UserProfile {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  data: UserData;
}

export interface Report {
  id: string;
  user_id: string;
  type: 'suggestion' | 'bug';
  message: string;
  is_read: boolean;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
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

export interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user?: {
    username: string;
    avatar_url?: string;
  };
  is_liked?: boolean; // For UI state
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  parent_id?: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export enum AppTab {
  HOME = 'HOME',
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  JOURNAL = 'JOURNAL',
  QIBLA = 'QIBLA',
  TASBIH = 'TASBIH',
  SETTINGS = 'SETTINGS',
  BRANDING = 'BRANDING',
  ZAKAT = 'ZAKAT',
  COMMUNITY = 'COMMUNITY'
}
