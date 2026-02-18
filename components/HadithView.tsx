import React, { useState } from 'react';
import { TRUSTED_HADITHS, DUAS_LIBRARY } from '../data/staticContent';
import { Scroll, Quote, Share2, Copy, Heart, Sparkles } from 'lucide-react';
import { Hadith, Dua } from '../types';

type ViewMode = 'HADITH' | 'DUA';

export const HadithView: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('HADITH');
  const [filter, setFilter] = useState<string>('All');
  
  const hadithCategories = ['All', 'Fasting', 'Prayer', 'Charity', 'Character'];
  const duaCategories = ['All', 'Ramadan 1-10', 'Ramadan 11-20', 'Ramadan 21-30', 'Quran', 'Daily', 'Forgiveness'];

  const getDisplayedContent = () => {
    if (mode === 'HADITH') {
        return filter === 'All' ? TRUSTED_HADITHS : TRUSTED_HADITHS.filter(h => h.category === filter);
    } else {
        return filter === 'All' ? DUAS_LIBRARY : DUAS_LIBRARY.filter(d => d.category === filter);
    }
  };

  const currentCategories = mode === 'HADITH' ? hadithCategories : duaCategories;
  const content = getDisplayedContent();

  return (
    <div className="pb-24 pt-6 space-y-6 px-4">
      {/* Header Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-4">
        <button 
           onClick={() => { setMode('HADITH'); setFilter('All'); }}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'HADITH' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
           <Scroll size={16} />
           نور النبوة
        </button>
        <button 
           onClick={() => { setMode('DUA'); setFilter('All'); }}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'DUA' ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
           <Sparkles size={16} />
           كنوز الدعاء
        </button>
      </div>

      <div className="flex items-center gap-3 mb-2 px-1">
        <div>
          <h2 className="text-2xl font-bold text-white">{mode === 'HADITH' ? 'أحاديث مختارة' : 'أدعية مستجابة'}</h2>
          <p className="text-xs text-slate-400">
             {mode === 'HADITH' ? 'من صحيح السنة النبوية' : 'من القرآن والسنة المطهرة'}
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {currentCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              filter === cat 
                ? (mode === 'DUA' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white')
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {cat === 'All' ? 'الكل' : cat}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {content.map((item) => (
          mode === 'HADITH' 
             ? <HadithCard key={item.id} hadith={item as Hadith} />
             : <DuaCard key={item.id} dua={item as Dua} />
        ))}
      </div>
    </div>
  );
};

const HadithCard: React.FC<{ hadith: Hadith }> = ({ hadith }) => {
  return (
    <div className="glass-card p-6 rounded-2xl relative group hover:bg-slate-800/80 transition-colors border-r-2 border-amber-500/50">
       <Quote className="absolute top-4 right-4 text-amber-500/20 w-8 h-8 rotate-180" />
       
       <div className="mb-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
             {hadith.category === 'Fasting' ? 'عن الصيام' : hadith.category}
          </span>
       </div>

       <p className="text-lg text-white font-serif leading-loose mb-6 text-center">
         "{hadith.text}"
       </p>

       <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
          <div className="flex flex-col">
             <span className="text-xs text-slate-300 font-bold">{hadith.narrator}</span>
             <span className="text-[10px] text-slate-500 mt-0.5">{hadith.source}</span>
          </div>
          <ActionButtons />
       </div>
    </div>
  );
};

const DuaCard: React.FC<{ dua: Dua }> = ({ dua }) => {
    return (
      <div className="glass-card p-6 rounded-2xl relative group hover:bg-slate-800/80 transition-colors border-r-2 border-emerald-500/50">
         <Sparkles className="absolute top-4 right-4 text-emerald-500/20 w-6 h-6" />
         
         <div className="mb-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
               {dua.category}
            </span>
         </div>
  
         <p className="text-xl text-white font-serif leading-loose mb-4 text-center">
           "{dua.arabic}"
         </p>
         
         {dua.translation && (
            <p className="text-sm text-slate-400 text-center mb-4">{dua.translation}</p>
         )}
  
         <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
            <span className="text-[10px] text-emerald-500/70">{dua.source}</span>
            <ActionButtons />
         </div>
      </div>
    );
  };

const ActionButtons = () => (
    <div className="flex gap-2 opacity-60">
        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors" title="نسخ">
        <Copy size={14} className="text-slate-300" />
        </button>
        <button className="p-2 hover:bg-slate-700 rounded-full transition-colors" title="مشاركة">
        <Share2 size={14} className="text-slate-300" />
        </button>
    </div>
);
