import React, { useState, useEffect } from 'react';
import { PrayerTimesView } from './components/PrayerTimes';
import { QiblaCompass } from './components/QiblaCompass';
import { Journal } from './components/Journal';
import { QuranTracker } from './components/QuranTracker';
import { HadithView } from './components/HadithView';
import { Navigation } from './components/Navigation';
import { DynamicBackground } from './components/DynamicBackground';
import { AppTab, PrayerData } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('يرجى تفعيل خدمة الموقع لحساب مواقيت الصلاة');
          setLoading(false);
          // Default to Makkah if denied
          const mecca = { lat: 21.4225, lng: 39.8262 };
          setCoords({ latitude: mecca.lat, longitude: mecca.lng });
          setLocationName('مكة المكرمة (افتراضي)');
          fetchPrayerTimes(mecca.lat, mecca.lng);
        }
      );
    } else {
      setError('المتصفح لا يدعم تحديد الموقع');
      setLoading(false);
    }
  }, []);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerData(data.data);
        if (!locationName) setLocationName('موقعي الحالي');
      }
    } catch (err) {
      console.error("Failed to fetch timings", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return <PrayerTimesView data={prayerData} locationName={locationName} />;
      case AppTab.QIBLA:
        return <QiblaCompass latitude={coords?.latitude || null} longitude={coords?.longitude || null} />;
      case AppTab.JOURNAL:
        return <Journal />;
      case AppTab.QURAN:
        return <QuranTracker />;
      case AppTab.HADITH:
        return <HadithView />;
      default:
        return <PrayerTimesView data={prayerData} locationName={locationName} />;
    }
  };

  if (loading && !prayerData) {
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
      
      {/* Background Component */}
      <DynamicBackground 
         sunriseTime={prayerData?.timings.Sunrise}
         sunsetTime={prayerData?.timings.Sunset}
      />

      {/* Main Layout */}
      <main className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        {/* Top Header - Adjusted for spacing */}
        {activeTab !== AppTab.HOME && (
          <header className="px-5 pt-8 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-900/60 to-transparent">
             <div>
               <h1 className="text-2xl font-bold text-white tracking-wider font-serif drop-shadow-md">نـور</h1>
             </div>
             <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_currentColor]"></div>
             </div>
          </header>
        )}

        {/* Content Area */}
        <div className="flex-1 p-3 pb-24 overflow-y-auto custom-scrollbar">
          {error && activeTab === AppTab.HOME && (
             <div className="bg-red-900/60 backdrop-blur-md border border-red-500/30 p-2 rounded-xl mb-3 text-[10px] text-white text-center shadow-lg">
               {error}
             </div>
          )}
          {renderContent()}
        </div>

        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </main>
    </div>
  );
};

export default App;
