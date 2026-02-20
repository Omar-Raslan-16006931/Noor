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

  const executeShare = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Crash-proof canvas generation (no scale manipulation, solid background)
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Standard high-res scale
        backgroundColor: '#020617', // Solid dark color to prevent transparency bugs
        useCORS: true,
        logging: false,
      });

      // 2. Convert directly to Blob (PNG format is safer across all devices)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Blob generation failed");
        }

        const file = new File([blob], `noor-share-${Date.now()}.png`, { type: 'image/png' });

        // 3. The absolute standard Web Share API
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'نور - Noor App'
            });
          } catch (e: any) {
            // User manually closed the share sheet
            if (e.name !== 'AbortError') {
              triggerDownload(blob);
            }
          }
        } else {
          // Desktop / Non-supporting browser fallback
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
            {/* THE CRASH-PROOF DOM
              - No SVG data URIs
              - No backdrop-blur
              - No radial gradients
              - Only solid colors and linear gradients 
            */}
            <div 
               ref={printRef}
               className="w-full h-full flex flex-col relative overflow-hidden text-white bg-[#020617]"
            >
                {/* Safe Linear Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#1e293b]"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/10 to-transparent"></div>

                {/* Safe Decorative Borders */}
                <div className="absolute inset-5 border border-emerald-900/40 rounded-[40px] pointer-events-none z-0"></div>
                <div className="absolute inset-7 border border-emerald-500/20 rounded-[32px] pointer-events-none z-0"></div>

                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-12">
                    
                    <div className="shrink-0 mt-8">
                        {/* Safe solid background badge */}
                        <div className="flex items-center gap-3 px-8 py-3 rounded-full bg-[#0f172a] border border-emerald-500/20 shadow-xl">
                            <Star size={20} className="text-emerald-400" />
                            <span className="text-xl font-bold text-white tracking-[0.15em] uppercase font-serif">
                                {displayCategory}
                            </span>
                            <Star size={20} className="text-emerald-400" />
                        </div>
                    </div>

                    <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative">
                        
                        <div className="w-full relative py-8 px-4">
                           <div className="absolute -top-12 -right-4 opacity-30">
                               <Quote size={80} className="text-emerald-400 rotate-180" />
                           </div>

                           <p className={`font-quran font-bold text-white text-center dir-rtl px-4 leading-[1.6] ${displayText ? getTextSizeClass(displayText) : ''}`}>
                                {displayText}
                           </p>
                           
                           <div className="absolute -bottom-12 -left-4 opacity-30">
                               <Quote size={80} className="text-emerald-400" />
                           </div>
                        </div>

                        {item.translation && (
                            <div className="mt-12 pt-8 border-t border-emerald-900/50 w-4/5 mx-auto">
                                <p className="text-2xl text-slate-300 font-serif italic text-center opacity-80 leading-relaxed font-light">
                                    "{item.translation}"
                                </p>
                            </div>
                        )}

                        <div className="text-center space-y-4 mt-12">
                             {displayNarrator && (
                                <p className="text-3xl text-emerald-400 font-bold font-quran">
                                    {displayNarrator}
                                </p>
                            )}
                            <p className="text-2xl text-slate-400 font-serif uppercase tracking-widest font-bold">
                                {displaySource}
                            </p>
                        </div>
                    </div>

                    <div className="w-full shrink-0 flex items-center justify-between border-t border-emerald-900/40 pt-6 px-4">
                        <div className="flex items-center gap-4">
                            {/* Safe solid background icon */}
                            <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-emerald-500/30 flex items-center justify-center transform -rotate-3">
                                 <Moon size={24} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white tracking-widest font-serif leading-none mb-1">NOOR</span>
                                <span className="text-xs text-emerald-500 uppercase tracking-[0.4em] font-bold">App</span>
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-5xl font-black font-quran text-emerald-400/80 leading-none">نــور</span>
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