
import React, { useState, useEffect } from 'react';
import { DUAS_LIBRARY } from '../data/staticContent';
import { hadithApi } from '../services/hadithApi';
import { Scroll, Quote, Share2, Copy, Sparkles, Loader2, Book, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { Hadith, Dua } from '../types';
import { ShareModal } from './ShareModal';

type ViewMode = 'HADITH' | 'DUA';

export const HadithView: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('HADITH');
  const [shareItem, setShareItem] = useState<Hadith | Dua | null>(null);
  
  // Hadith State
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Dua State
  const [duaFilter, setDuaFilter] = useState('All');
  const duaCategories = ['All', ...Array.from(new Set(DUAS_LIBRARY.map(d => d.category)))];

  // Fetch Hadiths
  useEffect(() => {
    if (mode === 'HADITH') {
      fetchHadiths(page);
    }
  }, [mode, page]);

  const fetchHadiths = async (pageNum: number) => {
    setLoadingHadiths(true);
    const result = await hadithApi.getHadiths('sahih-bukhari', pageNum);
    setHadiths(result.data);
    setLoadingHadiths(false);
    // Simple check: if we got less than expected or API meta says so
    if (result.data.length === 0) setHasMore(false);
  };

  const getDisplayedDuas = () => {
    return duaFilter === 'All' ? DUAS_LIBRARY : DUAS_LIBRARY.filter(d => d.category === duaFilter);
  };

  return (
    <div className="pb-24 pt-6 space-y-6 px-4">
      <ShareModal item={shareItem} onClose={() => setShareItem(null)} />

      {/* Minimal Tabs */}
      <div className="flex bg-black/20 p-1 rounded-2xl mb-4 backdrop-blur-sm sticky top-0 z-10 border border-white/5 shadow-lg">
        <button 
           onClick={() => setMode('HADITH')}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'HADITH' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
           <Scroll size={16} />
           صحيح البخاري
        </button>
        <button 
           onClick={() => setMode('DUA')}
           className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${mode === 'DUA' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
           <Sparkles size={16} />
           حصن المسلم
        </button>
      </div>

      {/* Categories Chips (Only for Duas) */}
      {mode === 'DUA' && (
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          {duaCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setDuaFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                duaFilter === cat 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              {cat === 'All' ? 'الكل' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="space-y-5">
        {mode === 'HADITH' ? (
          <>
            {loadingHadiths && hadiths.length === 0 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : (
              hadiths.map((item) => (
                <HadithCard key={item.id} hadith={item} onShare={() => setShareItem(item)} />
              ))
            )}
            
            {/* Pagination */}
            {!loadingHadiths && (
              <div className="flex justify-between items-center pt-4 px-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 bg-white/5 rounded-full disabled:opacity-30 hover:bg-white/10 text-white border border-white/5 transition-all active:scale-95"
                >
                  <ChevronRight size={24} />
                </button>
                <span className="text-slate-400 font-mono text-sm bg-black/20 px-4 py-1 rounded-full border border-white/5">صفحة {page}</span>
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasMore}
                  className="p-3 bg-white/5 rounded-full disabled:opacity-30 hover:bg-white/10 text-white border border-white/5 transition-all active:scale-95"
                >
                  <ChevronLeft size={24} />
                </button>
              </div>
            )}
          </>
        ) : (
          getDisplayedDuas().map((item) => (
            <DuaCard key={item.id} dua={item} onShare={() => setShareItem(item)} />
          ))
        )}
      </div>
    </div>
  );
};

const HadithCard: React.FC<{ hadith: Hadith, onShare: () => void }> = ({ hadith, onShare }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-transparent relative group transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-900/10">
       {/* Decorative Icon Background */}
       <div className="absolute -right-6 -top-6 opacity-5 rotate-12 transition-transform group-hover:rotate-6 pointer-events-none">
          <Book size={100} />
       </div>

       <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
             <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg bg-amber-500/10 shadow-sm backdrop-blur-sm">
                {hadith.source}
             </span>
             <span className="text-[10px] text-slate-500 font-mono bg-black/20 px-2 py-1 rounded-lg border border-white/5">
                #{hadith.hadithNumber}
             </span>
          </div>

          <div className="mb-6 px-2">
             <Quote size={20} className="text-amber-500/40 mb-2 rotate-180 ml-auto" />
             <p className="text-xl sm:text-2xl text-white font-quran leading-[2.4] text-center drop-shadow-sm dir-rtl px-2">
               {hadith.text}
             </p>
             <Quote size={20} className="text-amber-500/40 mt-2 mr-auto" />
          </div>
          
          {hadith.english && (
             <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6 backdrop-blur-sm">
               <p className="text-sm text-slate-400 italic font-serif opacity-90 leading-relaxed text-center">
                  "{hadith.english}"
               </p>
             </div>
          )}

          <div className="flex items-center justify-between border-t border-amber-500/20 pt-4 mt-2">
             <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                   <span className="text-sm text-amber-200 font-bold font-quran">{hadith.narrator || 'حديث شريف'}</span>
                </div>
                {hadith.chapter && <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{hadith.chapter}</span>}
             </div>
             <ActionButtons onShare={onShare} colorClass="amber" />
          </div>
       </div>
    </div>
  );
};

const DuaCard: React.FC<{ dua: Dua, onShare: () => void }> = ({ dua, onShare }) => {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-900/20 to-transparent relative group transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-900/10">
         {/* Decorative Icon Background */}
         <div className="absolute -right-6 -top-6 opacity-5 rotate-12 transition-transform group-hover:rotate-6 pointer-events-none">
            <Sparkles size={100} />
         </div>
  
         <div className="relative z-10">
            <div className="mb-6 flex justify-center">
               <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/10 shadow-sm backdrop-blur-sm flex items-center gap-2">
                  <Star size={10} className="fill-emerald-400" />
                  {dua.category}
                  <Star size={10} className="fill-emerald-400" />
               </span>
            </div>
    
            <div className="mb-8">
               <p className="text-2xl sm:text-3xl text-white font-quran leading-[2.4] text-center drop-shadow-sm dir-rtl">
                 {dua.arabic}
               </p>
            </div>
           
            <div className="flex items-center justify-between border-t border-emerald-500/20 pt-4">
               <span className="text-xs text-slate-500 font-quran bg-black/20 px-3 py-1 rounded-full border border-white/5">
                  {dua.source}
               </span>
               <ActionButtons onShare={onShare} colorClass="emerald" />
            </div>
         </div>
      </div>
    );
  };

const ActionButtons = ({ onShare, colorClass }: { onShare: () => void, colorClass: 'amber' | 'emerald' }) => (
    <div className="flex gap-2">
        <button 
            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95 group/btn"
            onClick={(e) => {
                e.preventDefault();
                // Copy logic could go here
                alert('تم نسخ النص');
            }}
            title="نسخ النص"
        >
            <Copy size={18} className="text-slate-400 group-hover/btn:text-white transition-colors" />
        </button>
        <button 
            onClick={onShare} 
            className={`p-2 rounded-full transition-all active:scale-95 border ${
                colorClass === 'amber' 
                ? 'bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border-amber-500/30' 
                : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30'
            }`}
            title="مشاركة صورة"
        >
            <Share2 size={18} />
        </button>
    </div>
);
