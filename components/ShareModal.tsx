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
  const [isGenerating, setIsGenerating] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Resolution setup
  const CARD_WIDTH = 720;
  const CARD_HEIGHT_PORTRAIT = 1280;
  const CARD_HEIGHT_SQUARE = 720;
  const cardHeight = aspectRatio === '9:16' ? CARD_HEIGHT_PORTRAIT : CARD_HEIGHT_SQUARE;

  useEffect(() => {
    if (!item || !printRef.current) return;

    let cancelled = false;
    setIsGenerating(true);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setCapturedBlob(null);

    const generate = async () => {
      try {
        await document.fonts.ready;
        // Delay to ensure the hidden DOM is fully painted
        await new Promise(r => setTimeout(r, 1000));

        const canvas = await html2canvas(printRef.current!, {
          scale: 1.5, // Produces 1080px width
          backgroundColor: '#020617',
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: CARD_WIDTH,
          height: cardHeight,
        });

        if (cancelled) return;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Blob null')), 'image/png');
        });

        if (cancelled) return;
        setCapturedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (err) {
        console.error('Capture failed:', err);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    generate();
    return () => { cancelled = true; };
  }, [item, aspectRatio]);

  if (!item) return null;

  const handleShare = async () => {
    if (!capturedBlob) return;
    setIsSharing(true);
    try {
      const file = new File([capturedBlob], `noor-${Date.now()}.png`, { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'نور - Noor App' });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(capturedBlob);
        a.download = `noor-${Date.now()}.png`;
        a.click();
      }
    } finally { setIsSharing(false); }
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displaySource = item.source;
  const displayNarrator = item.narrator;

  const getArabicFontSize = (text: string) => {
    if (text.length > 250) return '36px';
    if (text.length > 120) return '44px';
    if (text.length > 60) return '52px';
    return '64px';
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
      <div className="flex justify-between items-center mb-2 px-2 shrink-0">
        <h3 className="font-bold text-lg text-white font-sans">معاينة المشاركة</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X size={24} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950/50 rounded-3xl border border-white/5 relative">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm">جاري ضبط الأبعاد...</p>
          </div>
        ) : previewUrl && (
          <img src={previewUrl} alt="preview" className="rounded-xl shadow-2xl max-h-full max-w-full object-contain p-2" />
        )}
      </div>

      {/* THE HIDDEN MASTER DESIGN - ALL FIXED POSITIONS */}
      <div aria-hidden="true" style={{ position: 'fixed', left: '-9999px', top: 0, width: CARD_WIDTH, height: cardHeight, overflow: 'hidden' }}>
        <div ref={printRef} style={{ width: CARD_WIDTH, height: cardHeight, background: '#020617', display: 'flex', flexDirection: 'column', color: 'white', position: 'relative' }}>
          
          {/* 1. Background Gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }} />
          
          {/* 2. Stars Pattern (SVG) */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />

          {/* 3. Central Glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 65%)' }} />

          {/* 4. Double Frames */}
          <div style={{ position: 'absolute', inset: '40px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '48px' }} />
          <div style={{ position: 'absolute', inset: '60px', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '36px' }} />

          {/* 5. Content Layout */}
          <div style={{ position: 'relative', zIndex: 10, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '100px 60px' }}>
            
            {/* Top Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 40px', background: 'rgba(30,41,59,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px' }}>
              <Star size={24} color="#10b981" fill="#10b981" />
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase' }}>{displayCategory}</span>
              <Star size={24} color="#10b981" fill="#10b981" />
            </div>

            {/* Middle Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '60px' }}>
               
               <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                  {/* Top Quote */}
                  <div style={{ position: 'absolute', top: '-80px', right: '0px', opacity: 0.25 }}>
                    <Quote size={100} color="#10b981" style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  
                  <p dir="rtl" style={{ fontSize: getArabicFontSize(displayText || ''), lineHeight: '1.7', fontWeight: 700, padding: '0 40px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                    {displayText}
                  </p>

                  {/* Bottom Quote */}
                  <div style={{ position: 'absolute', bottom: '-80px', left: '0px', opacity: 0.25 }}>
                    <Quote size={100} color="#10b981" />
                  </div>
               </div>

               {item.translation && (
                 <p style={{ fontSize: '26px', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', maxWidth: '85%', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
                    "{item.translation}"
                 </p>
               )}

               <div style={{ textAlign: 'center' }}>
                  {displayNarrator && <p style={{ fontSize: '32px', color: '#34d399', fontWeight: 800, marginBottom: '12px' }}>{displayNarrator}</p>}
                  <p style={{ fontSize: '24px', color: '#64748b', letterSpacing: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{displaySource}</p>
               </div>
            </div>

            {/* Bottom Footer */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #059669, #064e3b)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Moon size={28} color="white" fill="white" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '3px' }}>NOOR</span>
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 800, letterSpacing: '6px' }}>APP</span>
                  </div>
               </div>
               <span style={{ fontSize: '50px', fontWeight: 900, opacity: 0.9 }}>نــور</span>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-4 bg-slate-900/90 p-3 rounded-2xl flex items-center gap-3 border border-white/10 shrink-0">
        <div className="flex flex-1 bg-black/40 p-1 rounded-xl">
          <button onClick={() => setAspectRatio('9:16')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '9:16' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><Smartphone size={16} /> قصة</button>
          <button onClick={() => setAspectRatio('1:1')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '1:1' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><Monitor size={16} /> مربع</button>
        </div>
        <button onClick={handleShare} disabled={isGenerating || isSharing} className="px-6 bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
          {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        </button>
      </div>
    </div>
  );
};
