import React, { useState } from 'react';
import { TRUSTED_HADITHS, DUAS_LIBRARY } from '../data/staticContent';
import { Scroll, Quote, Share2, Copy, Sparkles } from 'lucide-react';
import { Hadith, Dua } from '../types';
import { ShareModal } from './ShareModal';

type ViewMode = 'HADITH' | 'DUA';

export const HadithView: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('HADITH');
  const [filter, setFilter] = useState<string>('All');
  const [shareItem, setShareItem] = useState<Hadith | Dua | null>(null);
  
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
      <ShareModal item={shareItem} onClose={() => setShareItem(null)} />

      {/* Minimal Tabs */}
      <div className="flex bg-black/20 p-1 rounded-2xl mb-4 backdrop-blur-sm sticky top-0 z-10 border border-white/5">
        <button 
           onClick={() => { setMode('HADITH'); setFilter('All'); }}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'HADITH' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
           <Scroll size={16} />
           نور النبوة
        </button>
        <button 
           onClick={() => { setMode('DUA'); setFilter('All'); }}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'DUA' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
           <Sparkles size={16} />
           كنوز الدعاء
        </button>
      </div>

      {/* Categories Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {currentCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
              filter === cat 
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-slate-300 border-white/10 hover:border-white/30'
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
             ? <HadithCard key={item.id} hadith={item as Hadith} onShare={() => setShareItem(item)} />
             : <DuaCard key={item.id} dua={item as Dua} onShare={() => setShareItem(item)} />
        ))}
      </div>
    </div>
  );
};

const HadithCard: React.FC<{ hadith: Hadith, onShare: () => void }> = ({ hadith, onShare }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl relative group transition-colors border border-white/5 bg-white/5">
       <Quote className="absolute top-6 right-6 text-white/10 w-8 h-8 rotate-180" />
       
       <div className="mb-6">
          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md">
             {hadith.category === 'Fasting' ? 'عن الصيام' : hadith.category}
          </span>
       </div>

       <p className="text-xl sm:text-2xl text-white font-quran leading-[2.2] mb-6 text-center drop-shadow-sm">
         "{hadith.text}"
       </p>

       <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex flex-col">
             <span className="text-sm text-emerald-400 font-bold font-quran">{hadith.narrator}</span>
             <span className="text-[10px] text-slate-500 mt-0.5">{hadith.source}</span>
          </div>
          <ActionButtons onShare={onShare} />
       </div>
    </div>
  );
};

const DuaCard: React.FC<{ dua: Dua, onShare: () => void }> = ({ dua, onShare }) => {
    return (
      <div className="glass-panel p-6 rounded-3xl relative group transition-colors border border-white/5 bg-white/5">
         
         <div className="mb-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md">
               {dua.category}
            </span>
         </div>
  
         <p className="text-xl sm:text-2xl text-white font-quran leading-[2.2] mb-4 text-center drop-shadow-sm">
           "{dua.arabic}"
         </p>
         
         {dua.translation && (
            <p className="text-sm text-slate-400 text-center mb-6 font-serif italic">{dua.translation}</p>
         )}
  
         <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-xs text-slate-500 font-quran">{dua.source}</span>
            <ActionButtons onShare={onShare} />
         </div>
      </div>
    );
  };

const ActionButtons = ({ onShare }: { onShare: () => void }) => (
    <div className="flex gap-2 opacity-70 hover:opacity-100 transition-opacity">
        <button 
            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
            onClick={(e) => {
                e.preventDefault();
                // Copy text logic could be added here
            }}
            title="نسخ النص"
        >
            <Copy size={16} className="text-white" />
        </button>
        <button 
            onClick={onShare} 
            className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-full transition-all active:scale-95 border border-emerald-500/20"
            title="مشاركة صورة"
        >
            <Share2 size={16} />
        </button>
    </div>
);
