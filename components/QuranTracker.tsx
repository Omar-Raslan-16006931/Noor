import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { QuranProgress } from '../types';
import { BookOpen, ChevronRight, ChevronLeft, Eye, Star, Flame, Trophy } from 'lucide-react';
import { QuranReader } from './QuranReader';
import { DUAS_LIBRARY } from '../data/staticContent';

export const QuranTracker: React.FC = () => {
  const [progress, setProgress] = useState<QuranProgress>(storageService.getQuranProgress());
  const [isReading, setIsReading] = useState(false);
  const [dailyDua, setDailyDua] = useState(DUAS_LIBRARY[0]);
  const TOTAL_PAGES = 604;
  const RAMADAN_DAYS = 30;

  useEffect(() => {
    setProgress(storageService.getQuranProgress());
    
    // Select daily dua based on date
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    const index = dayOfYear % DUAS_LIBRARY.length;
    setDailyDua(DUAS_LIBRARY[index]);
  }, []);

  const updatePage = (newPage: number, surah?: number, ayah?: number) => {
    if (newPage < 1 || newPage > TOTAL_PAGES) return;
    
    const currentProgress = storageService.getQuranProgress();
    
    const updated = {
      ...currentProgress,
      currentPage: newPage,
      lastSurah: surah || currentProgress.lastSurah,
      lastAyah: ayah || currentProgress.lastAyah,
    };
    
    const saved = storageService.saveQuranProgress(updated);
    setProgress(saved);
  };

  const updateGoal = (goal: number) => {
    const updated = { ...progress, khatamGoal: goal };
    localStorage.setItem('noor_quran_progress', JSON.stringify(updated));
    setProgress(updated);
  };

  const totalPagesGoal = TOTAL_PAGES * progress.khatamGoal;
  const percentage = Math.min(100, Math.round((progress.currentPage / totalPagesGoal) * 100));
  const pagesPerDay = Math.ceil(TOTAL_PAGES / RAMADAN_DAYS) * progress.khatamGoal;
  const remainingPages = totalPagesGoal - progress.currentPage;

  return (
    <div className="pb-24 pt-4 space-y-5 px-4">
      {isReading && (
         <QuranReader 
            page={progress.currentPage === 0 ? 1 : progress.currentPage} 
            onPageChange={updatePage} 
            onClose={() => setIsReading(false)} 
         />
      )}

      {/* Header & Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-bold text-white font-quran">ختمة رمضان</h2>
           <BookOpen size={18} className="text-emerald-500" />
        </div>
        
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
           <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
           <span className="text-xs font-bold text-orange-200">{progress.streak} أيام متتالية</span>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="glass-panel rounded-2xl p-4 bg-white/5">
        <p className="text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-wider">هدفي في رمضان</p>
        <div className="flex gap-2">
           {[1, 2, 3].map(g => (
             <button
               key={g}
               onClick={() => updateGoal(g)}
               className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 font-quran ${
                 progress.khatamGoal === g 
                   ? 'bg-emerald-600 text-white shadow-lg' 
                   : 'bg-white/5 text-slate-400 hover:bg-white/10'
               }`}
             >
               {g === 1 ? 'ختمة واحدة' : g === 2 ? 'ختمتين' : '3 ختمات'}
               {progress.khatamGoal === g && <Trophy size={12} />}
             </button>
           ))}
        </div>
      </div>

      {/* Reading Controls Card */}
      <div className="glass-panel rounded-[2rem] p-6 border border-white/10 relative overflow-hidden group bg-gradient-to-br from-white/10 to-transparent">
         <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
         
         <div className="text-center mb-6 relative z-10">
           <p className="text-slate-400 text-xs mb-4 font-bold tracking-wider uppercase">متابعة القراءة من الصفحة</p>
           <div className="flex items-center justify-center gap-4">
             <button 
               onClick={() => updatePage(progress.currentPage - 1)}
               className="p-3 bg-white/5 rounded-full hover:bg-white/10 active:scale-95 transition-colors border border-white/5"
             >
               <ChevronRight size={20} className="text-slate-300" />
             </button>
             
             <button 
               onClick={() => setIsReading(true)}
               className="w-32 py-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all group flex flex-col items-center justify-center gap-1 shadow-lg backdrop-blur-sm"
             >
               <span className="text-4xl font-bold font-mono tracking-tighter">{progress.currentPage}</span>
               <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest opacity-70">
                 <span>اقرأ الآن</span>
                 <Eye size={10} />
               </div>
             </button>

             <button 
               onClick={() => updatePage(progress.currentPage + 1)}
               className="p-3 bg-emerald-600 rounded-full hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/50 transition-colors"
             >
               <ChevronLeft size={20} className="text-white" />
             </button>
           </div>
         </div>

         <div className="flex gap-3 mt-4 relative z-10">
            <div className="flex-1 bg-black/20 rounded-2xl p-3 text-center border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] text-slate-400 mb-1">المتبقي</p>
              <p className="text-xl font-mono font-bold text-white leading-none">{remainingPages}</p>
            </div>
            <div className="flex-1 bg-black/20 rounded-2xl p-3 text-center border border-white/5 backdrop-blur-sm">
              <p className="text-[10px] text-slate-400 mb-1">الإنجاز</p>
              <p className="text-xl font-mono font-bold text-emerald-400 leading-none">{percentage}%</p>
            </div>
         </div>
      </div>

      {/* Duaa of the Day */}
      <div className="rounded-3xl p-6 border border-amber-500/20 relative group overflow-hidden bg-gradient-to-r from-amber-900/10 to-transparent">
         <h3 className="text-amber-400 text-xs font-bold mb-3 flex items-center justify-center gap-2 relative z-10 uppercase tracking-widest">
            <Star size={12} className="fill-amber-400" />
            دعاء اليوم
            <Star size={12} className="fill-amber-400" />
         </h3>
         <p className="text-xl text-white font-quran leading-[2.2] text-center mb-3 relative z-10">
            "{dailyDua.arabic}"
         </p>
         <div className="text-center text-slate-500 text-xs relative z-10 font-quran opacity-70">
            {dailyDua.source}
         </div>
      </div>
    </div>
  );
};
