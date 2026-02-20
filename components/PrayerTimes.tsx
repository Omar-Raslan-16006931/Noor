
import React, { useState, useEffect } from 'react';
import { PrayerData, QuranProgress } from '../types';
import { MapPin, Moon, Sun, Sunrise, Sunset, Star, Clock, Gift, BookOpen, Flame, Share2, Navigation, Compass, PenTool, Scroll, Hash } from 'lucide-react';
import { RAMADAN_DUAS, TRUSTED_HADITHS } from '../data/staticContent';
import { hadithApi } from '../services/hadithApi';
import { storageService } from '../services/storage';
import { ShareModal } from './ShareModal';

interface PrayerTimesProps {
  data: PrayerData | null;
  locationName: string;
  isPrecise: boolean;
  onEnableLocation: () => void;
  onOpenQuran: () => void;
  onOpenQibla: () => void;
  onOpenJournal: () => void;
  onOpenHadith: () => void;
  onOpenTasbih: () => void;
}

// Pseudo-random generator seeded by date string
const getSeededRandomIndex = (seed: string, length: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const result = Math.abs(hash) % length;
    return result;
};

export const PrayerTimesView: React.FC<PrayerTimesProps> = ({ 
    data, locationName, isPrecise, onEnableLocation, onOpenQuran, onOpenQibla, onOpenJournal, onOpenHadith, onOpenTasbih 
}) => {
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  // Initialize with fallback static content
  const [dailyWisdom, setDailyWisdom] = useState(TRUSTED_HADITHS[0]);
  const [featuredDua, setFeaturedDua] = useState(RAMADAN_DUAS[0]);
  const [quranProgress, setQuranProgress] = useState<QuranProgress>(storageService.getDefaultProgress());
  const [shareItem, setShareItem] = useState<any | null>(null);

  useEffect(() => {
    const loadContent = async () => {
        // Load Quran progress
        const qData = await storageService.getQuranProgress();
        setQuranProgress(qData);

        // Load Daily Hadith (Async API)
        try {
            const daily = await hadithApi.getDailyHadith();
            setDailyWisdom(daily);
        } catch (e) {
            console.error("Failed to load daily hadith", e);
        }
    };
    loadContent();
    
    // Seeded Randomization for Dua (Static)
    const todayStr = new Date().toISOString().split('T')[0];
    const duaIndex = getSeededRandomIndex(todayStr + '-dua', RAMADAN_DUAS.length);
    setFeaturedDua(RAMADAN_DUAS[duaIndex]);

  }, []);

  useEffect(() => {
    if (!data) return;

    const calculateNextPrayer = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).replace('PM', 'م').replace('AM', 'ص'));

      const timings = data.timings;
      const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const arabicNames: Record<string, string> = {
        Fajr: 'الفجر',
        Sunrise: 'الشروق',
        Dhuhr: 'الظهر',
        Asr: 'العصر',
        Maghrib: 'المغرب',
        Isha: 'العشاء'
      };

      let upcoming = null;
      let upcomingTime = null;

      for (const prayer of prayerNames) {
        const timeStr = (timings as any)[prayer];
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0);

        if (prayerDate > now) {
          upcoming = prayer;
          upcomingTime = prayerDate;
          break;
        }
      }

      if (!upcoming) {
        upcoming = 'Fajr';
        const timeStr = timings.Fajr;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(hours, minutes, 0);
        upcomingTime = tomorrow;
      }

      setNextPrayer(arabicNames[upcoming]);

      const diff = upcomingTime.getTime() - now.getTime();
      const diffHrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const diffSecs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${diffHrs.toString().padStart(2, '0')}:${diffMins.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(calculateNextPrayer, 1000);
    calculateNextPrayer();

    return () => clearInterval(timer);
  }, [data]);

  if (!data) return <div className="text-center p-10 animate-pulse text-white font-quran text-lg">جاري تحميل البيانات...</div>;

  const hijriMonth = data.date.hijri.month.number;
  const hijriDay = parseInt(data.date.hijri.day);
  const isRamadan = hijriMonth === 9;
  
  // Eid Logic
  let eidGreeting = null;
  if (hijriMonth === 10 && hijriDay <= 3) {
    eidGreeting = "عيد فطر مبارك";
  } else if (hijriMonth === 12 && hijriDay >= 10 && hijriDay <= 13) {
    eidGreeting = "عيد أضحى مبارك";
  }

  const prayers = [
    { en: 'Fajr', ar: 'الفجر', icon: Moon, time: data.timings.Fajr },
    { en: 'Sunrise', ar: 'الشروق', icon: Sunrise, time: data.timings.Sunrise },
    { en: 'Dhuhr', ar: 'الظهر', icon: Sun, time: data.timings.Dhuhr },
    { en: 'Asr', ar: 'العصر', icon: Sun, time: data.timings.Asr },
    { en: 'Maghrib', ar: 'المغرب', icon: Sunset, time: data.timings.Maghrib },
    { en: 'Isha', ar: 'العشاء', icon: Moon, time: data.timings.Isha },
  ];

  // Calculate Quran Progress Percentage
  const quranPercentage = Math.round((quranProgress.currentPage / 604) * 100);
  const remainingPages = 604 - quranProgress.currentPage;

  // Format Gregorian Date (MMM YYYY DD) -> e.g. Feb 2026 19
  const formatGregorianDate = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000);
      const day = date.getDate();
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'short' });
      return `${month} ${year} ${day}`;
    } catch (e) {
      return data.date.readable;
    }
  };

  return (
    <div className="space-y-3 pb-24 pt-2 px-4 max-w-md mx-auto">
      <ShareModal item={shareItem} onClose={() => setShareItem(null)} />

      {/* Header */}
      <div className="flex justify-between items-center px-1 text-white">
        <div className="flex flex-col">
          <span className="text-2xl font-bold font-quran">{data.date.hijri.day} {data.date.hijri.month.ar}</span>
          <div className="flex items-center gap-2 mt-0.5">
             <span className="text-xs opacity-80 font-mono tracking-widest bg-white/10 px-1.5 py-0.5 rounded-md">
                {data.date.hijri.year} هـ
             </span>
             {isRamadan && <span className="text-[10px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold">شهر رمضان</span>}
          </div>
        </div>
        <div className="text-left bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-1 text-emerald-300 justify-end text-[10px] mb-0.5">
            <MapPin size={10} />
            <span className="font-bold truncate max-w-[120px]">{locationName.split(',')[0]}</span>
          </div>
          <span className="text-xs font-mono text-white/80 dir-ltr block tracking-wide">
            {formatGregorianDate(data.date.timestamp)}
          </span>
        </div>
      </div>
      
      {/* Precision Warning Banner */}
      {!isPrecise && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-top-2">
           <div className="flex items-start gap-2 max-w-[70%]">
              <Navigation className="text-amber-500 shrink-0 mt-0.5" size={14} />
              <p className="text-[10px] text-amber-100 leading-tight">
                المواقيت الحالية تقريبية بناءً على المدينة. للحصول على أدق النتائج، يرجى تفعيل الموقع الدقيق.
              </p>
           </div>
           <button 
             onClick={onEnableLocation}
             className="bg-amber-500 text-amber-950 text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-amber-400 transition-colors shrink-0"
           >
             تحديد الموقع
           </button>
        </div>
      )}

      {/* Hero Countdown - Compact */}
      <div className="relative overflow-hidden rounded-[1.5rem] p-4 text-center text-white shadow-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl group -mt-1">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-[9px] text-emerald-200 font-bold mb-1.5 flex items-center gap-1.5 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
             <Clock size={9} />
             الصلاة القادمة
          </h2>
          <h1 className="text-4xl font-bold mb-2 text-white font-quran drop-shadow-lg leading-tight">{nextPrayer}</h1>
          <div className="bg-black/30 px-5 py-1.5 rounded-lg border border-white/10 backdrop-blur-md shadow-inner">
            <span className="text-2xl font-mono font-bold text-emerald-300 tracking-wider shadow-emerald-500/20 drop-shadow-sm">{timeLeft}</span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-2 opacity-60 bg-black/20 px-2.5 py-0.5 rounded-full border border-white/5">
              <span className="text-[9px] text-slate-400">الوقت الآن</span>
              <span className="text-[10px] font-mono font-bold text-slate-200 dir-ltr">
                  {currentTime}
              </span>
          </div>
        </div>
      </div>

      {/* Enhanced Quran Tracker Widget - Compact & Clickable - MOVED HERE */}
      <div 
        onClick={onOpenQuran}
        className="bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 relative overflow-hidden cursor-pointer hover:border-emerald-500/30 transition-all active:scale-[0.99] group"
      >
         {/* Background Decoration */}
         <div className="absolute right-0 top-0 opacity-5 -translate-y-1/4 translate-x-1/4">
             <BookOpen size={80} />
         </div>
         
         {/* Hint Icon */}
         <div className="absolute top-2 left-2 text-emerald-500/50 group-hover:text-emerald-400 transition-colors">
            <Navigation size={12} className="-rotate-90" />
         </div>

         <div className="flex justify-between items-end relative z-10">
            <div>
                <h3 className="text-emerald-400 font-bold text-xs mb-1 flex items-center gap-1.5">
                    <BookOpen size={14} />
                    ختمة القرآن
                </h3>
                <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-bold text-white font-mono tracking-tighter">{quranProgress.currentPage}</span>
                    <span className="text-[10px] text-slate-400 font-bold">/ 604</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-0.5">
                   {remainingPages > 0 ? `باقي ${remainingPages} صفحة` : 'ما شاء الله!'}
                </p>
            </div>

            <div className="flex flex-col items-end gap-2">
                 {/* Streak Badge */}
                 <div className="flex items-center gap-1 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/20">
                     <Flame size={10} className="text-orange-500 fill-orange-500" />
                     <span className="text-[9px] font-bold text-orange-200">{quranProgress.streak} يوم</span>
                 </div>

                 {/* Circular Progress */}
                 <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${quranPercentage}, 100`} className="drop-shadow-[0_0_2px_#10b981]" />
                    </svg>
                    <span className="absolute text-[9px] font-bold text-white">{quranPercentage}%</span>
                 </div>
            </div>
         </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenQibla}
          className="bg-indigo-900/40 border border-indigo-500/20 hover:bg-indigo-900/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group backdrop-blur-sm"
        >
           <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-lg">
             <Compass size={20} />
           </div>
           <span className="text-sm font-bold text-indigo-100">القبلة</span>
        </button>

        <button
          onClick={onOpenJournal}
          className="bg-rose-900/40 border border-rose-500/20 hover:bg-rose-900/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group backdrop-blur-sm"
        >
           <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors shadow-lg">
             <PenTool size={20} />
           </div>
           <span className="text-sm font-bold text-rose-100">خواطري</span>
        </button>

        <button
          onClick={onOpenHadith}
          className="bg-amber-900/40 border border-amber-500/20 hover:bg-amber-900/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group backdrop-blur-sm"
        >
           <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-lg">
             <Scroll size={20} />
           </div>
           <span className="text-sm font-bold text-amber-100">الحديث</span>
        </button>

        <button
          onClick={onOpenTasbih}
          className="bg-emerald-900/40 border border-emerald-500/20 hover:bg-emerald-900/60 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 group backdrop-blur-sm"
        >
           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors shadow-lg">
             <Hash size={20} />
           </div>
           <span className="text-sm font-bold text-emerald-100">المسبحة</span>
        </button>
      </div>

      {/* Eid Notification Card - Compact */}
      {eidGreeting && (
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg animate-in slide-in-from-top-5 duration-700">
           <div className="absolute top-0 right-0 p-2 opacity-10">
              <Gift size={60} />
           </div>
           <div className="relative z-10 text-center">
              <h2 className="text-2xl font-bold font-quran mb-1">{eidGreeting}</h2>
              <p className="text-xs opacity-90 font-quran">تقبل الله منا ومنكم صالح الأعمال</p>
           </div>
        </div>
      )}

      {/* Daily Wisdom (Hadith) - Compact */}
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/20 bg-gradient-to-b from-amber-900/10 to-transparent relative group">
         <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border border-amber-500/30 px-1.5 py-0.5 rounded-md bg-amber-500/10 flex items-center gap-1">
                    <Star size={8} className="fill-amber-400" />
                    حديث اليوم
                </span>
            </div>
            <button 
                onClick={() => setShareItem(dailyWisdom)}
                className="text-white/40 hover:text-white transition-colors"
            >
                <Share2 size={14} />
            </button>
         </div>
         <div className="mb-1">
            <p className="text-base text-white font-quran leading-loose text-center drop-shadow-sm dir-rtl">
               "{dailyWisdom.text}"
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 opacity-60">
                <div className="h-px w-6 bg-amber-200/50"></div>
                <p className="text-[9px] text-amber-100">{dailyWisdom.narrator || dailyWisdom.source}</p>
                <div className="h-px w-6 bg-amber-200/50"></div>
            </div>
         </div>
      </div>

      {/* Featured Dua (Ramadan) - Compact */}
      <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-r from-emerald-900/10 to-transparent relative group">
         <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
            <Star size={60} />
         </div>
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest border border-emerald-500/30 px-1.5 py-0.5 rounded-md bg-emerald-500/10">ذكر اليوم</span>
                </div>
                <button 
                    onClick={() => setShareItem({ ...featuredDua, category: 'ذكر اليوم' })}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    <Share2 size={14} />
                </button>
            </div>
            <p className="text-lg text-white font-quran leading-relaxed text-right drop-shadow-sm">
               "{featuredDua.arabic}"
            </p>
            <p className="text-[9px] text-slate-400 mt-1 text-left">{featuredDua.source}</p>
         </div>
      </div>

      {/* Simple Prayer List - Compact */}
      <div className="space-y-2 pt-1">
        {prayers.map((p) => {
          const isNext = p.ar === nextPrayer;
          const [h, m] = p.time.split(':');
          const displayTime = parseInt(h) > 12 ? `${parseInt(h) - 12}:${m}` : p.time;
          const suffix = parseInt(h) >= 12 ? 'م' : 'ص';
          
          return (
            <div 
              key={p.en}
              className={`flex items-center justify-between p-3 px-4 rounded-xl transition-all duration-300 ${
                isNext 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 scale-[1.01] border border-emerald-400/20' 
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <p.icon size={16} className={isNext ? 'text-emerald-100' : 'text-slate-500'} />
                <span className={`text-lg font-quran ${isNext ? 'font-bold' : ''}`}>{p.ar}</span>
              </div>
              <div className="flex items-baseline gap-1 dir-ltr">
                 <span className={`text-lg font-mono ${isNext ? 'font-bold' : ''}`}>{displayTime}</span>
                 <span className={`text-xs font-bold ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{suffix}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
