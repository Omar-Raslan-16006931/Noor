import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { QuranProgress } from '../types';
import { BookOpen, Award, CheckCircle2, ChevronRight, ChevronLeft, Eye, Star, Flame, Trophy } from 'lucide-react';
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
    
    // storageService.saveQuranProgress handles the date update and streak logic internally
    const saved = storageService.saveQuranProgress(updated);
    setProgress(saved);
  };

  const updateGoal = (goal: number) => {
    const updated = { ...progress, khatamGoal: goal };
    // Just save goal, don't mess with date/streak yet unless they read
    localStorage.setItem('noor_quran_progress', JSON.stringify(updated));
    setProgress(updated);
  };

  // Calculations
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
           <h2 className="text-xl font-bold text-white font-serif">ختمة رمضان</h2>
           <BookOpen size={18} className="text-emerald-500" />
        </div>
        
        <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
           <Flame size={14} className="text-orange-500 fill-orange-500 animate-pulse" />
           <span className="text-xs font-bold text-orange-200">{progress.streak} أيام متتالية</span>
        </div>
      </div>

      {/* Goal Selector */}
      <div className="glass-panel rounded-2xl p-3">
        <p className="text-[10px] text-slate-400 mb-2 font-bold">هدفي في رمضان</p>
        <div className="flex gap-2">
           {[1, 2, 3].map(g => (
             <button
               key={g}
               onClick={() => updateGoal(g)}
               className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                 progress.khatamGoal === g 
                   ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' 
                   : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
               }`}
             >
               {g === 1 ? 'ختمة' : g === 2 ? 'ختمتين' : '3 ختمات'}
               {progress.khatamGoal === g && <Trophy size={12} />}
             </button>
           ))}
        </div>
      </div>

      {/* Reading Controls Card */}
      <div className="glass-card rounded-3xl p-5 border border-emerald-500/20 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
         
         {/* Circular Progress (Smaller) */}
         <div className="absolute -right-6 -top-6 w-24 h-24 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 36 36">
               <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="4" />
            </svg>
         </div>

         <div className="text-center mb-4 relative z-10">
           <p className="text-slate-400 text-xs mb-3">متابعة القراءة من الصفحة</p>
           <div className="flex items-center justify-center gap-3">
             <button 
               onClick={() => updatePage(progress.currentPage - 1)}
               className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 active:scale-95 transition-colors"
             >
               <ChevronRight size={18} className="text-slate-300" />
             </button>
             
             <button 
               onClick={() => setIsReading(true)}
               className="w-24 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-xl text-emerald-400 font-bold hover:bg-emerald-600 hover:text-white transition-all group flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
             >
               <span className="text-xl font-serif pt-1">{progress.currentPage}</span>
               <Eye size={14} />
             </button>

             <button 
               onClick={() => updatePage(progress.currentPage + 1)}
               className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-900/50 transition-colors"
             >
               <ChevronLeft size={18} className="text-white" />
             </button>
           </div>
         </div>

         <div className="flex gap-2 mt-4 relative z-10">
            <div className="flex-1 bg-slate-900/60 rounded-xl p-2 text-center border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">المتبقي</p>
              <p className="text-lg font-bold text-emerald-400 leading-none">{remainingPages}</p>
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-xl p-2 text-center border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">الإنجاز</p>
              <p className="text-lg font-bold text-amber-400 leading-none">{percentage}%</p>
            </div>
            <div className="flex-1 bg-slate-900/60 rounded-xl p-2 text-center border border-white/5">
              <p className="text-[10px] text-slate-500 mb-0.5">الورد</p>
              <p className="text-lg font-bold text-blue-400 leading-none">{pagesPerDay}</p>
            </div>
         </div>
      </div>

      {/* Duaa of the Day */}
      <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 rounded-2xl p-4 border border-amber-500/20 relative group overflow-hidden">
         <div className="absolute -right-4 -top-4 bg-amber-500/10 w-20 h-20 rounded-full blur-xl"></div>
         <h3 className="text-amber-400 text-xs font-bold mb-2 flex items-center gap-1.5 relative z-10">
            <Star size={12} className="fill-amber-400" />
            دعاء اليوم
            <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/20">
               {dailyDua.category}
            </span>
         </h3>
         <p className="text-base text-white font-serif leading-loose text-center mb-2 relative z-10">
            "{dailyDua.arabic}"
         </p>
         <div className="text-center text-slate-500 text-[10px] relative z-10">
            {dailyDua.source}
         </div>
      </div>
    </div>
  );
};
