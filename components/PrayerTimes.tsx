import React, { useState, useEffect } from 'react';
import { PrayerData } from '../types';
import { MapPin, Moon, Sun, Sunrise, Sunset, Star, Clock, Calendar } from 'lucide-react';
import { RAMADAN_DUAS } from '../data/staticContent';

interface PrayerTimesProps {
  data: PrayerData | null;
  locationName: string;
}

export const PrayerTimesView: React.FC<PrayerTimesProps> = ({ data, locationName }) => {
  const [nextPrayer, setNextPrayer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [featuredDua] = useState(RAMADAN_DUAS[0]);

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
        // Next is Fajr tomorrow
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

  if (!data) return <div className="text-center p-10 animate-pulse text-white text-sm">جاري تحميل البيانات...</div>;

  const isRamadan = data.date.hijri.month.number === 9;

  // Helper to add minutes to HH:MM time
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
        time: addMinutes(data.timings.Isha, 20) // Est. 20 mins after Isha
    });
  }

  return (
    <div className="space-y-6 pb-28 pt-4 px-2">
      {/* Spacious Date Header */}
      <div className="flex justify-between items-end px-2 text-white drop-shadow-md">
        <div className="flex flex-col">
          <span className="text-4xl font-bold font-serif">{data.date.hijri.day} {data.date.hijri.month.ar}</span>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-sm opacity-90 font-bold tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded">
                {data.date.hijri.year} هـ
             </span>
             {isRamadan && (
                <span className="bg-amber-500/90 text-black text-xs font-bold px-3 py-0.5 rounded-full shadow-lg shadow-amber-500/40 animate-pulse">
                   رمضان مبارك
                </span>
             )}
          </div>
        </div>
        <div className="text-left bg-slate-900/40 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
          <div className="flex items-center gap-1.5 text-emerald-300 justify-end text-xs mb-1">
            <MapPin size={12} />
            <span>{locationName.split(',')[0]}</span>
          </div>
          <span className="text-sm font-mono text-white/80 dir-ltr block tracking-wide">{data.date.readable}</span>
        </div>
      </div>

      {/* Spacious Hero Countdown */}
      <div className="relative overflow-hidden rounded-[2.5rem] p-8 text-center text-white shadow-2xl border border-white/10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-lg text-emerald-200 font-medium mb-2 drop-shadow flex items-center gap-2">
             <Clock size={18} />
             الصلاة القادمة
          </h2>
          <h1 className="text-6xl font-bold mb-4 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] font-serif py-2">{nextPrayer}</h1>
          
          <div className="bg-black/30 px-8 py-3 rounded-2xl border border-white/10 backdrop-blur-xl shadow-inner">
            <span className="text-5xl font-mono font-bold text-amber-300 tracking-widest drop-shadow-md">{timeLeft}</span>
          </div>
        </div>
      </div>

      {/* Spacious Prayer List */}
      <div className="grid grid-cols-1 gap-3">
        {prayers.map((p) => {
          const isNext = p.ar === nextPrayer;
          const [h, m] = p.time.split(':');
          const displayTime = parseInt(h) > 12 ? `${parseInt(h) - 12}:${m}` : p.time;
          const suffix = parseInt(h) >= 12 ? 'م' : 'ص';
          
          return (
            <div 
              key={p.en}
              className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group ${
                isNext 
                  ? 'bg-gradient-to-r from-emerald-800/90 to-emerald-600/90 text-white shadow-xl border border-emerald-400/40 scale-[1.02]' 
                  : 'bg-slate-900/50 text-slate-200 border border-white/5 hover:bg-slate-800/70 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${isNext ? 'bg-white/20' : 'bg-slate-800'}`}>
                   <p.icon size={24} className={isNext ? 'text-white' : 'text-slate-400'} />
                </div>
                <span className={`text-xl ${isNext ? 'font-bold' : 'font-medium'}`}>{p.ar}</span>
              </div>
              
              <div className="flex items-baseline gap-2 dir-ltr">
                 <span className={`text-2xl font-mono ${isNext ? 'font-bold' : ''}`}>{displayTime}</span>
                 <span className={`text-sm ${isNext ? 'text-emerald-200' : 'text-slate-500'}`}>{suffix}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4">
         <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center bg-indigo-900/30 border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2 text-indigo-300">
               <Moon size={16} />
               <span className="text-sm font-bold">منتصف الليل</span>
            </div>
            <span className="text-xl font-mono text-white font-bold">{parseInt(data.timings.Midnight.split(':')[0]) > 12 ? `${parseInt(data.timings.Midnight.split(':')[0]) - 12}:${data.timings.Midnight.split(':')[1]}` : data.timings.Midnight}</span>
         </div>
         
         <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center bg-purple-900/30 border-purple-500/20">
            <div className="flex items-center gap-2 mb-2 text-purple-300">
               <Star size={16} />
               <span className="text-sm font-bold">وقت القيام</span>
            </div>
            <span className="text-xl font-mono text-white font-bold">{data.timings.Imsak}</span>
         </div>
      </div>

      {/* Featured Dua */}
      <div className="glass-panel rounded-2xl p-6 border-r-4 border-r-amber-400 relative overflow-hidden mt-2 bg-gradient-to-l from-amber-900/20 to-transparent">
         <div className="flex items-center gap-2 text-amber-300 text-xs font-bold mb-3">
           <Star size={14} className="fill-amber-300" />
           {featuredDua.title}
         </div>
         <p className="text-xl text-white font-serif leading-loose text-center">
           "{featuredDua.arabic}"
         </p>
      </div>
    </div>
  );
};
