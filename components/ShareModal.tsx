import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Monitor, Share2, Loader2, Quote, Star, Moon } from 'lucide-react';
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

  const EXPORT_WIDTH = 1080;
  const EXPORT_HEIGHT_PORTRAIT = 1920;
  const EXPORT_HEIGHT_SQUARE = 1080;

  useEffect(() => {
    if (!item || !containerRef.current) return;
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const targetHeight = aspectRatio === '9:16' ? EXPORT_HEIGHT_PORTRAIT : EXPORT_HEIGHT_SQUARE;
      const scaleX = (containerWidth - 32) / EXPORT_WIDTH;
      const scaleY = (containerHeight - 32) / targetHeight;
      setScale(Math.min(scaleX, scaleY, 0.45)); 
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [item, aspectRatio]);

  if (!item) return null;

  // YOUR WORKING SAVE METHOD
  const executeShare = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // CRITICAL FIX FOR TEXT GLITCH: 
      // Force browser to fully render the Arabic fonts before taking the screenshot
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 800));

      const canvas = await html2canvas(printRef.current, {
        scale: 2, 
        backgroundColor: '#020617', 
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Blob generation failed");
        }

        const file = new File([blob], `noor-share-${Date.now()}.png`, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'نور - Noor App'
            });
          } catch (e: any) {
            if (e.name !== 'AbortError') {
              triggerDownload(blob);
            }
          }
        } else {
          triggerDownload(blob);
        }
        
        setIsGenerating(false);
      }, 'image/png');

    } catch (err) {
      console.error("Canvas crash:", err);
      setIsGenerating(false);
      alert('حدث خطأ أثناء المعالجة. يرجى أخذ لقطة شاشة (Screenshot).');
    }
  };

  const triggerDownload = (blob: Blob) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `noor-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displaySource = item.source;
  const displayNarrator = item.narrator;
  
  const getTextSizeClass = (text: string) => {
      if (text.length > 250) return 'text-5xl leading-relaxed';
      if (text.length > 120) return 'text-6xl leading-relaxed';
      if (text.length > 60) return 'text-7xl leading-relaxed';
      return 'text-8xl leading-[1.4]';
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
             width: EXPORT_WIDTH,
             height: aspectRatio === '9:16' ? EXPORT_HEIGHT_PORTRAIT : EXPORT_HEIGHT_SQUARE,
             transform: `scale(${scale})`,
             transformOrigin: 'center center',
           }}
           className="shadow-2xl flex-shrink-0 origin-center select-none"
         >
            <div 
               ref={printRef}
               className="w-full h-full flex flex-col relative overflow-hidden text-white bg-[#020617]"
            >
                {/* YOUR ORIGINAL COOL BACKGROUND */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
                
                {/* Replaced blur with radial gradient so it doesn't crash the phone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_60%)] pointer-events-none"></div>

                <div className="absolute inset-5 border border-white/10 rounded-[40px] pointer-events-none z-0"></div>
                <div className="absolute inset-7 border border-emerald-500/10 rounded-[32px] pointer-events-none z-0"></div>

                {/* Corners */}
                <div className="absolute top-8 left-8 w-24 h-24 pointer-events-none opacity-40">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M2 30 V 10 Q 2 2 10 2 H 30" /></svg>
                </div>
                <div className="absolute top-8 right-8 w-24 h-24 pointer-events-none opacity-40 rotate-90">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M2 30 V 10 Q 2 2 10 2 H 30" /></svg>
                </div>
                <div className="absolute bottom-8 right-8 w-24 h-24 pointer-events-none opacity-40 rotate-180">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M2 30 V 10 Q 2 2 10 2 H 30" /></svg>
                </div>
                <div className="absolute bottom-8 left-8 w-24 h-24 pointer-events-none opacity-40 -rotate-90">
                    <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="1.5"><path d="M2 30 V 10 Q 2 2 10 2 H 30" /></svg>
                </div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-12">
                    
                    <div className="shrink-0 mt-6">
                        <div className="flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl">
                            <Star size={20} className="fill-emerald-400 text-emerald-400" />
                            <span className="text-xl font-bold text-white tracking-[0.15em] uppercase font-serif">
                                {displayCategory}
                            </span>
                            <Star size={20} className="fill-emerald-400 text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative">
                        
                        <div className="w-full relative py-8 px-4">
                           <div className="absolute -top-8 -right-4 opacity-40">
                               <Quote size={80} className="text-emerald-400 fill-emerald-400/10 rotate-180" />
                           </div>

                           {/* TEXT GLITCH FIX: Replaced drop-shadow class with a standard textShadow style and forced dir="rtl" */}
                           <div dir="rtl" className="w-full text-center">
                               <p className={`font-quran font-bold text-white leading-[1.6] inline-block ${displayText ? getTextSizeClass(displayText) : ''}`} style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}>
                                    {displayText}
                               </p>
                           </div>
                           
                           <div className="absolute -bottom-8 -left-4 opacity-40">
                               <Quote size={80} className="text-emerald-400 fill-emerald-400/10" />
                           </div>
                        </div>

                        {item.translation && (
                            <div className="mt-8 pt-6 border-t border-white/10 w-4/5 mx-auto">
                                <p className="text-2xl text-slate-300 font-serif italic text-center opacity-80 leading-relaxed font-light">
                                    "{item.translation}"
                                </p>
                            </div>
                        )}

                        <div className="text-center space-y-2 mt-10">
                             {displayNarrator && (
                                <p className="text-3xl text-emerald-400 font-bold font-quran" style={{ textShadow: '0 2px 10px rgba(16,185,129,0.3)' }}>
                                    {displayNarrator}
                                </p>
                            )}
                            <p className="text-2xl text-slate-300 font-serif uppercase tracking-widest font-bold opacity-80">
                                {displaySource}
                            </p>
                        </div>
                    </div>

                    <div className="w-full shrink-0 flex items-center justify-between border-t border-white/5 pt-5 px-2 opacity-80">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg border border-white/10 transform -rotate-3">
                                 <Moon size={20} className="text-white fill-white/20" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-widest font-serif leading-none">NOOR</span>
                                <span className="text-[10px] text-emerald-500 uppercase tracking-[0.4em] font-bold mt-0.5">App</span>
                            </div>
                        </div>
                        
                        <div>
                            {/* TEXT GLITCH FIX: Removed drop-shadow class */}
                            <span className="text-4xl font-black font-quran text-white opacity-90">نــور</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
       </div>

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
           {isGenerating ? <Loader2 size={20} className="animate-spin text-emerald-600" /> : <Share2 size={20} />}
         </button>
       </div>
    </div>
  );
};