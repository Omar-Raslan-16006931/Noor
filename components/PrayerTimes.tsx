import React, { useState, useEffect } from 'react';
import { PrayerData, QuranProgress } from '../types';
import { MapPin, Moon, Sun, Sunrise, Sunset, Star, Clock, Gift, BookOpen, ChevronRight, Trophy, Flame, Share2 } from 'lucide-react';
import { RAMADAN_DUAS, TRUSTED_HADITHS } from '../data/staticContent';
import { storageService } from '../services/storage';
import { ShareModal } from './ShareModal';

interface PrayerTimesProps {
  data: PrayerData | null;
  locationName: string;
}

export const PrayerTimesView: React.FC<PrayerTimesProps> = ({ data, locationName }) => {
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [dailyWisdom, setDailyWisdom] = useState(TRUSTED_HADITHS[0]);
  const [featuredDua] = useState(RAMADAN_DUAS[0]);
  const [quranProgress, setQuranProgress] = useState<QuranProgress>(storageService.getQuranProgress());
  const [shareItem, setShareItem] = useState<any | null>(null);

  useEffect(() => {
    // Refresh Quran progress whenever component mounts
    setQuranProgress(storageService.getQuranProgress());
    
    // Select daily wisdom based on day of month to rotate content
    const day = new Date().getDate();
    setDailyWisdom(TRUSTED_HADITHS[day % TRUSTED_HADITHS.length]);
  }, []);

  useEffect(() => {
    if (!data) return;

    const calculateNextPrayer = () => {
      const now = new Date();
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

  const addMinutes = (time: string, minsToAdd: number) => {
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minsToAdd);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const prayers = [
    { en: 'Fajr', ar: 'الفجر', icon: Moon, time: data.timings.Fajr },
    { en: 'Sunrise', ar: 'الشروق', icon: Sunrise, time: data.timings.Sunrise },
    { en: 'Dhuhr', ar: 'الظهر', icon: Sun, time: data.timings.Dhuhr },
    { en: 'Asr', ar: 'العصر', icon: Sun, time: data.timings.Asr },
    { en: 'Maghrib', ar: 'المغرب', icon: Sunset, time: data.timings.Maghrib },
    { en: 'Isha', ar: 'العشاء', icon: Moon, time: data.timings.Isha },
  ];

  if (isRamadan) {
    prayers.push({ 
        en: 'Taraweeh', 
        ar: 'التراويح', 
        icon: Star, 
        time: addMinutes(data.timings.Isha, 20) 
    });
  }

  // Calculate Quran Progress Percentage
  const quranPercentage = Math.round((quranProgress.currentPage / 604) * 100);
  const remainingPages = 604 - quranProgress.currentPage;

  return (
    <div className="space-y-6 pb-28 pt-4 px-2">
      <ShareModal item={shareItem} onClose={() => setShareItem(null)} />

      {/* Header */}
      <div className="flex justify-between items-start px-2 text-white">
        <div className="flex flex-col">
          <span className="text-4xl font-bold font-quran">{data.date.hijri.day} {data.date.hijri.month.ar}</span>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-sm opacity-80 font-mono tracking-widest bg-white/10 px-2 py-0.5 rounded-md">
                {data.date.hijri.year} هـ
             </span>
             {isRamadan && <span className="text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">شهر رمضان</span>}
          </div>
        </div>
        <div className="text-left bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/5">
          <div className="flex items-center gap-1.5 text-emerald-300 justify-end text-xs mb-1">
            <MapPin size={12} />
            <span className="font-bold">{locationName.split(',')[0]}</span>
          </div>
          <span className="text-sm font-mono text-white/80 dir-ltr block tracking-wide">{data.date.readable}</span>
        </div>
      </div>

      {/* Hero Countdown */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white shadow-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-xs text-emerald-200 font-bold mb-3 flex items-center gap-2 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/5">
             <Clock size={12} />
             الصلاة القادمة
          </h2>
          <h1 className="text-7xl font-bold mb-4 text-white font-quran drop-shadow-lg leading-tight">{nextPrayer}</h1>
          <div className="bg-black/30 px-8 py-3 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
            <span className="text-4xl font-mono font-bold text-emerald-300 tracking-wider shadow-emerald-500/20 drop-shadow-sm">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Eid Notification Card */}
      {eidGreeting && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-xl animate-in slide-in-from-top-5 duration-700">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Gift size={100} />
           </div>
           <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold font-quran mb-2">{eidGreeting}</h2>
              <p className="text-sm opacity-90 font-quran">تقبل الله منا ومنكم صالح الأعمال</p>
           </div>
        </div>
      )}

      {/* Daily Wisdom (Hadith) */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-amber-900/10 to-transparent relative group">
         <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest border border-amber-500/30 px-2 py-1 rounded-lg bg-amber-500/10 flex items-center gap-1">
                    <Star size={10} className="fill-amber-400" />
                    حديث اليوم
                </span>
            </div>
            <button 
                onClick={() => setShareItem(dailyWisdom)}
                className="text-white/40 hover:text-white transition-colors"
            >
                <Share2 size={16} />
            </button>
         </div>
         <div className="mb-2">
            <p className="text-xl text-white font-quran leading-[2.2] text-center drop-shadow-sm">
               "{dailyWisdom.text}"
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 opacity-60">
                <div className="h-px w-8 bg-amber-200/50"></div>
                <p className="text-[10px] text-amber-100">{dailyWisdom.narrator}</p>
                <div className="h-px w-8 bg-amber-200/50"></div>
            </div>
         </div>
      </div>

      {/* Featured Dua (Ramadan) */}
      <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-gradient-to-r from-emerald-900/10 to-transparent relative group">
         <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
            <Star size={80} />
         </div>
         <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest border border-emerald-500/30 px-2 py-0.5 rounded-md bg-emerald-500/10">ذكر اليوم</span>
                </div>
                <button 
                    onClick={() => setShareItem({ ...featuredDua, category: 'ذكر اليوم' })}
                    className="text-white/40 hover:text-white transition-colors"
                >
                    <Share2 size={16} />
                </button>
            </div>
            <p className="text-xl text-white font-quran leading-relaxed text-right drop-shadow-sm">
               "{featuredDua.arabic}"
            </p>
            <p className="text-[10px] text-slate-400 mt-2 text-left">{featuredDua.title}</p>
         </div>
      </div>

      {/* Enhanced Quran Tracker Widget */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900/40 backdrop-blur-md rounded-3xl p-5 border border-white/5 relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute right-0 top-0 opacity-5 -translate-y-1/4 translate-x-1/4">
             <BookOpen size={120} />
         </div>

         <div className="flex justify-between items-end relative z-10">
            <div>
                <h3 className="text-emerald-400 font-bold text-sm mb-1 flex items-center gap-2">
                    <BookOpen size={16} />
                    ختمة القرآن
                </h3>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-white font-mono tracking-tighter">{quranProgress.currentPage}</span>
                    <span className="text-xs text-slate-400 font-bold">/ 604 صفحة</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                   {remainingPages > 0 ? `باقي ${remainingPages} صفحة` : 'ما شاء الله! أتممت الختمة'}
                </p>
            </div>

            <div className="flex flex-col items-end gap-3">
                 {/* Streak Badge */}
                 <div className="flex items-center gap-1.5 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                     <Flame size={12} className="text-orange-500 fill-orange-500" />
                     <span className="text-[10px] font-bold text-orange-200">{quranProgress.streak} يوم</span>
                 </div>

                 {/* Circular Progress */}
                 <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${quranPercentage}, 100`} className="drop-shadow-[0_0_2px_#10b981]" />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-white">{quranPercentage}%</span>
                 </div>
            </div>
         </div>
      </div>

      {/* Simple Prayer List */}
      <div className="space-y-3 pt-2">
        {prayers.map((p) => {
          const isNext = p.ar === nextPrayer;
          const [h, m] = p.time.split(':');
          const displayTime = parseInt(h) > 12 ? `${parseInt(h) - 12}:${m}` : p.time;
          const suffix = parseInt(h) >= 12 ? 'م' : 'ص';
          
          return (
            <div 
              key={p.en}
              className={`flex items-center justify-between p-4 px-6 rounded-2xl transition-all duration-300 ${
                isNext 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 scale-[1.02] border border-emerald-400/20' 
                  : 'bg-white/5 text-slate-200 hover:bg-white/10 border border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <p.icon size={20} className={isNext ? 'text-emerald-100' : 'text-slate-500'} />
                <span className={`text-xl font-quran ${isNext ? 'font-bold' : ''}`}>{p.ar}</span>
              </div>
              <div className="flex items-baseline gap-1 dir-ltr">
                 <span className={`text-xl font-mono ${isNext ? 'font-bold' : ''}`}>{displayTime}</span>
                 <span className={`text-xs ${isNext ? 'text-emerald-200' : 'text-slate-500'}`}>{suffix}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
