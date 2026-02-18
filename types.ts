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

export interface Hadith {
  id: string;
  text: string;
  source: string; // e.g., "Sahih Al-Bukhari 614"
  category: 'Fasting' | 'Prayer' | 'Charity' | 'Character' | 'General';
  narrator: string;
}

export interface Dua {
  id: string;
  category: 'Ramadan 1-10' | 'Ramadan 11-20' | 'Ramadan 21-30' | 'Quran' | 'Daily' | 'Forgiveness';
  arabic: string;
  translation?: string;
  source: string;
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
  QIBLA = 'QIBLA'
}
