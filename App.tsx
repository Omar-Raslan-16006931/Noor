import React, { useState, useEffect, useRef } from 'react';
import { PrayerTimesView } from './components/PrayerTimes';
import { QiblaCompass } from './components/QiblaCompass';
import { Journal } from './components/Journal';
import { QuranTracker } from './components/QuranTracker';
import { QuranReader } from './components/QuranReader';
import { HadithView } from './components/HadithView';
import { CommunityFeed } from './components/Community/CommunityFeed';
import { TasbihCounter } from './components/TasbihCounter';
import { Navigation } from './components/Navigation';
import { DynamicBackground } from './components/DynamicBackground';
import { Settings } from './components/Settings';
import { BrandingGenerator } from './components/BrandingGenerator';
import { ZakatCalculator } from './components/ZakatCalculator';
import { InstallPrompt } from './components/InstallPrompt';
import { supabase } from './lib/supabaseClient';
import { storageService } from './services/storage';
import { notificationService } from './services/notificationService';
import { AppTab, PrayerData } from './types';
import { Loader2, AlertTriangle, Heart } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

// ── Tab order: left = 0, right = 9 ───────────────────────────────────────────
const TAB_ORDER: Record<AppTab, number> = {
  [AppTab.SETTINGS]:  0,
  [AppTab.ZAKAT]:     1,
  [AppTab.BRANDING]:  2,
  [AppTab.COMMUNITY]: 3,
  [AppTab.TASBIH]:    4,
  [AppTab.HADITH]:    5,
  [AppTab.JOURNAL]:   6,
  [AppTab.QIBLA]:     7,
  [AppTab.QURAN]:     8,
  [AppTab.HOME]:      9,
};

