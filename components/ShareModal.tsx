
import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Monitor, Share2, Loader2, Quote } from 'lucide-react';
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

type AspectRatio = '9:16' | '4:3';

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scale, setScale] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate preview scale
  useEffect(() => {
    if (!item || !containerRef.current) return;

    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      const targetWidth = aspectRatio === '9:16' ? 1080 : 1200;
      const targetHeight = aspectRatio === '9:16' ? 1920 : 900;
      
      const scaleX = (containerWidth - 32) / targetWidth;
      const scaleY = (containerHeight - 32) / targetHeight;
      
      // Use a slightly smaller scale to ensure margins
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
      // Force a repaint/wait for fonts and images to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      const width = aspectRatio === '9:16' ? 1080 : 1200;
      const height = aspectRatio === '9:16' ? 1920 : 900;

      // Clone the element to render it off-screen at full size without transforms
      // This fixes issues where html2canvas fails on scaled elements or calculates 0 dimensions for patterns
      const original = printRef.current;
      clone = original.cloneNode(true) as HTMLElement;

      clone.style.position = 'fixed';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      clone.style.zIndex = '-9999';
      clone.style.transform = 'none';
      clone.style.borderRadius = '0'; 
      // Ensure gradient background is preserved if it was set on the original via style
      clone.style.background = original.style.background || '#020617';

      document.body.appendChild(clone);
      
      // Allow DOM to settle
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(clone, {
        scale: 2, // High resolution
        backgroundColor: '#020617', // Solid background to prevent transparency lines
        useCORS: true,
        logging: false,
        width: width,
        height: height,
        alpha: false, // Disable alpha channel to prevent rendering artifacts
      });

      // Remove clone immediately after capture
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
        clone = null;
      }

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));

      if (!blob) {
        throw new Error('Failed to generate image blob');
      }

      const file = new File([blob], 'noor-share.png', { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'Noor App',
        text: 'Shared from Noor' 
      };

      // Try Native Share
      // Check if navigator.share exists and if it can share this data
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (shareError) {
           if ((shareError as Error).name !== 'AbortError') {
              console.warn('Share API failed, falling back to download', shareError);
              throw shareError; // Trigger fallback in catch block if needed
           }
        }
      } else {
        // Fallback to Download
        const link = document.createElement('a');
        link.download = 'noor-share.png';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }

    } catch (err) {
      // Cleanup clone if error occurred before cleanup
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }

      console.error("Share generation failed", err);
      // Only alert if it wasn't a user cancellation
      if ((err as Error).name !== 'AbortError') {
         alert('نعتذر، حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displaySource = item.source;
  const displayNarrator = item.narrator;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
       
       {/* Header */}
       <div className="flex justify-between items-center mb-2 px-2 shrink-0">
          <div className="text-white">
             <h3 className="font-bold text-lg">معاينة المشاركة</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
             <X size={24} />
          </button>
       </div>
       
       {/* Preview Area */}
       <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden relative min-h-0 w-full">
         <div 
           style={{ 
             width: aspectRatio === '9:16' ? 1080 : 1200,
             height: aspectRatio === '9:16' ? 1920 : 900,
             transform: `scale(${scale})`,
             transformOrigin: 'center center',
           }}
           className="shadow-2xl flex-shrink-0"
         >
            <div 
               ref={printRef}
               className="w-full h-full bg-[#020617] text-white flex flex-col relative overflow-hidden"
               style={{ 
                 // Simplified gradient to avoid glitchy lines in html2canvas
                 background: 'linear-gradient(135deg, #020617 0%, #064e3b 100%)',
               }}
            >
                {/* Background Elements */}
                <div 
                  className="absolute inset-0 opacity-[0.05]" 
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                  }}
                ></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

                {/* Content Container */}
                <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 items-center">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center pt-4 w-full shrink-0">
                        <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center mb-4 bg-emerald-900/10 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_15px_currentColor]"></div>
                        </div>
                        <h1 className="text-4xl font-serif font-bold tracking-[0.2em] text-white mb-1 text-center">NOOR</h1>
                        <p className="text-xs text-emerald-400 tracking-[0.4em] uppercase font-light text-center opacity-80">Islamic Assistant</p>
                    </div>

                    {/* Main Text Section */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full max-w-5xl px-4">
                        {/* Category Pill */}
                        <div className="bg-white/5 border border-white/10 px-8 py-2.5 rounded-full backdrop-blur-md shrink-0">
                            <span className="text-xl font-bold text-emerald-300 tracking-widest uppercase text-center block">
                                {displayCategory}
                            </span>
                        </div>

                        {/* Quote Text Container */}
                        <div className="relative w-full text-center px-6">
                            <Quote size={50} className="text-emerald-500/20 absolute -top-12 left-0" />
                            
                            <p className={`font-quran font-bold text-white drop-shadow-2xl leading-[2.0] dir-rtl text-center ${
                                (displayText?.length || 0) > 200 ? 'text-5xl' : 
                                (displayText?.length || 0) > 100 ? 'text-6xl' : 'text-7xl'
                            }`}>
                                {displayText}
                            </p>
                            
                            <Quote size={50} className="text-emerald-500/20 absolute -bottom-12 right-0 rotate-180" />
                        </div>
                        
                        {item.translation && (
                            <p className="text-2xl text-slate-300 font-serif italic text-center max-w-4xl opacity-90 leading-relaxed mt-2">
                                {item.translation}
                            </p>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col items-center pb-24 gap-6 w-full shrink-0 mt-8">
                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <div className="text-center">
                            {displayNarrator && (
                                <p className="text-3xl text-emerald-400 font-bold font-quran mb-3 drop-shadow-md">
                                    {displayNarrator}
                                </p>
                            )}
                            <p className="text-4xl text-slate-200 font-serif italic opacity-90 font-medium tracking-wide">
                                {displaySource}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
         </div>
       </div>

       {/* Controls */}
       <div className="w-full max-w-md mx-auto mt-4 bg-slate-900/80 p-4 rounded-2xl flex flex-col gap-4 border border-white/10 backdrop-blur-xl shrink-0 z-50">
         <div className="flex bg-black/40 p-1 rounded-xl">
            <button 
              onClick={() => setAspectRatio('9:16')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '9:16' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} />
              Story (9:16)
            </button>
            <button 
              onClick={() => setAspectRatio('4:3')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${
                aspectRatio === '4:3' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor size={16} />
              Post (4:3)
            </button>
         </div>

         <button 
           onClick={executeShare}
           disabled={isGenerating}
           className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50"
         >
           {isGenerating ? (
             <>
               <Loader2 size={20} className="animate-spin" />
               جاري المعالجة...
             </>
           ) : (
             <>
               <Share2 size={20} />
               مشاركة الصورة
             </>
           )}
         </button>
       </div>
    </div>
  );
};
