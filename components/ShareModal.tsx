
import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Monitor, Share2, Loader2, Quote, Sparkles, Star, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareItem {
  text?: string;
  arabic?: string;
  translation?: string;
  category?: string;
  source: string;
  narrator?: string;
  title?: string;
}

interface ShareModalProps {
  item: ShareItem | null;
  onClose: () => void;
}

type AspectRatio = '9:16' | '1:1';

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item || !containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Target dimensions
      const targetWidth = 1080;
      const targetHeight = aspectRatio === '9:16' ? 1920 : 1080;
      
      const scaleX = (containerWidth - 48) / targetWidth;
      const scaleY = (containerHeight - 48) / targetHeight;
      
      setScale(Math.min(scaleX, scaleY, 0.45)); 
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [item, aspectRatio]);

  if (!item) return null;

  const executeShare = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    let clone: HTMLElement | null = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const width = 1080;
      const height = aspectRatio === '9:16' ? 1920 : 1080;

      const original = printRef.current;
      clone = original.cloneNode(true) as HTMLElement;

      // Setup clone for capture
      Object.assign(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: `${width}px`,
        height: `${height}px`,
        zIndex: '-9999',
        transform: 'none',
        borderRadius: '0',
        margin: '0',
        pointerEvents: 'none',
      });

      document.body.appendChild(clone);
      
      // Wait for DOM to settle
      await new Promise(resolve => setTimeout(resolve, 250));

      const canvas = await html2canvas(clone, {
        scale: 1, // Reduced scale to prevent memory crashes on mobile
        backgroundColor: '#020617', // Explicit background
        useCORS: true,
        logging: false,
        width: width,
        height: height,
        // allowTaint removed to prevent security errors with toBlob
      });

      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
        clone = null;
      }

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

      if (!blob) throw new Error('Failed to generate image blob');

      const file = new File([blob], 'noor-share.png', { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'Noor App',
        text: 'Shared from Noor' 
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        const link = document.createElement('a');
        link.download = 'noor-share.png';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }

    } catch (err) {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      console.error("Share generation failed", err);
      if ((err as Error).name !== 'AbortError') {
         // Add more descriptive error if possible or keep generic
         alert('حدث خطأ أثناء إنشاء الصورة. قد يكون الجهاز غير مدعوم أو الذاكرة ممتلئة.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displaySource = item.source;
  const displayNarrator = item.narrator;
  
  // Dynamic font sizing - INCREASED SIZES significantly
  const getTextSizeClass = (text: string) => {
      if (text.length > 250) return 'text-6xl leading-relaxed';
      if (text.length > 120) return 'text-7xl leading-relaxed';
      if (text.length > 60) return 'text-8xl leading-relaxed';
      return 'text-9xl leading-[1.4]';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
       
       <div className="flex justify-between items-center mb-2 px-2 shrink-0">
          <h3 className="font-bold text-lg text-white">معاينة المشاركة</h3>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
             <X size={24} />
          </button>
       </div>
       
       <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden relative min-h-0 w-full bg-slate-950/50 rounded-3xl border border-white/5">
         <div 
           style={{ 
             width: 1080,
             height: aspectRatio === '9:16' ? 1920 : 1080,
             transform: `scale(${scale})`,
             transformOrigin: 'center center',
           }}
           className="shadow-2xl flex-shrink-0 origin-center"
         >
            <div 
               ref={printRef}
               className="w-full h-full flex flex-col relative overflow-hidden text-white"
               style={{ 
                  background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
               }}
            >
                {/* --- Background Effects --- */}
                {/* Pattern */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
                
                {/* Central Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Inner Decorative Frame */}
                <div className="absolute inset-6 border border-white/10 rounded-[48px] pointer-events-none z-0"></div>
                <div className="absolute inset-8 border border-emerald-500/10 rounded-[40px] pointer-events-none z-0"></div>

                {/* Corner Ornaments */}
                <div className="absolute top-8 left-8 w-32 h-32 pointer-events-none opacity-40">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1">
                        <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
                    </svg>
                </div>
                <div className="absolute top-8 right-8 w-32 h-32 pointer-events-none opacity-40 rotate-90">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1">
                        <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
                    </svg>
                </div>
                <div className="absolute bottom-8 right-8 w-32 h-32 pointer-events-none opacity-40 rotate-180">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1">
                        <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
                    </svg>
                </div>
                <div className="absolute bottom-8 left-8 w-32 h-32 pointer-events-none opacity-40 -rotate-90">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1">
                        <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
                    </svg>
                </div>

                {/* --- Content --- */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-16">
                    
                    {/* Header - Large Category */}
                    <div className="shrink-0 mt-8">
                        <div className="flex items-center gap-4 px-10 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                            <Star size={28} className="fill-emerald-400 text-emerald-400" />
                            <span className="text-3xl font-bold text-white tracking-[0.2em] uppercase font-serif">
                                {displayCategory}
                            </span>
                            <Star size={28} className="fill-emerald-400 text-emerald-400" />
                        </div>
                    </div>

                    {/* Main Text Body */}
                    <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative">
                        
                        {/* Text Container with Bracket Quotes */}
                        <div className="w-full relative py-12 px-8">
                           {/* Right Up Quote */}
                           <div className="absolute -top-12 -right-8 opacity-40">
                               <Quote size={100} className="text-emerald-400 fill-emerald-400/10 rotate-180" />
                           </div>

                           <p className={`font-quran font-bold text-white text-center drop-shadow-2xl dir-rtl px-10 ${displayText ? getTextSizeClass(displayText) : ''}`}>
                                {displayText}
                           </p>
                           
                           {/* Left Lower Quote */}
                           <div className="absolute -bottom-12 -left-8 opacity-40">
                               <Quote size={100} className="text-emerald-400 fill-emerald-400/10" />
                           </div>
                        </div>

                        {item.translation && (
                            <div className="mt-12 pt-6 border-t border-white/10 w-3/4 mx-auto">
                                <p className="text-4xl text-slate-300 font-serif italic text-center opacity-80 leading-relaxed font-light">
                                    "{item.translation}"
                                </p>
                            </div>
                        )}

                        {/* Source & Narrator - MOVED UP HERE and MADE LARGER */}
                        <div className="text-center space-y-4 mt-16">
                             {displayNarrator && (
                                <p className="text-5xl text-emerald-400 font-bold font-quran drop-shadow-lg mb-2">
                                    {displayNarrator}
                                </p>
                            )}
                            <p className="text-4xl text-slate-300 font-serif uppercase tracking-widest font-bold opacity-80">
                                {displaySource}
                            </p>
                        </div>
                    </div>

                    {/* Footer Branding - SHRUNK SIGNIFICANTLY */}
                    <div className="w-full shrink-0 flex items-center justify-between border-t border-white/5 pt-6 px-4 opacity-70">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg border border-white/10 transform -rotate-3">
                                 <Moon size={28} className="text-white fill-white/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-white tracking-widest font-serif leading-none">NOOR</span>
                                <span className="text-xs text-emerald-500 uppercase tracking-[0.5em] font-bold mt-1">App</span>
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-5xl font-black font-quran text-white drop-shadow-md leading-none opacity-80">نــور</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
       </div>

       {/* Controls */}
       <div className="w-full max-w-md mx-auto mt-4 bg-slate-900/90 p-3 rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl shrink-0 z-50">
         <div className="flex flex-1 bg-black/40 p-1 rounded-xl">
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '9:16' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} />
              قصة
            </button>
            <button 
              onClick={() => setAspectRatio('1:1')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '1:1' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={16} />
              مربع
            </button>
         </div>

         <button 
           onClick={executeShare}
           disabled={isGenerating}
           className="px-6 bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 h-full"
         >
           {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
         </button>
       </div>
    </div>
  );
};
