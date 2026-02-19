
import React, { useState, useEffect } from 'react';
import { PrayerTimesView } from './components/PrayerTimes';
import { QiblaCompass } from './components/QiblaCompass';
import { Journal } from './components/Journal';
import { QuranTracker } from './components/QuranTracker';
import { HadithView } from './components/HadithView';
import { Navigation } from './components/Navigation';
import { DynamicBackground } from './components/DynamicBackground';
import { Settings } from './components/Settings';
import { InstallPrompt } from './components/InstallPrompt';
import { supabase } from './lib/supabaseClient';
import { storageService } from './services/storage';
import { AppTab, PrayerData } from './types';
import { Loader2, AlertTriangle, Heart } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { Analytics } from '@vercel/analytics/react';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [loading, setLoading] = useState(true);
  
  // Location & Method State
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [method, setMethod] = useState<number>(3); // Default to Muslim World League (3)
  const [isPreciseLocation, setIsPreciseLocation] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Prayer Data State
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  
  // Hijri Adjustment State (Persisted in localStorage & Cloud)
  const [hijriAdjustment, setHijriAdjustment] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('hijri_adjustment') || '0');
    } catch { return 0; }
  });

  const getMethodByCountryCode = (code: string): number => {
    const c = code ? code.toUpperCase() : '';
    // Rules based on region standards
    if (['SA'].includes(c)) return 4; // Saudi Arabia (Umm al-Qura)
    if (['EG'].includes(c)) return 5; // Egypt (General Authority of Survey)
    if (['PK', 'IN', 'BD', 'AF'].includes(c)) return 1; // Karachi (Hanbali/Maliki/Shafi) - often used for Hanafi areas too
    if (['US', 'CA'].includes(c)) return 2; // North America (ISNA)
    if (['AE', 'BH', 'OM', 'JO'].includes(c)) return 8; // Gulf Region
    if (['KW'].includes(c)) return 9; // Kuwait
    if (['QA'].includes(c)) return 10; // Qatar
    if (['TR'].includes(c)) return 13; // Turkey (Diyanet)
    if (['IR'].includes(c)) return 7; // Tehran
    if (['SG', 'MY', 'ID'].includes(c)) return 11; // Singapore/Malaysia
    if (['FR', 'DE', 'GB', 'IT', 'ES'].includes(c)) return 12; // France/Europe (UOIF) - optional, can default to 3
    
    // Default: Muslim World League
    return 3;
  };

  const handleHijriChange = async (val: number) => {
    if (val > 3 || val < -3) return;
    
    // 1. Update State & LocalStorage immediately
    setHijriAdjustment(val);
    localStorage.setItem('hijri_adjustment', val.toString());
    
    // 2. Refetch prayers
    if (coords) {
      fetchPrayerTimes(coords.latitude, coords.longitude, val, method);
    }

    // 3. Sync to Cloud
    if (session) {
      const currentData = await storageService.getUserData();
      await storageService.saveUserData({
          ...currentData,
          settings: { ...currentData.settings, hijriAdjustment: val }
      });
    }
  };

  // 1. Initial Load: Auth & Location Strategy
  useEffect(() => {
    // Auth Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // Load user settings if logged in
      if (session) {
        storageService.getUserData().then(data => {
             if (data.settings?.hijriAdjustment !== undefined) {
                 setHijriAdjustment(data.settings.hijriAdjustment);
                 // If we have coords already, update prayers with new adjustment
                 if (coords) {
                     fetchPrayerTimes(coords.latitude, coords.longitude, data.settings.hijriAdjustment, method);
                 }
             }
        });
      }
    }).catch(err => console.error("Supabase connection error:", err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
         // Re-fetch when signing in
         storageService.getUserData().then(data => {
            if (data.settings?.hijriAdjustment !== undefined) {
                setHijriAdjustment(data.settings.hijriAdjustment);
                if (coords) {
                   fetchPrayerTimes(coords.latitude, coords.longitude, data.settings.hijriAdjustment, method);
                }
            }
         });
      }
    });

    // Re-check logic on visibility change (returning to app)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Aggressively check if we can upgrade to GPS
        if (navigator.permissions && navigator.geolocation) {
           navigator.permissions.query({ name: 'geolocation' }).then(perm => {
              if (perm.state === 'granted') {
                 // If granted, force update to GPS
                 requestGPS();
              } else if (coords) {
                 // Otherwise just refresh current coords
                 fetchPrayerTimes(coords.latitude, coords.longitude, hijriAdjustment, method);
              }
           });
        } else if (coords) {
           fetchPrayerTimes(coords.latitude, coords.longitude, hijriAdjustment, method);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const initLocationStrategy = async () => {
      try {
        // STRATEGY 1: Check if GPS Permission is ALREADY granted.
        // If yes, skip IP check and go straight to GPS for accuracy.
        if (navigator.permissions && navigator.geolocation) {
          try {
             const perm = await navigator.permissions.query({ name: 'geolocation' });
             if (perm.state === 'granted') {
                requestGPS(); // Will handle fetching and loading state
                return;
             }
          } catch (e) {
             console.log("Permissions API not supported, falling back to IP first");
          }
        }

        // STRATEGY 2: Fallback to IP Geolocation
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (!res.ok) throw new Error('IP Fetch failed');
        
        const data = await res.json();
        const lat = parseFloat(data.latitude);
        const lng = parseFloat(data.longitude);
        const detectedMethod = getMethodByCountryCode(data.country_code);

        setCoords({ latitude: lat, longitude: lng });
        setLocationName(data.city || data.country || 'موقع تقريبي');
        setMethod(detectedMethod);
        setIsPreciseLocation(false); // IP is approximate

        await fetchPrayerTimes(lat, lng, hijriAdjustment, detectedMethod);
      } catch (err) {
        console.error("Location Error:", err);
        // STRATEGY 3: Fallback to Makkah
        const mecca = { lat: 21.4225, lng: 39.8262 };
        setCoords({ latitude: mecca.lat, longitude: mecca.lng });
        setLocationName('مكة المكرمة (افتراضي)');
        setMethod(4);
        await fetchPrayerTimes(mecca.lat, mecca.lng, hijriAdjustment, 4);
      } finally {
        setLoading(false);
      }
    };

    initLocationStrategy();

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 2. Request Precise GPS
  const requestGPS = () => {
    if (!navigator.geolocation) {
      alert('جهازك لا يدعم تحديد الموقع الجغرافي');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setIsPreciseLocation(true);
        
        // Reverse Geocoding to get City Name
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`);
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || '';
            setLocationName(city ? `${city} (GPS)` : 'موقعي الحالي (GPS)');
        } catch (e) {
            console.error("Reverse geocoding failed", e);
            setLocationName('موقعي الحالي (GPS)');
        }
        
        // Use the method we already detected from IP if available, or default to 3
        fetchPrayerTimes(latitude, longitude, hijriAdjustment, method);
        setLoading(false); 
      },
      (err) => {
        console.error(err);
        if (loading) setLoading(false); 
        if (err.code === err.PERMISSION_DENIED && !loading) {
           // handled quietly
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const fetchPrayerTimes = async (lat: number, lng: number, adjustment: number, calcMethod: number) => {
    try {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=${calcMethod}&t=${Date.now()}`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        const adjustedData = applyHijriAdjustment(data.data, adjustment);
        setPrayerData(adjustedData);
      }
    } catch (err) {
      console.error("Failed to fetch timings", err);
      setError('تعذر تحديث المواقيت');
    }
  };

  const applyHijriAdjustment = (data: PrayerData, adjustment: number): PrayerData => {
    if (adjustment === 0) return data;
    try {
        const newData = JSON.parse(JSON.stringify(data));
        const hijri = newData.date.hijri;
        
        let day = parseInt(hijri.day);
        let month = hijri.month.number;
        let year = parseInt(hijri.year);
        
        day += adjustment;
        
        if (day > 30) {
            day -= 30;
            month += 1;
            if (month > 12) { month = 1; year += 1; }
        } else if (day < 1) {
            day += 30;
            month -= 1;
            if (month < 1) { month = 12; year -= 1; }
        }
        
        newData.date.hijri.day = day.toString().padStart(2, '0');
        newData.date.hijri.month.number = month;
        newData.date.hijri.year = year.toString();
        
        const monthNames = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
        if (month >= 1 && month <= 12) {
            newData.date.hijri.month.ar = monthNames[month - 1];
        }

        return newData;
    } catch (e) {
        console.error("Error adjusting date", e);
        return data;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
            <PrayerTimesView 
                data={prayerData} 
                locationName={locationName} 
                isPrecise={isPreciseLocation}
                onEnableLocation={requestGPS}
                onOpenQuran={() => setActiveTab(AppTab.QURAN)}
                onOpenQibla={() => setActiveTab(AppTab.QIBLA)}
                onOpenJournal={() => setActiveTab(AppTab.JOURNAL)}
            />
        );
      case AppTab.QIBLA:
        return (
            <QiblaCompass 
                latitude={coords?.latitude || null} 
                longitude={coords?.longitude || null} 
            />
        );
      case AppTab.JOURNAL:
        return <Journal />;
      case AppTab.QURAN:
        return <QuranTracker />;
      case AppTab.HADITH:
        return <HadithView />;
      case AppTab.SETTINGS:
        return (
           <Settings 
             session={session} 
             hijriAdjustment={hijriAdjustment} 
             onHijriChange={handleHijriChange} 
             prayerData={prayerData}
           />
        );
      default:
        return <PrayerTimesView 
           data={prayerData} 
           locationName={locationName} 
           isPrecise={isPreciseLocation} 
           onEnableLocation={requestGPS} 
           onOpenQuran={() => setActiveTab(AppTab.QURAN)}
           onOpenQibla={() => setActiveTab(AppTab.QIBLA)}
           onOpenJournal={() => setActiveTab(AppTab.JOURNAL)}
        />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-emerald-500">
        <Loader2 size={48} className="animate-spin mb-4" />
        <h1 className="text-2xl font-bold font-serif text-white tracking-widest">NOOR</h1>
        <p className="text-emerald-500/60 mt-2 text-sm">Spiritual Assistant</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full font-sans selection:bg-amber-500/30 overflow-x-hidden">
      <DynamicBackground 
         fajrTime={prayerData?.timings.Fajr}
         sunriseTime={prayerData?.timings.Sunrise}
         maghribTime={prayerData?.timings.Maghrib}
      />
      
      <InstallPrompt />

      <main className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-900/60 to-transparent">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider font-serif drop-shadow-md">نـور</h1>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${session ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
               </div>
            </div>
        </header>

        <div className="flex-1 p-3 pb-24 overflow-y-auto custom-scrollbar">
          {/* Beta Alert Banner */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 mb-3 flex items-start gap-3 backdrop-blur-sm">
             <AlertTriangle className="text-indigo-400 shrink-0 mt-0.5" size={16} />
             <div>
               <p className="text-xs text-indigo-200 font-bold mb-0.5">نسخة تجريبية (Beta)</p>
               <p className="text-[10px] text-indigo-200/70 leading-relaxed">
                 هذا التطبيق لا يزال في مرحلة التطوير، قد تواجه بعض الأخطاء. شكراً لتفهمكم.
               </p>
             </div>
          </div>

          {error && activeTab === AppTab.HOME && (
             <div className="bg-red-900/60 backdrop-blur-md border border-red-500/30 p-2 rounded-xl mb-3 text-[10px] text-white text-center shadow-lg">
               {error}
             </div>
          )}
          
          {renderContent()}

          {/* Global App Footer */}
          <div className="mt-8 pb-4 flex justify-center">
            <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl px-6 py-3 shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300 mb-1 font-medium" dir="ltr">
                   <span>Made for the Ummah</span>
                   <Heart size={10} className="fill-white text-white" />
                </div>
                <p className="text-[9px] text-slate-500 font-mono text-center">Noor App v1.4.0-beta</p>
            </div>
          </div>
        </div>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
      <Analytics />
    </div>
  );
};

export default App;
