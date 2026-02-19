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

    try {
      // Force a repaint/wait for fonts
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(printRef.current, {
        scale: 2, // High resolution for sharper text
        backgroundColor: '#020617',
        useCORS: true,
        logging: false,
        // removed allowTaint: true as it blocks toBlob
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to generate image');
        }

        const file = new File([blob], 'noor-share.png', { type: 'image/png' });

        // Try Native Share
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              // Some browsers require text/title
              title: 'Noor App', 
              text: 'Shared from Noor' 
            });
            setIsGenerating(false);
            return; // Success
          } catch (e) {
            console.warn('Native share failed or cancelled, falling back to download', e);
          }
        }

        // Fallback to Download
        try {
          const link = document.createElement('a');
          link.download = 'noor-share.png';
          link.href = canvas.toDataURL('image/png');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          console.error('Download fallback failed', err);
        }
        
        setIsGenerating(false);
      }, 'image/png', 1.0);

    } catch (err) {
      console.error("Share generation failed", err);
      alert('نعتذر، حدث خطأ أثناء إنشاء الصورة. يرجى المحاولة مرة أخرى.');
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
                 backgroundImage: 'linear-gradient(135deg, #020617 0%, #064e3b 140%, #020617 200%)',
               }}
            >
                {/* Background Elements - Safe CSS Pattern instead of external image */}
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
                    <div className="flex flex-col items-center pt-8 w-full">
                        <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center mb-6 bg-emerald-900/10 backdrop-blur-sm shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_15px_currentColor]"></div>
                        </div>
                        <h1 className="text-4xl font-serif font-bold tracking-[0.2em] text-white mb-2 text-center">NOOR</h1>
                        <p className="text-sm text-emerald-400 tracking-[0.4em] uppercase font-light text-center opacity-80">Islamic Assistant</p>
                    </div>

                    {/* Main Text Section */}
                    <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full max-w-4xl">
                        {/* Category Pill */}
                        <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md">
                            <span className="text-xl font-bold text-emerald-300 tracking-widest uppercase text-center block">
                                {displayCategory}
                            </span>
                        </div>

                        {/* Quote Text */}
                        <div className="relative w-full text-center px-8">
                            <Quote size={50} className="text-emerald-500/20 absolute -top-12 left-0" />
                            
                            <p className={`font-quran font-bold text-white drop-shadow-2xl leading-[2.2] dir-rtl text-center ${
                                (displayText?.length || 0) > 200 ? 'text-4xl' : 
                                (displayText?.length || 0) > 100 ? 'text-5xl' : 'text-6xl'
                            }`}>
                                {displayText}
                            </p>
                            
                            <Quote size={50} className="text-emerald-500/20 absolute -bottom-12 right-0 rotate-180" />
                        </div>
                        
                        {item.translation && (
                            <p className="text-2xl text-slate-300 font-serif italic text-center max-w-3xl opacity-90 leading-relaxed">
                                {item.translation}
                            </p>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col items-center pb-8 gap-5 w-full">
                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <div className="text-center">
                            {displayNarrator && (
                                <p className="text-3xl text-emerald-400 font-bold font-quran mb-3 drop-shadow-md">
                                    {displayNarrator}
                                </p>
                            )}
                            <p className="text-xl text-slate-400 font-serif italic opacity-70">
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
