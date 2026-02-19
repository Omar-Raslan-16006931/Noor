import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Book, Volume2, Play, Pause, Image as ImageIcon } from 'lucide-react';

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
  }
}

export const QuranReader: React.FC<QuranReaderProps> = ({ page, onPageChange, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'MUSHAF' | 'RECITATION'>('MUSHAF');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Recitation Data
  useEffect(() => {
    if (mode === 'RECITATION') {
      fetchPageData();
    }
  }, [page, mode]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const audioResponse = await fetch(`https://api.alquran.cloud/v1/page/${page}/ar.alafasy`);
      const audioJson = await audioResponse.json();
      
      const textResponse = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
      const textJson = await textResponse.json();

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

  const handleNext = () => {
    if (page < 604) {
      setDirection('next');
      setLoading(true);
      setPlayingAudio(null);
      onPageChange(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setDirection('prev');
      setLoading(true);
      setPlayingAudio(null);
      onPageChange(page - 1);
    }
  };

  const playAyah = (url: string) => {
    if (audioRef.current) {
      if (playingAudio === url) {
        audioRef.current.pause();
        setPlayingAudio(null);
      } else {
        audioRef.current.src = url;
        audioRef.current.play();
        setPlayingAudio(url);
      }
    }
  };

  const paddedPage = page.toString().padStart(3, '0');
  const imageUrl = `https://raw.githubusercontent.com/media-host/quran-pages/main/images/page${paddedPage}.png`;

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col transition-colors duration-500 ${isFullscreen ? 'bg-black' : 'bg-[#0f172a]'}`}>
       <style>{`
         @keyframes slideInRight {
           from { opacity: 0; transform: translateX(30px); }
           to { opacity: 1; transform: translateX(0); }
         }
         @keyframes slideInLeft {
           from { opacity: 0; transform: translateX(-30px); }
           to { opacity: 1; transform: translateX(0); }
         }
         .page-animate-next {
           animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
         }
         .page-animate-prev {
           animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
         }
       `}</style>

       <audio ref={audioRef} onEnded={() => setPlayingAudio(null)} className="hidden" />

       {/* Header */}
       <div className={`flex justify-between items-center p-3 transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100 absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-10' : 'bg-slate-900 border-b border-white/10'}`}>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 bg-slate-800/80 rounded-full text-slate-300 hover:text-white transition-colors">
               <X size={18} />
            </button>
            <div className="flex bg-slate-800 p-1 rounded-lg">
               <button 
                  onClick={() => setMode('MUSHAF')}
                  className={`p-1.5 rounded-md transition-all ${mode === 'MUSHAF' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Mushaf Mode"
               >
                  <ImageIcon size={16} />
               </button>
               <button 
                  onClick={() => setMode('RECITATION')}
                  className={`p-1.5 rounded-md transition-all ${mode === 'RECITATION' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Recitation Mode"
               >
                  <Volume2 size={16} />
               </button>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
             <span className="text-emerald-500 font-bold text-sm sm:text-lg font-quran">
                {mode === 'RECITATION' && ayahs.length > 0 ? ayahs[0].surah.name : 'القرآن الكريم'}
             </span>
             <span className="text-[10px] text-slate-400">صفحة {page}</span>
          </div>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 bg-slate-800/80 rounded-full text-slate-300 hover:text-white transition-colors">
             {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
       </div>

       {/* Main Content Area */}
       <div className={`flex-1 relative overflow-hidden flex items-center justify-center ${mode === 'MUSHAF' ? 'bg-[#f0e6d2]' : 'bg-slate-950'}`}>
          
          {mode === 'MUSHAF' && (
             <>
               <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
               <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10"></div>
               
               {loading && (
                 <div className="absolute inset-0 flex items-center justify-center z-0">
                    <Loader2 className="animate-spin text-amber-800/40" size={64} />
                 </div>
               )}
               
               <div 
                  key={page}
                  className={`relative transition-all duration-300 ${isFullscreen ? 'h-full w-full' : 'h-[95%] w-full max-w-3xl'} flex items-center justify-center shadow-2xl ${direction === 'next' ? 'page-animate-next' : 'page-animate-prev'}`}
               >
                  <img 
                    src={imageUrl} 
                    alt={`Quran Page ${page}`}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onLoad={() => setLoading(false)}
                  />
               </div>
             </>
          )}

          {mode === 'RECITATION' && (
             <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 sm:p-6 max-w-2xl mx-auto">
                {loading ? (
                   <div className="flex h-full items-center justify-center">
                      <Loader2 className="animate-spin text-emerald-500" size={48} />
                   </div>
                ) : (
                   <div className="space-y-6 pb-20">
                      <div className="text-center py-4 border-b border-white/10 mb-4">
                         <h2 className="text-3xl text-emerald-400 font-quran mb-1">{ayahs[0]?.surah.name}</h2>
                         <p className="text-xs text-slate-500">{ayahs[0]?.surah.englishName}</p>
                      </div>
                      
                      {ayahs.map((ayah) => (
                         <div key={ayah.number} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                            <div className="flex justify-between items-start gap-4 mb-4">
                               <div className="bg-emerald-900/30 w-8 h-8 rounded-full flex items-center justify-center text-xs text-emerald-400 font-mono border border-emerald-500/20">
                                  {ayah.numberInSurah}
                               </div>
                               <button 
                                  onClick={() => playAyah(ayah.audio)}
                                  className={`p-2 rounded-full transition-all ${playingAudio === ayah.audio ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                               >
                                  {playingAudio === ayah.audio ? <Pause size={16} /> : <Play size={16} />}
                               </button>
                            </div>
                            <p className="text-right text-3xl leading-[2.4] text-white font-quran dir-rtl">
                               {ayah.text}
                            </p>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          )}
       </div>

       {/* Footer Controls */}
       <div className={`p-4 flex justify-between items-center transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100 absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm' : 'bg-slate-900 border-t border-white/10'}`}>
          <button 
             onClick={handleNext}
             disabled={page >= 604}
             className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-xl text-white disabled:opacity-50 hover:bg-emerald-500 transition-all active:scale-95 shadow-lg"
          >
             <ChevronRight size={20} />
             <span className="font-bold hidden sm:inline">التالية</span>
          </button>
          
          <div className="flex flex-col items-center px-4">
             <span className="text-slate-300 text-xs font-mono tracking-widest">{page} / 604</span>
             <div className="w-24 sm:w-48 h-1 bg-slate-700 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(page/604)*100}%` }}></div>
             </div>
          </div>

          <button 
             onClick={handlePrev}
             disabled={page <= 1}
             className="flex items-center gap-2 px-6 py-3 bg-slate-800 rounded-xl text-white disabled:opacity-50 hover:bg-emerald-700 transition-all active:scale-95 shadow-lg"
          >
             <span className="font-bold hidden sm:inline">السابقة</span>
             <ChevronLeft size={20} />
          </button>
       </div>
    </div>
  );
};
