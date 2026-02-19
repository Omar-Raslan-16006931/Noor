import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, 
  BookOpen, Volume2, Play, Pause, Image as ImageIcon, AlertCircle, 
  Layers, Share2, Book, List, Search, Settings2, StopCircle, Check,
  Sun, Moon, CheckSquare, Share
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { SURAH_NAMES, JUZ_START_PAGES, getSurahInfoByPage, getJuzInfoByPage } from '../data/staticContent';
import { ShareModal } from './ShareModal';

interface QuranReaderProps {
  page: number;
  onPageChange: (page: number, surah?: number, ayah?: number) => void;
  onClose: () => void;
}

interface AyahData {
  number: number;
  text: string; // Uthmanic
  audio: string; // Audio URL
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    revelationType: string;
  }
}

export const QuranReader: React.FC<QuranReaderProps> = ({ page, onPageChange, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<'MUSHAF' | 'RECITATION'>('MUSHAF');
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  
  // Audio State
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [isPlayingPage, setIsPlayingPage] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(-1);

  const [showControls, setShowControls] = useState(true);
  const [showIndex, setShowIndex] = useState(false);
  const [indexTab, setIndexTab] = useState<'SURAHS' | 'JUZ'>('SURAHS');
  const [searchQuery, setSearchQuery] = useState('');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  
  // Visual State
  const [isNightMode, setIsNightMode] = useState(() => {
    try {
        return localStorage.getItem('quran_night_mode') === 'true';
    } catch { return false; }
  });

  // Selection & Sharing
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedAyahIndices, setSelectedAyahIndices] = useState<Set<number>>(new Set());
  const [shareItem, setShareItem] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem('quran_night_mode', isNightMode.toString());
  }, [isNightMode]);
  
  // Swipe State (Using refs to avoid re-renders)
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine current Surah/Juz based on page
  const currentSurahStatic = getSurahInfoByPage(page);
  const currentJuz = getJuzInfoByPage(page);

  // Auto-hide controls logic
  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [showControls, page, mode, isSelectionMode]); // Keep controls up if selecting

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    // Disable auto-hide in selection mode
    if (isSelectionMode) return;

    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        // Only auto-hide if audio is NOT playing and NO modal is open
        if (!playingAudio && !showIndex && !isPlayingPage && !shareItem) {
            setShowControls(false);
        }
      }, 4000);
    }
  };

  const toggleControls = () => {
    if (isSelectionMode) return; // Keep controls visible during selection
    setShowControls(prev => !prev);
    resetControlsTimeout();
  };

  // Load Recitation Data
  useEffect(() => {
    // Reset audio and selection on page change
    stopAudio();
    setIsSelectionMode(false);
    setSelectedAyahIndices(new Set());
    
    if (page > 0) {
        fetchPageData();
    } else {
        setAyahs([]);
        setLoading(false);
    }
  }, [page]);

  // Reset loading state when page changes
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [page]);

  const fetchPageData = async () => {
    // Don't fetch for cover page (0)
    if (page === 0) {
        setLoading(false);
        return;
    }

    setLoading(true);
    try {
      // Parallel fetch for speed
      const [audioRes, textRes] = await Promise.all([
         fetch(`https://api.alquran.cloud/v1/page/${page}/ar.alafasy`),
         fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`)
      ]);
      
      const audioJson = await audioRes.json();
      const textJson = await textRes.json();

      if (audioJson.code === 200 && textJson.code === 200) {
        const mergedData = textJson.data.ayahs.map((textAyah: any, index: number) => ({
          ...textAyah,
          audio: audioJson.data.ayahs[index].audio,
          text: textAyah.text
        }));
        setAyahs(mergedData);
      }
    } catch (e) {
      console.error("Failed to fetch Quran data", e);
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    setPlayingAudio(null);
    setIsPlayingPage(false);
    setCurrentAyahIndex(-1);
  };

  const handleNext = () => {
    if (page < 604) {
      setDirection('next');
      stopAudio();
      const nextSurah = getSurahInfoByPage(page + 1);
      onPageChange(page + 1, nextSurah?.number);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setDirection('prev');
      stopAudio();
      const prevSurah = getSurahInfoByPage(page - 1);
      onPageChange(page - 1, prevSurah?.number);
    }
  };

  // Selection Logic
  const handleAyahClick = (ayah: AyahData, index: number) => {
      if (isSelectionMode) {
          const newSet = new Set(selectedAyahIndices);
          if (newSet.has(index)) {
              newSet.delete(index);
          } else {
              // Calculate max allowed (50% of total, min 1)
              const maxSelection = Math.max(1, Math.ceil(ayahs.length * 0.5));
              
              if (newSet.size >= maxSelection) {
                  alert(`يمكنك اختيار ${maxSelection} آيات كحد أقصى (50% من الصفحة) للمشاركة.`);
                  return;
              }
              newSet.add(index);
          }
          setSelectedAyahIndices(newSet);
      } else {
          playAyah(ayah.audio, index);
      }
  };

  const toggleSelectionMode = () => {
      if (isSelectionMode) {
          setIsSelectionMode(false);
          setSelectedAyahIndices(new Set());
      } else {
          // Switch to recitation mode view if in Mushaf mode to select text
          if (mode === 'MUSHAF') setMode('RECITATION');
          setIsSelectionMode(true);
          setShowControls(true);
      }
  };

  const handleShareSelected = () => {
      if (selectedAyahIndices.size === 0) return;

      // Sort indices to maintain order
      const indices = Array.from(selectedAyahIndices).sort((a: number, b: number) => a - b);
      const selectedAyahs = indices.map(i => ayahs[i]);
      
      // Construct combined text
      const combinedText = selectedAyahs.map(a => `${a.text} ﴿${a.numberInSurah}﴾`).join(' ');
      
      // Construct Source (Surah Name + Ayah Range)
      const surahName = selectedAyahs[0].surah.name;
      const startNum = selectedAyahs[0].numberInSurah;
      const endNum = selectedAyahs[selectedAyahs.length - 1].numberInSurah;
      const range = startNum === endNum ? `${startNum}` : `${startNum}-${endNum}`;
      
      setShareItem({
          arabic: combinedText,
          source: `${surahName}: ${range}`,
          category: 'القرآن الكريم'
      });
  };

  // Swipe Handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    if (e.targetTouches.length > 0) {
      touchStart.current = e.targetTouches[0].clientX;
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches.length > 0) {
      touchEnd.current = e.targetTouches[0].clientX;
    }
  };
  const onTouchEnd = () => {
    const start = touchStart.current;
    const end = touchEnd.current;

    // Ensure start and end are numbers
    if (start === null || end === null) return;
    
    // Calculate distance
    const distance = start - end;
    const isLeftSwipe = distance > minSwipeDistance; // Dragged Finger Left (Move viewport right)
    const isRightSwipe = distance < -minSwipeDistance; // Dragged Finger Right (Move viewport left)
    
    // Reverse Logic for RTL Book Feeling
    // If I swipe my finger to the RIGHT (dragging current page to right), I should see the NEXT page (which comes from left).
    if (isRightSwipe && page < 604) {
        handleNext();
    }
    // If I swipe my finger to the LEFT (dragging current page to left), I should see the PREV page (which comes from right).
    if (isLeftSwipe && page > 0) {
        handlePrev();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPage = parseInt(e.target.value);
    setDirection(newPage > page ? 'next' : 'prev');
    stopAudio();
    const newSurah = getSurahInfoByPage(newPage);
    onPageChange(newPage, newSurah?.number);
  };

  const playAyah = (url: string, index: number) => {
    // If clicking a specific ayah, stop page mode
    setIsPlayingPage(false);

    if (audioRef.current) {
      if (playingAudio === url) {
        audioRef.current.pause();
        setPlayingAudio(null);
        setCurrentAyahIndex(-1);
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudio(url);
        setCurrentAyahIndex(index);
      }
    }
  };

  const togglePlayPage = () => {
    if (ayahs.length === 0) return;

    if (isPlayingPage) {
        // Pause
        stopAudio();
    } else {
        // Start
        setIsPlayingPage(true);
        // Start from beginning or resume? Let's start from beginning for simplicity or current index
        const startIndex = currentAyahIndex >= 0 ? currentAyahIndex : 0;
        playAyahAtIndex(startIndex);
    }
  };

  const playAyahAtIndex = (index: number) => {
    if (index >= ayahs.length) {
        // Page finished
        stopAudio();
        // Optional: Auto-advance to next page?
        // handleNext(); 
        return;
    }

    const ayah = ayahs[index];
    if (audioRef.current) {
        audioRef.current.src = ayah.audio;
        audioRef.current.play();
        setPlayingAudio(ayah.audio);
        setCurrentAyahIndex(index);
    }
  };

  const handleAudioEnded = () => {
      if (isPlayingPage) {
          playAyahAtIndex(currentAyahIndex + 1);
      } else {
          setPlayingAudio(null);
          setCurrentAyahIndex(-1);
      }
  };

  const handleJumpToPage = (targetPage: number) => {
    stopAudio();
    setDirection(targetPage > page ? 'next' : 'prev');
    const newSurah = getSurahInfoByPage(targetPage);
    onPageChange(targetPage, newSurah?.number);
    setShowIndex(false);
  };

  const filteredSurahs = SURAH_NAMES.filter(s => 
     s.name.includes(searchQuery) || 
     s.englishName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.number.toString().includes(searchQuery)
  );

  const paddedPage = page.toString().padStart(3, '0');
  const { data: { publicUrl: imageUrl } } = supabase.storage
    .from('quran-pages')
    .getPublicUrl(`quran-pages/${paddedPage}.png`);

  const currentSurah = ayahs.length > 0 ? ayahs[0].surah : (currentSurahStatic || { name: 'القرآن الكريم', englishName: 'The Holy Quran', revelationType: '' });
  const isCover = page === 0;

  // Determine page side for shadow logic (Odd = Right Page, Even = Left Page in Madani Mushaf usually)
  const isOddPage = page % 2 !== 0;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col font-sans select-none overflow-hidden transition-colors duration-500 ${isNightMode ? 'bg-slate-950 text-slate-200' : 'bg-[#F4F1EA] text-slate-900 paper-texture'}`}>
       <style>{`
         .paper-texture {
            background-color: #F4F1EA;
         }
         .glass-panel-dark {
           background: rgba(15, 23, 42, 0.9);
           backdrop-filter: blur(16px);
           -webkit-backdrop-filter: blur(16px);
           border: 1px solid rgba(255, 255, 255, 0.1);
           box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
         }
       `}</style>

       <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
       
       <ShareModal item={shareItem} onClose={() => setShareItem(null)} />

       {/* --- INDEX OVERLAY (MODAL) --- */}
       {showIndex && (
         <div className="absolute inset-0 z-[200] flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowIndex(false)}></div>
            
            <div className="relative m-4 flex flex-col max-h-[85vh] rounded-3xl overflow-hidden glass-panel-dark border border-white/10 shadow-2xl mt-auto mb-auto">
               {/* Index Header */}
               <div className="p-4 flex items-center justify-between border-b border-white/10 bg-white/5">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                     <List size={20} className="text-amber-500" />
                     فهرس المصحف
                  </h2>
                  <button 
                     onClick={() => setShowIndex(false)}
                     className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                  >
                     <X size={18} />
                  </button>
               </div>

               {/* Tabs & Search */}
               <div className="p-4 space-y-4 bg-black/20">
                  <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                     <button 
                        onClick={() => setIndexTab('SURAHS')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${indexTab === 'SURAHS' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                     >
                        السور
                     </button>
                     <button 
                        onClick={() => setIndexTab('JUZ')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${indexTab === 'JUZ' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                     >
                        الأجزاء
                     </button>
                  </div>
                  
                  {indexTab === 'SURAHS' && (
                     <div className="relative">
                        <Search className="absolute right-3 top-3 text-slate-500" size={16} />
                        <input 
                           type="text" 
                           placeholder="ابحث عن سورة..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-amber-500 focus:outline-none transition-colors dir-ltr"
                        />
                     </div>
                  )}
               </div>

               {/* List Content */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-0 bg-black/20">
                  {indexTab === 'SURAHS' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                        {filteredSurahs.map((surah) => (
                           <button
                              key={surah.number}
                              onClick={() => handleJumpToPage(surah.startPage)}
                              className={`p-3 rounded-xl flex items-center justify-between transition-all group border ${
                                 currentSurahStatic?.number === surah.number 
                                   ? 'bg-amber-900/20 border-amber-500/30' 
                                   : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                           >
                              <div className="flex items-center gap-3">
                                 <span className="w-8 h-8 flex items-center justify-center text-xs font-mono text-amber-500 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    {surah.number}
                                 </span>
                                 <div className="text-right">
                                    <h3 className="text-white font-bold font-quran text-lg leading-none">{surah.name}</h3>
                                    <p className="text-[9px] text-slate-400 uppercase tracking-wider">{surah.englishName}</p>
                                 </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded border ${surah.revelationType === 'Meccan' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                 {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                              </span>
                           </button>
                        ))}
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {JUZ_START_PAGES.map((juz) => (
                           <button
                              key={juz.id}
                              onClick={() => handleJumpToPage(juz.startPage)}
                              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all group border ${
                                 currentJuz === juz.id
                                   ? 'bg-amber-900/20 border-amber-500/30' 
                                   : 'bg-white/5 border-white/5 hover:bg-white/10'
                              }`}
                           >
                              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold shadow-lg text-sm">
                                 {juz.id}
                              </div>
                              <div className="text-center">
                                 <h3 className="text-white font-bold text-sm">الجزء {juz.id}</h3>
                                 <div className="text-slate-400 text-[10px]">
                                    صفحة {juz.startPage}
                                 </div>
                              </div>
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>
       )}

       {/* --- MAIN CONTENT LAYER --- */}
       <div 
         className="absolute inset-0 z-0 flex items-center justify-center"
         onClick={toggleControls}
         onTouchStart={onTouchStart}
         onTouchMove={onTouchMove}
         onTouchEnd={onTouchEnd}
       >
          {mode === 'MUSHAF' ? (
             <div className="relative w-full h-full flex items-center justify-center p-0 transition-transform duration-500 ease-out">
                {/* Book Background Vignette - Reduced for cleaner look */}
                <div className={`absolute inset-0 pointer-events-none transition-colors duration-500 ${isNightMode ? 'bg-black/80' : 'bg-[#e3dcd3]'}`}></div>
                
                {loading && !error && (
                   <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="relative">
                         <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
                         <Loader2 className="animate-spin text-amber-600 relative z-10" size={48} />
                      </div>
                   </div>
                )}

                {error && (
                   <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl max-w-sm mx-4 shadow-xl border border-stone-200 z-20">
                      <AlertCircle className="text-red-500 mb-4" size={48} />
                      <h3 className="text-xl font-bold text-stone-800 mb-2">تعذر تحميل الصفحة</h3>
                      <p className="text-stone-500 text-sm mb-6 dir-ltr opacity-70 font-mono text-[10px]">{imageUrl}</p>
                      <button 
                         onClick={(e) => { e.stopPropagation(); setError(false); setLoading(true); }}
                         className="px-6 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-500 transition-colors shadow-lg"
                      >
                         إعادة المحاولة
                      </button>
                   </div>
                )}

                {/* Main Page Image Container - Styled to look like a book page */}
                <div 
                   key={page}
                   className={`
                      relative flex items-center justify-center overflow-hidden
                      ${direction === 'next' ? 'animate-in slide-in-from-left duration-500' : 'animate-in slide-in-from-right duration-500'}
                      ${isNightMode ? 'bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]' : 'bg-[#fffbf2]'}
                   `}
                   style={{
                       // Dynamic sizing to maximize screen real estate - INCREASED SIZE
                       height: '100vh',
                       width: '100%',
                       maxWidth: '100vw',
                       
                       // Page Shape Logic - Simplified for max area
                       borderTopRightRadius: isOddPage ? '4px' : '0',
                       borderBottomRightRadius: isOddPage ? '4px' : '0',
                       borderTopLeftRadius: !isOddPage ? '4px' : '0',
                       borderBottomLeftRadius: !isOddPage ? '4px' : '0',
                       
                       // Page Shadows (Spine vs Edge)
                       boxShadow: isNightMode ? 'none' : 
                         isOddPage 
                           ? '10px 0 25px rgba(0,0,0,0.15), -1px 0 2px rgba(0,0,0,0.1)' // Right Page
                           : '-10px 0 25px rgba(0,0,0,0.15), 1px 0 2px rgba(0,0,0,0.1)' // Left Page
                   }}
                >
                   {/* 1. Spine Shadow (Inner Gradient) */}
                   {!isNightMode && (
                       <div className={`absolute top-0 bottom-0 w-8 z-10 pointer-events-none mix-blend-multiply opacity-15
                           ${isOddPage 
                               ? 'left-0 bg-gradient-to-r from-slate-800 via-slate-600 to-transparent' 
                               : 'right-0 bg-gradient-to-l from-slate-800 via-slate-600 to-transparent'
                           }
                       `}></div>
                   )}

                   <img 
                      src={imageUrl} 
                      alt={`Page ${page}`}
                      className={`
                         w-full h-full
                         ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                         object-contain
                         transition-all duration-500 
                         mix-blend-multiply
                      `}
                      onLoad={() => setLoading(false)}
                      onError={() => { setLoading(false); setError(true); }}
                      style={{ 
                         // Night mode filters
                         filter: isNightMode 
                           ? 'invert(1) hue-rotate(180deg) brightness(0.85) grayscale(20%)' 
                           : 'sepia(8%) contrast(105%)',
                         mixBlendMode: isNightMode ? 'normal' : 'multiply'
                      }}
                   />
                </div>
             </div>
          ) : (
             <div className="w-full h-full overflow-y-auto custom-scrollbar pt-28 pb-40 px-4 max-w-3xl mx-auto">
                {/* Header Info */}
                <div className="text-center mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
                   <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-500/10 border border-amber-900/10 mb-3 shadow-sm">
                      <Book size={24} className="text-amber-700" />
                   </div>
                   <h2 className={`text-4xl font-quran mb-2 drop-shadow-sm ${isNightMode ? 'text-slate-100' : 'text-stone-800'}`}>
                      {isCover ? 'القرآن الكريم' : currentSurah?.name}
                   </h2>
                   <div className="flex items-center justify-center gap-3">
                      <div className={`h-px w-8 ${isNightMode ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
                      <p className={`text-xs font-serif tracking-widest uppercase ${isNightMode ? 'text-slate-400' : 'text-stone-500'}`}>
                          {isCover ? 'The Holy Quran' : currentSurah?.englishName}
                      </p>
                      <div className={`h-px w-8 ${isNightMode ? 'bg-slate-700' : 'bg-stone-300'}`}></div>
                   </div>
                </div>

                {/* Ayah List */}
                <div className="space-y-4">
                   {ayahs.map((ayah, idx) => (
                      <div 
                         key={ayah.number} 
                         onClick={(e) => { e.stopPropagation(); handleAyahClick(ayah, idx); }}
                         className={`
                            relative rounded-2xl p-5 transition-all duration-300 group cursor-pointer border
                            ${isSelectionMode && selectedAyahIndices.has(idx)
                               ? 'bg-emerald-500/20 border-emerald-500/50 shadow-emerald-900/20'
                               : playingAudio === ayah.audio 
                                    ? (isNightMode ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-amber-50 border-amber-200 shadow-md') 
                                    : (isNightMode ? 'bg-slate-900 border-white/5 hover:bg-slate-800' : 'bg-white/60 hover:shadow-sm border-transparent hover:bg-white/80')
                            }
                         `}
                      >
                         <div className={`flex justify-between items-center gap-4 mb-3 dir-rtl border-b pb-3 ${isNightMode ? 'border-white/10' : 'border-stone-200/50'}`}>
                            <div className="flex items-center gap-2">
                               {isSelectionMode ? (
                                   <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${selectedAyahIndices.has(idx) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-500 text-transparent'}`}>
                                       <Check size={14} />
                                   </div>
                               ) : (
                                   <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono shadow-sm transition-colors ${playingAudio === ayah.audio ? 'bg-amber-600 text-white' : (isNightMode ? 'bg-slate-800 border border-slate-700 text-amber-500' : 'bg-stone-100 border border-stone-200 text-amber-700')}`}>
                                      {ayah.numberInSurah}
                                   </span>
                               )}
                               {!isSelectionMode && (
                                   <button 
                                      className={`
                                         w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm
                                         ${playingAudio === ayah.audio ? 'bg-amber-600 text-white shadow-amber-200' : (isNightMode ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-amber-400' : 'bg-white text-stone-400 border border-stone-200 hover:border-amber-400 hover:text-amber-600')}
                                      `}
                                   >
                                      {playingAudio === ayah.audio ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
                                   </button>
                               )}
                            </div>
                            {/* Visual indicator of selection allowed */}
                            {isSelectionMode && (
                                <span className="text-[10px] text-emerald-400 font-bold">حدد للمشاركة</span>
                            )}
                         </div>
                         <p className={`text-right text-2xl md:text-3xl leading-[2.4] font-quran dir-rtl drop-shadow-sm transition-colors ${
                             isSelectionMode && selectedAyahIndices.has(idx) ? 'text-white' :
                             playingAudio === ayah.audio ? (isNightMode ? 'text-amber-400' : 'text-amber-900') : (isNightMode ? 'text-slate-200' : 'text-stone-800')
                         }`}>
                            {ayah.text}
                         </p>
                      </div>
                   ))}
                   {isCover && (
                      <div className={`text-center py-10 font-quran text-lg ${isNightMode ? 'text-slate-500' : 'text-stone-400'}`}>
                         اضغط للانتقال للصفحة الأولى
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>

       {/* --- FLOATING CONTROLS --- */}
       
       {/* Top Bar - Horizontal & Compact */}
       <div 
         className={`absolute top-4 inset-x-4 z-50 transition-all duration-500 ${showControls && !showIndex ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}
         onClick={(e) => e.stopPropagation()} 
       >
          <div className="max-w-2xl mx-auto flex flex-row items-center justify-between gap-3 bg-black/80 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl">
             
             {/* Left: Close */}
             <button 
                onClick={onClose} 
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="خروج"
             >
                <X size={18} />
             </button>
             
             {/* Center: Surah Info Pill */}
             <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden px-2">
                 <div className="flex flex-col items-center">
                    <span className="font-quran text-base font-bold text-white leading-none pb-0.5 truncate">
                       {isSelectionMode ? `تم تحديد ${selectedAyahIndices.size}` : (isCover ? 'القرآن الكريم' : currentSurahStatic?.name)}
                    </span>
                    {!isCover && !isSelectionMode && (
                       <span className="text-[9px] text-slate-400 font-sans tracking-widest uppercase truncate">
                           P{page} • J{currentJuz}
                       </span>
                    )}
                 </div>
             </div>

             {/* Right: Tools */}
             <div className="flex items-center gap-1">
                <button 
                   onClick={() => setIsNightMode(!isNightMode)}
                   className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isNightMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                   title={isNightMode ? 'الوضع النهاري' : 'الوضع الليلي'}
                >
                   {isNightMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button 
                   onClick={toggleSelectionMode}
                   className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSelectionMode ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                   title="مشاركة آيات"
                >
                   <Share size={18} />
                </button>
                <button 
                   onClick={() => setMode(mode === 'MUSHAF' ? 'RECITATION' : 'MUSHAF')}
                   className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${mode === 'RECITATION' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
                   title={mode === 'MUSHAF' ? 'وضع التلاوة' : 'وضع المصحف'}
                >
                   {mode === 'MUSHAF' ? <Volume2 size={18} /> : <ImageIcon size={18} />}
                </button>
                <button 
                   onClick={() => setShowIndex(true)}
                   className="w-9 h-9 rounded-full hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                   title="الفهرس"
                >
                   <List size={18} />
                </button>
             </div>
          </div>
       </div>

       {/* Bottom Bar - Corrected RTL Logic */}
       <div 
          className={`absolute bottom-6 inset-x-4 z-50 transition-all duration-500 ${showControls && !showIndex ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
          onClick={(e) => e.stopPropagation()} 
       >
          <div className="max-w-sm mx-auto">
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/5">
                
                {/* Main Controls Row */}
                {/* In RTL (dir="rtl"), the first element is on the RIGHT */}
                <div className="flex items-center justify-between mb-3">
                    
                    {/* Right Button (Previous Page -> Right Arrow) */}
                    <button 
                        onClick={handlePrev}
                        disabled={page <= 0}
                        className="p-3 rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {/* Play/Stop Page OR Share Button (Center) */}
                    {isSelectionMode ? (
                        <button 
                            onClick={handleShareSelected}
                            disabled={selectedAyahIndices.size === 0}
                            className={`
                                h-10 px-6 rounded-full flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-lg active:scale-95
                                ${selectedAyahIndices.size > 0 
                                    ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'}
                            `}
                        >
                            <Share size={16} />
                            <span>مشاركة ({selectedAyahIndices.size})</span>
                        </button>
                    ) : (
                        <button 
                            onClick={togglePlayPage}
                            disabled={ayahs.length === 0}
                            className={`
                                h-10 px-6 rounded-full flex items-center justify-center gap-2 font-bold text-xs transition-all shadow-lg active:scale-95
                                ${isPlayingPage 
                                    ? 'bg-red-500 text-white shadow-red-500/20' 
                                    : 'bg-white text-slate-900 hover:bg-slate-200 shadow-white/10'}
                            `}
                        >
                            {isPlayingPage ? (
                                <>
                                    <StopCircle size={16} fill="currentColor" />
                                    <span>إيقاف</span>
                                </>
                            ) : (
                                <>
                                    <Play size={16} fill="currentColor" />
                                    <span>استماع</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Left Button (Next Page -> Left Arrow) */}
                    <button 
                        onClick={handleNext}
                        disabled={page >= 604}
                        className="p-3 rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                {/* Compact Slider */}
                <div className="flex items-center gap-3 px-2">
                     <span className="text-[10px] text-slate-400 font-mono w-6 text-center">{page}</span>
                     <div className="relative flex-1 h-1 bg-white/20 rounded-full group cursor-pointer">
                         {/* Fill */}
                         <div 
                            className="absolute left-0 h-full bg-amber-500 rounded-full"
                            style={{ width: `${(page / 604) * 100}%` }}
                         ></div>
                         {/* Touch Target */}
                         <input 
                            type="range" 
                            min="0" 
                            max="604" 
                            value={page} 
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                         />
                     </div>
                     <span className="text-[10px] text-slate-400 font-mono w-6 text-center">604</span>
                </div>

            </div>
          </div>
       </div>
    </div>
  );
}