import { PrayerData } from '../types';

const HADITH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
const CHECK_INTERVAL = 60 * 1000; // Check every minute

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
  }
};

// Helper: Check Prayer Times
const checkPrayerTimes = (prayerData: PrayerData | null) => {
  if (!prayerData) return;

  const timings = prayerData.timings;
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

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
        new Notification(`Time for ${prayer}`, {
          body: `It is now time for ${prayer} prayer.`,
          icon: '/icon.png'
        });
        localStorage.setItem('last_prayer_notification', Date.now().toString());
      }
    }
  });
};

// Helper: Check Hadith Time
const checkHadithTime = () => {
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
    "The best among you are those who have the best manners and character.",
    "Kindness is a mark of faith, and whoever is not kind has no faith.",
    "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he gets angry.",
    "Allah does not look at your forms and possessions but he looks at your hearts and your deeds.",
    "Speak good or remain silent.",
    "He who is not grateful to people is not grateful to Allah."
  ];
  const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];

  new Notification("Hadith of the Moment", {
    body: randomHadith,
    icon: '/icon.png'
  });
};

