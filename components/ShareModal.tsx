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

  // Resolution: 720 width is the "sweet spot" for mobile quality vs memory
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
        // Wait longer for complex SVG backgrounds to settle
        await new Promise(r => setTimeout(r, 800));

        const canvas = await html2canvas(printRef.current!, {
          scale: 1.5, // Total output width = 1080px
          backgroundColor: '#020617',
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: CARD_WIDTH,
          height: cardHeight,
          // Important for Arabic rendering alignment
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('capture-target');
            if (el) el.style.display = 'flex';
          }
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
    } finally {
      setIsSharing(false);
    }
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displaySource = item.source;
  const displayNarrator = item.narrator;

  // Exact sizes for the 720px width container
  const getArabicStyle = (text: string) => {
    let fontSize = 48;
    if (text.length > 250) fontSize = 32;
    else if (text.length > 120) fontSize = 38;
    else if (text.length > 60) fontSize = 44;
    
    return {
      fontSize: `${fontSize}px`,
      lineHeight: '1.8',
      fontFamily: "'Amiri', 'Traditional Arabic', serif",
      fontWeight: 700,
      textShadow: '0 4px 12px rgba(0,0,0,0.5)',
      padding: '0 40px'
    };
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4">
      
      <div className="flex justify-between items-center mb-2 px-2 shrink-0">
        <h3 className="font-bold text-lg text-white font-sans">معاينة المشاركة</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X size={24} /></button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden bg-slate-950/50 rounded-3xl border border-white/5">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm">جاري تحضير التصميم...</p>
          </div>
        ) : previewUrl && (
          <img src={previewUrl} alt="preview" className="rounded-xl shadow-2xl max-h-full max-w-full object-contain p-2" />
        )}
      </div>

      {/* HIDDEN CAPTURE AREA — FIXED OLD DESIGN */}
      <div aria-hidden="true" style={{ position: 'fixed', left: '-9999px', top: 0, width: CARD_WIDTH, height: cardHeight, overflow: 'hidden' }}>
        <div id="capture-target" ref={printRef} style={{ width: CARD_WIDTH, height: cardHeight, background: '#020617', display: 'flex', flexDirection: 'column', color: 'white', position: 'relative' }}>
          
          {/* Old Background elements */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }} />
          
          {/* Stars Pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23ffffff'/%3E%3C/svg%3E")` }} />

          {/* Glows */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)' }} />

          {/* Double Frame */}
          <div style={{ position: 'absolute', inset: 30, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 40 }} />
          <div style={{ position: 'absolute', inset: 45, border: '1px solid rgba(16,185,129,0.1)', borderRadius: 32 }} />

          {/* Content */}
          <div style={{ position: 'relative', zIndex: 10, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '80px 40px' }}>
            
            {/* Category Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: '12px 32px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100 }}>
              <Star size={18} color="#10b981" fill="#10b981" />
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase' }}>{displayCategory}</span>
              <Star size={18} color="#10b981" fill="#10b981" />
            </div>

            {/* Main Text Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 40 }}>
               
               <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{ position: 'absolute', top: -60, right: 0, opacity: 0.2 }}><Quote size={80} color="#10b981" style={{ transform: 'rotate(180deg)' }} /></div>
                  
                  <p dir="rtl" style={getArabicStyle(displayText || '')}>
                    {displayText}
                  </p>

                  <div style={{ position: 'absolute', bottom: -60, left: 0, opacity: 0.2 }}><Quote size={80} color="#10b981" /></div>
               </div>

               {item.translation && (
                 <p style={{ fontSize: 22, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', maxWidth: '80%', lineHeight: 1.6, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 30 }}>
                    "{item.translation}"
                 </p>
               )}

               <div style={{ textAlign: 'center' }}>
                  {displayNarrator && <p style={{ fontSize: 26, color: '#34d399', fontWeight: 800, marginBottom: 10, fontFamily: 'serif' }}>{displayNarrator}</p>}
                  <p style={{ fontSize: 20, color: '#64748b', letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase' }}>{displaySource}</p>
               </div>
            </div>

            {/* Logo Footer */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 30 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #059669, #064e3b)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Moon size={22} color="white" fill="white" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>NOOR</span>
                    <span style={{ fontSize: 10, color: '#10b981', fontWeight: 800, letterSpacing: 5 }}>APP</span>
                  </div>
               </div>
               <span style={{ fontSize: 40, fontWeight: 900, opacity: 0.8 }}>نــور</span>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto mt-4 bg-slate-900/90 p-3 rounded-2xl flex items-center gap-3 border border-white/10 shrink-0">
        <div className="flex flex-1 bg-black/40 p-1 rounded-xl">
          <button onClick={() => setAspectRatio('9:16')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '9:16' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><Smartphone size={16} /> قصة</button>
          <button onClick={() => setAspectRatio('1:1')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '1:1' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}><Monitor size={16} /> مربع</button>
        </div>
        <button onClick={handleShare} disabled={isGenerating || isSharing} className="px-6 bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
          {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        </button>
      </div>
    </div>
  );
};