// ── Footer ────────────────────────────────────────────────────────────────────
const TabFooter: React.FC = () => (
  <div className="mt-8 pb-4 flex justify-center">
    <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-3 shadow-lg">
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300 mb-1 font-medium" dir="ltr">
        <span>Made for the Ummah</span>
        <Heart size={10} className="fill-white text-white" />
      </div>
      <p className="text-[9px] text-slate-500 font-mono text-center">Noor App v1.6.0 beta</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [session, setSession]                     = useState<Session | null>(null);
  const [activeTab, setActiveTab]                 = useState<AppTab>(AppTab.HOME);
  const [loading, setLoading]                     = useState(true);
  const prevTabRef                                = useRef<AppTab>(AppTab.HOME);

  // Location & Method
  const [coords, setCoords]                       = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName]           = useState<string>('');

  // Default to MWL (3) — works correctly for Egypt and most countries
  const [method, setMethod] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('detected_method') || '3'); }
    catch { return 3; }
  });

  const [isPreciseLocation, setIsPreciseLocation] = useState(false);
  const [error, setError]                         = useState<string>('');

  // Prayer Data
  const [prayerData, setPrayerData]               = useState<PrayerData | null>(null);

  // Quran / Kahf
  const [autoOpenQuran, setAutoOpenQuran]         = useState<number | undefined>(undefined);
  const [showKahfReader, setShowKahfReader]       = useState(false);
  const [kahfPage, setKahfPage]                   = useState(293);
  const handleOpenKahf = () => { setKahfPage(293); setShowKahfReader(true); };

  // Hijri
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('hijri_adjustment') || '0'); }
    catch { return 0; }
  });

  // ── Tab change with direction tracking ────────────────────────────────────
  const handleTabChange = (tab: AppTab) => {
    prevTabRef.current = activeTab;
    setActiveTab(tab);
  };

  // ── Selective refresh on HOME focus ──────────────────────────────────────
  useEffect(() => {
    if (activeTab === AppTab.HOME && coords) {
      fetchPrayerTimes(coords.latitude, coords.longitude, hijriAdjustment, method);
    }
  }, [activeTab]);

  // ── Country → Calculation Method ─────────────────────────────────────────
  // Egypt uses method 3 (MWL) — method 5 gives fixed +2h Isha offset which is wrong
  const getMethodByCountryCode = (code: string): number => {
    const c = code ? code.toUpperCase() : '';
    if (['SA'].includes(c)) return 4;  // Umm al-Qura
    if (['EG'].includes(c)) return 3;  // MWL — method 5 uses fixed interval, not angle-based
    if (['PK', 'IN', 'BD', 'AF'].includes(c)) return 1;  // Karachi
    if (['US', 'CA'].includes(c)) return 2;               // ISNA
    if (['AE', 'BH', 'OM', 'JO'].includes(c)) return 8;  // Gulf
    if (['KW'].includes(c)) return 9;                     // Kuwait
    if (['QA'].includes(c)) return 10;                    // Qatar
    if (['TR'].includes(c)) return 13;                    // Turkey
    if (['IR'].includes(c)) return 7;                     // Tehran
    if (['SG', 'MY', 'ID'].includes(c)) return 11;        // Singapore
    if (['FR', 'DE', 'GB', 'IT', 'ES'].includes(c)) return 12; // France/Europe
    return 3; // Default: MWL
  };

  const handleHijriChange = async (val: number) => {
    if (val > 3 || val < -3) return;
    setHijriAdjustment(val);
    localStorage.setItem('hijri_adjustment', val.toString());
    if (coords) fetchPrayerTimes(coords.latitude, coords.longitude, val, method);
    if (session) {
      const currentData = await storageService.getUserData();
      await storageService.saveUserData({
        ...currentData,
        settings: { ...currentData.settings, hijriAdjustment: val }
      });
    }
  };

  // ── 1. Initial Load ───────────────────────────────────────────────────────
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      setLoading(prev => {
        if (prev) {
          if (!prayerData) {
            const mecca = { lat: 21.4225, lng: 39.8262 };
            setCoords({ latitude: mecca.lat, longitude: mecca.lng });
            setLocationName('مكة المكرمة (افتراضي)');
            setMethod(4);
            localStorage.setItem('detected_method', '4');
            fetchPrayerTimes(mecca.lat, mecca.lng, hijriAdjustment, 4);
          }
          return false;
        }
        return prev;
      });
    }, 10000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        storageService.getUserData().then(data => {
          if (data.settings?.hijriAdjustment !== undefined)
            setHijriAdjustment(data.settings.hijriAdjustment);
          if (data.settings?.location) {
            const { latitude, longitude, method, name } = data.settings.location;
            setCoords({ latitude, longitude });
            setMethod(method);
            localStorage.setItem('detected_method', method.toString());
            setLocationName(name);
            fetchPrayerTimes(latitude, longitude, data.settings.hijriAdjustment, method)
              .finally(() => setLoading(false));
          } else {
            initLocationStrategy();
          }
          if (data.settings?.notifications) {
            notificationService.setPreferences(
              data.settings.notifications.prayers,
              data.settings.notifications.hadith
            );
          }
        });
      } else {
        initLocationStrategy();
      }
    }).catch(() => initLocationStrategy());

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        storageService.getUserData().then(data => {
          if (data.settings?.hijriAdjustment !== undefined) {
            setHijriAdjustment(data.settings.hijriAdjustment);
            if (data.settings.location) {
              const { latitude, longitude, method, name } = data.settings.location;
              setCoords({ latitude, longitude });
              setMethod(method);
              localStorage.setItem('detected_method', method.toString());
              setLocationName(name);
              fetchPrayerTimes(latitude, longitude, data.settings.hijriAdjustment, method);
            }
          }
        });
      }
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (navigator.permissions && navigator.geolocation) {
          navigator.permissions.query({ name: 'geolocation' }).then(perm => {
            if (perm.state === 'granted') requestGPS();
            else if (coords) fetchPrayerTimes(coords.latitude, coords.longitude, hijriAdjustment, method);
          });
        } else if (coords) {
          fetchPrayerTimes(coords.latitude, coords.longitude, hijriAdjustment, method);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const initLocationStrategy = async () => {
      try {
        if (navigator.permissions && navigator.geolocation) {
          try {
            const perm = await navigator.permissions.query({ name: 'geolocation' });
            if (perm.state === 'granted') { requestGPS(); return; }
          } catch {}
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        try {
          const res = await fetch('https://get.geojs.io/v1/ip/geo.json', { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('IP Fetch failed');
          const data = await res.json();
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          const detectedMethod = getMethodByCountryCode(data.country_code);

          setCoords({ latitude: lat, longitude: lng });
          setLocationName(data.city || data.country || 'موقع تقريبي');
          setMethod(detectedMethod);
          localStorage.setItem('detected_method', detectedMethod.toString());

          // Clear stale prayer cache so new method fetches fresh
          Object.keys(localStorage)
            .filter(k => k.startsWith('prayer_'))
            .forEach(k => localStorage.removeItem(k));

          setIsPreciseLocation(false);
          await fetchPrayerTimes(lat, lng, hijriAdjustment, detectedMethod);
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          throw fetchErr;
        }
      } catch {
        const mecca = { lat: 21.4225, lng: 39.8262 };
        setCoords({ latitude: mecca.lat, longitude: mecca.lng });
        setLocationName('مكة المكرمة (افتراضي)');
        setMethod(4);
        localStorage.setItem('detected_method', '4');
        await fetchPrayerTimes(mecca.lat, mecca.lng, hijriAdjustment, 4);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(safetyTimeout);
    };
  }, []);

  // ── 2. Notifications ──────────────────────────────────────────────────────
  useEffect(() => {
    notificationService.registerSW();
    const interval = setInterval(() => notificationService.checkNotifications(prayerData), 60000);
    notificationService.checkNotifications(prayerData);
    return () => clearInterval(interval);
  }, [prayerData]);

  // ── 3. GPS ────────────────────────────────────────────────────────────────
  const requestGPS = () => {
    if (!navigator.geolocation) { alert('جهازك لا يدعم تحديد الموقع الجغرافي'); return; }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setIsPreciseLocation(true);
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
          );
          const data = await res.json();
          const city = data.city || data.locality || data.principalSubdivision || '';
          const newLocationName = city ? `${city} (GPS)` : 'موقعي الحالي (GPS)';
          setLocationName(newLocationName);
          if (session) {
            storageService.getUserData().then(userData => {
              storageService.saveUserData({
                ...userData,
                settings: {
                  ...userData.settings,
                  location: { latitude, longitude, method, name: newLocationName }
                }
              });
            });
          }
        } catch { setLocationName('موقعي الحالي (GPS)'); }
        fetchPrayerTimes(latitude, longitude, hijriAdjustment, method);
        setLoading(false);
      },
      (err) => { console.error(err); if (loading) setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ── 4. Fallback Data ──────────────────────────────────────────────────────
  const FALLBACK_PRAYER_DATA: PrayerData = {
    timings: {
      Fajr: "05:00", Sunrise: "06:30", Dhuhr: "12:30", Asr: "15:45",
      Sunset: "18:00", Maghrib: "18:15", Isha: "19:30", Imsak: "04:50", Midnight: "00:00"
    },
    date: {
      readable: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      timestamp: Math.floor(Date.now() / 1000).toString(),
      hijri: {
        date: "01-01-1446", format: "DD-MM-YYYY", day: "01",
        weekday: { en: "Monday", ar: "الإثنين" },
        month: { number: 1, en: "Muharram", ar: "محرم" },
        year: "1446",
        designation: { abbreviated: "AH", expanded: "Anno Hegirae" }
      }
    }
  };

  // ── 5. Fetch Prayer Times ─────────────────────────────────────────────────
  const fetchPrayerTimes = async (
    lat: number, lng: number, adjustment: number, calcMethod: number
  ) => {
    const today    = new Date().toISOString().split('T')[0];
    const cacheKey = `prayer_${today}_${calcMethod}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

    try {
      const timestamp  = Math.floor(Date.now() / 1000);
      const controller = new AbortController();
      const timeoutId  = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${calcMethod}&t=${Date.now()}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const data = await response.json();
      if (data.code === 200) {
        // Save RAW data (pre-adjustment) keyed by date+method+coords
        localStorage.setItem(cacheKey, JSON.stringify(data.data));

        // Remove all stale prayer cache keys
        Object.keys(localStorage)
          .filter(k => k.startsWith('prayer_') && k !== cacheKey)
          .forEach(k => localStorage.removeItem(k));

        // Remove old format key
        localStorage.removeItem('cached_prayer_data');

        const adjusted = applyHijriAdjustment(data.data, adjustment);
        setPrayerData(adjusted);
        setError('');
      } else {
        throw new Error(`API code: ${data.code}`);
      }
    } catch (err) {
      console.error('fetchPrayerTimes failed:', err);
      setError('تعذر الاتصال بالخادم - وضع غير متصل');

      // Try exact today+method+coords cache
      const exact = localStorage.getItem(cacheKey);
      if (exact) {
        try {
          setPrayerData(applyHijriAdjustment(JSON.parse(exact), adjustment));
          setError('');
          return;
        } catch {}
      }

      // Try any cache from today
      const anyToday = Object.keys(localStorage)
        .find(k => k.startsWith(`prayer_${today}_`));
      if (anyToday) {
        try {
          setPrayerData(applyHijriAdjustment(JSON.parse(localStorage.getItem(anyToday)!), adjustment));
          setError('');
          return;
        } catch {}
      }

      // Last resort
      setPrayerData(FALLBACK_PRAYER_DATA);
    }
  };

  // ── 6. Hijri Adjustment ───────────────────────────────────────────────────
  const applyHijriAdjustment = (data: PrayerData, adjustment: number): PrayerData => {
    if (adjustment === 0) return data;
    try {
      const newData = JSON.parse(JSON.stringify(data));
      const hijri   = newData.date.hijri;
      let day       = parseInt(hijri.day);
      let month     = hijri.month.number;
      let year      = parseInt(hijri.year);
      day += adjustment;
      if (day > 30)     { day -= 30; month += 1; if (month > 12) { month = 1; year += 1; } }
      else if (day < 1) { day += 30; month -= 1; if (month < 1)  { month = 12; year -= 1; } }
      newData.date.hijri.day          = day.toString().padStart(2, '0');
      newData.date.hijri.month.number = month;
      newData.date.hijri.year         = year.toString();
      const monthNames = [
        "محرم","صفر","ربيع الأول","ربيع الآخر","جمادى الأولى",
        "جمادى الآخرة","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"
      ];
      if (month >= 1 && month <= 12)
        newData.date.hijri.month.ar = monthNames[month - 1];
      return newData;
    } catch { return data; }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500">
        <Loader2 size={48} className="animate-spin mb-4" />
        <h1 className="text-2xl font-bold font-serif text-white tracking-widest">NOOR</h1>
        <p className="text-emerald-500/60 mt-2 text-sm">Islamic Assistant</p>
      </div>
    );
  }

  // ── Shared prayer view props ──────────────────────────────────────────────
  const prayerViewProps = {
    data: prayerData,
    locationName,
    isPrecise: isPreciseLocation,
    onEnableLocation: requestGPS,
    onOpenQuran:   () => handleTabChange(AppTab.QURAN),
    onOpenQibla:   () => handleTabChange(AppTab.QIBLA),
    onOpenJournal: () => handleTabChange(AppTab.JOURNAL),
    onOpenHadith:  () => handleTabChange(AppTab.HADITH),
    onOpenTasbih:  () => handleTabChange(AppTab.TASBIH),
    onOpenKahf:    handleOpenKahf,
  };

  // ── Tab definitions ───────────────────────────────────────────────────────
  const tabs: { tab: AppTab; content: React.ReactNode }[] = [
    {
      tab: AppTab.SETTINGS,
      content: (
        <>
          <Settings
            session={session}
            hijriAdjustment={hijriAdjustment}
            onHijriChange={handleHijriChange}
            prayerData={prayerData}
            onOpenBranding={() => handleTabChange(AppTab.BRANDING)}
          />
          <TabFooter />
        </>
      ),
    },
    { tab: AppTab.ZAKAT,     content: <><ZakatCalculator /><TabFooter /></> },
    { tab: AppTab.BRANDING,  content: <><BrandingGenerator /><TabFooter /></> },
    { tab: AppTab.COMMUNITY, content: <CommunityFeed isActive={activeTab === AppTab.COMMUNITY} /> },
    { tab: AppTab.TASBIH,    content: <><TasbihCounter /><TabFooter /></> },
    { tab: AppTab.HADITH,    content: <><HadithView onOpenKahf={handleOpenKahf} /><TabFooter /></> },
    { tab: AppTab.JOURNAL,   content: <><Journal /><TabFooter /></> },
    {
      tab: AppTab.QIBLA,
      content: (
        <>
          <QiblaCompass latitude={coords?.latitude || null} longitude={coords?.longitude || null} />
          <TabFooter />
        </>
      ),
    },
    { tab: AppTab.QURAN, content: <><QuranTracker autoOpen={autoOpenQuran} /><TabFooter /></> },
    { tab: AppTab.HOME,  content: <><PrayerTimesView {...prayerViewProps} /><TabFooter /></> },
  ];

  return (
    <div className="min-h-screen w-full font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <DynamicBackground
        fajrTime={prayerData?.timings.Fajr}
        sunriseTime={prayerData?.timings.Sunrise}
        maghribTime={prayerData?.timings.Maghrib}
      />

      <InstallPrompt />

      <main className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">

        {/* Header */}
        <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-900/60 to-transparent shrink-0">
          <h1 className="text-2xl font-bold text-white tracking-wider font-serif drop-shadow-md">نـور</h1>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${session ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
        </header>

        {/* Shared banners */}
        <div className="px-3 shrink-0">
          <div className="bg-indigo-950/40 border border-indigo-500/10 rounded-lg p-2 mb-2 flex items-center gap-2 backdrop-blur-sm shadow-sm">
            <AlertTriangle className="text-indigo-400 shrink-0" size={12} />
            <p className="text-[10px] text-indigo-200/80 leading-tight">
              <span className="font-bold text-indigo-100">نسخة تجريبية (Beta):</span> التطبيق قيد التطوير، شكراً لتفهمكم.
            </p>
          </div>
          {error && activeTab === AppTab.HOME && (
            <div className="bg-red-900/60 backdrop-blur-md border border-red-500/30 p-2 rounded-xl mb-2 text-[10px] text-white text-center shadow-lg">
              {error}
            </div>
          )}
        </div>

        {/* ── Tab panels — horizontal slide ─────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {tabs.map(({ tab, content }) => {
            const isActive   = activeTab === tab;
            const currentIdx = TAB_ORDER[activeTab];
            const prevIdx    = TAB_ORDER[prevTabRef.current];
            const direction  = currentIdx > prevIdx ? 1 : -1;

            return (
              <AnimatePresence key={tab} initial={false} mode="popLayout">
                {isActive && (
                  <motion.div
                    key={tab}
                    initial={{  x: `${direction * 100}%`,  opacity: 0 }}
                    animate={{  x: '0%',                   opacity: 1 }}
                    exit={{     x: `${direction * -100}%`, opacity: 0 }}
                    transition={{
                      x:       { type: 'tween', duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                      opacity: { duration: 0.15 },
                    }}
                    className="absolute inset-0 overflow-y-auto custom-scrollbar px-3 pb-24"
                  >
                    {content}
                  </motion.div>
                )}
              </AnimatePresence>
            );
          })}
        </div>

        <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Kahf Reader overlay */}
        {showKahfReader && (
          <QuranReader
            page={kahfPage}
            onPageChange={p => setKahfPage(p)}
            onClose={() => setShowKahfReader(false)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
