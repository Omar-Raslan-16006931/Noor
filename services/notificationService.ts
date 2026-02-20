import { PrayerData } from '../types';

const HADITH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours

export const notificationService = {
  // 1. Request Permission
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  // 2. Check Notifications (Call this periodically)
  checkNotifications: (prayerData: PrayerData | null) => {
    if (Notification.permission !== 'granted') return;
    checkPrayerTimes(prayerData);
    checkHadithTime();
  },

  // 3. Register Service Worker
  registerSW: async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      } catch (err) {
        console.log('ServiceWorker registration failed: ', err);
      }
    }
  },

  // 4. Preferences
  getPreferences: () => {
    return {
      prayers: localStorage.getItem('notif_pref_prayers') !== 'false', // Default true
      hadith: localStorage.getItem('notif_pref_hadith') !== 'false'   // Default true
    };
  },

  setPreferences: (prayers: boolean, hadith: boolean) => {
    localStorage.setItem('notif_pref_prayers', prayers.toString());
    localStorage.setItem('notif_pref_hadith', hadith.toString());
  }
};

// Helper: Check Prayer Times
const checkPrayerTimes = (prayerData: PrayerData | null) => {
  if (!prayerData) return;
  if (localStorage.getItem('notif_pref_prayers') === 'false') return;

  const timings = prayerData.timings;
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const arabicNames: Record<string, string> = {
    Fajr: 'الفجر',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  prayerNames.forEach((prayer) => {
    const timeStr = timings[prayer as keyof typeof timings]; // "HH:mm"
    if (!timeStr) return;

    const [hours, minutes] = timeStr.split(':').map(Number);

    // Check if current time matches prayer time (within the last minute)
    if (hours === currentHours && minutes === currentMinutes) {
      // Prevent duplicate notifications for the same minute
      const lastPrayerNotif = localStorage.getItem('last_prayer_notification');
      const lastTime = lastPrayerNotif ? parseInt(lastPrayerNotif) : 0;
      
      // If we haven't notified for this prayer in the last 60 seconds
      if (Date.now() - lastTime > 60000) {
        new Notification(`حان الآن موعد صلاة ${arabicNames[prayer]}`, {
          body: `حان الآن موعد صلاة ${arabicNames[prayer]} حسب التوقيت المحلي.`,
          icon: '/icon.png',
          dir: 'rtl',
          lang: 'ar'
        });
        localStorage.setItem('last_prayer_notification', Date.now().toString());
      }
    }
  });
};

// Helper: Check Hadith Time
const checkHadithTime = () => {
  if (localStorage.getItem('notif_pref_hadith') === 'false') return;

  const lastTimeStr = localStorage.getItem('last_hadith_notification');
  const lastTime = lastTimeStr ? parseInt(lastTimeStr) : 0;
  const now = Date.now();

  if (now - lastTime >= HADITH_INTERVAL) {
    triggerHadithNotification();
    localStorage.setItem('last_hadith_notification', now.toString());
  }
};

// Helper: Trigger Hadith
const triggerHadithNotification = () => {
  const hadiths = [
    "قال رسول الله ﷺ: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى»",
    "قال رسول الله ﷺ: «من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت»",
    "قال رسول الله ﷺ: «لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه»",
    "قال رسول الله ﷺ: «اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن»",
    "قال رسول الله ﷺ: «المسلم من سلم المسلمون من لسانه ويده»",
    "قال رسول الله ﷺ: «من لا يشكر الناس لا يشكر الله»"
  ];
  const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];

  new Notification("حديث نبوي شريف", {
    body: randomHadith,
    icon: '/icon.png',
    dir: 'rtl',
    lang: 'ar'
  });
};

