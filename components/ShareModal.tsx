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

  // Capture dimensions — small enough for iOS Safari, still high quality
  const CARD_WIDTH = 540;
  const CARD_HEIGHT_PORTRAIT = 960;
  const CARD_HEIGHT_SQUARE = 540;
  const cardHeight = aspectRatio === '9:16' ? CARD_HEIGHT_PORTRAIT : CARD_HEIGHT_SQUARE;

  useEffect(() => {
    if (!item || !printRef.current) return;

    let cancelled = false;
    setIsGenerating(true);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setCapturedBlob(null);

    const run = async () => {
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 600));

        const canvas = await html2canvas(printRef.current!, {
          scale: 2, // 2x = 1080×1920 output quality from a 540×960 element
          backgroundColor: '#020617',
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: CARD_WIDTH,
          height: cardHeight,
        });

        if (cancelled) return;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            b => b ? resolve(b) : reject(new Error('toBlob failed')),
            'image/png'
          );
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

    run();
    return () => { cancelled = true; };
  }, [item, aspectRatio]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  if (!item) return null;

  const handleShare = async () => {
    if (!capturedBlob) return;
    setIsSharing(true);
    try {
      const file = new File([capturedBlob], `noor-${Date.now()}.png`, { type: 'image/png' });
      const canShare = (() => {
        try { return !!(navigator.share && navigator.canShare?.({ files: [file] })); }
        catch { return false; }
      })();

      if (canShare) {
        try { await navigator.share({ files: [file], title: 'نور - Noor App' }); }
        catch (e: any) { if (e.name !== 'AbortError') triggerDownload(capturedBlob); }
      } else {
        triggerDownload(capturedBlob);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const triggerDownload = (blob: Blob) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `noor-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  };

  const displayText = item.text || item.arabic;
  const displayCategory = item.category || item.title || 'Noor';
  const displayNarrator = item.narrator;
  const displaySource = item.source;

  const getTextSize = (text: string) => {
    if (text.length > 250) return { fontSize: 18 };
    if (text.length > 120) return { fontSize: 22 };
    if (text.length > 60)  return { fontSize: 26 };
    return { fontSize: 30 };
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">

      <div className="flex justify-between items-center mb-2 px-2 shrink-0">
        <h3 className="font-bold text-lg text-white">معاينة المشاركة</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Preview: shows the generated <img> — same pixels as what gets shared */}
      <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 w-full bg-slate-950/50 rounded-3xl border border-white/5">
        {isGenerating && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm">جاري تحضير الصورة...</p>
          </div>
        )}
        {!isGenerating && previewUrl && (
          <img
            src={previewUrl}
            alt="preview"
            className="rounded-xl shadow-2xl"
            style={{ maxWidth: 'calc(100% - 16px)', maxHeight: 'calc(100% - 16px)', objectFit: 'contain' }}
          />
        )}
        {!isGenerating && !previewUrl && (
          <p className="text-red-400 text-sm text-center px-4">
            فشل تحضير الصورة. جرب التقاط لقطة شاشة.
          </p>
        )}
      </div>

      {/*
        Hidden capture target — rendered off-screen at CARD_WIDTH × cardHeight.
        NO CSS transforms. NO scale(). html2canvas reads this directly.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-99999px',
          top: 0,
          width: CARD_WIDTH,
          height: cardHeight,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div
          ref={printRef}
          style={{ width: CARD_WIDTH, height: cardHeight, position: 'relative', overflow: 'hidden', background: '#020617', display: 'flex', flexDirection: 'column', color: 'white' }}
        >
          {/* Background gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020617, #0f172a, #1e293b)' }} />

          {/* Radial glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

          {/* Outer border */}
          <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 18, border: '1px solid rgba(16,185,129,0.1)', borderRadius: 20, pointerEvents: 'none' }} />

          {/* Corner SVGs */}
          {[
            { top: 16, left: 16, rotate: '0deg' },
            { top: 16, right: 16, rotate: '90deg' },
            { bottom: 16, right: 16, rotate: '180deg' },
            { bottom: 16, left: 16, rotate: '-90deg' },
          ].map((pos, i) => (
            <div key={i} style={{ position: 'absolute', width: 36, height: 36, opacity: 0.4, ...pos }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="3" style={{ transform: `rotate(${pos.rotate})`, width: '100%', height: '100%' }}>
                <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
              </svg>
            </div>
          ))}

          <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '32px 28px' }}>

            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 24px', borderRadius: 100, background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Star size={14} fill="#34d399" color="#34d399" />
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'white' }}>{displayCategory}</span>
              <Star size={14} fill="#34d399" color="#34d399" />
            </div>

            {/* Main text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 20, textAlign: 'center' }}>
              <p
                dir="rtl"
                style={{
                  fontFamily: 'serif',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.7,
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  ...getTextSize(displayText || ''),
                }}
              >
                {displayText}
              </p>

              {item.translation && (
                <p style={{ fontSize: 13, color: '#cbd5e1', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, maxWidth: '85%', lineHeight: 1.6, opacity: 0.85 }}>
                  "{item.translation}"
                </p>
              )}

              <div style={{ textAlign: 'center' }}>
                {displayNarrator && (
                  <p style={{ fontFamily: 'serif', fontSize: 16, color: '#34d399', fontWeight: 700, marginBottom: 6 }}>{displayNarrator}</p>
                )}
                <p style={{ fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>{displaySource}</p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #059669, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Moon size={14} color="white" fill="rgba(255,255,255,0.2)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: 3 }}>NOOR</div>
                  <div style={{ fontSize: 8, color: '#10b981', textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 }}>App</div>
                </div>
              </div>
              <span style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 900, color: 'white', opacity: 0.9 }}>نــور</span>
            </div>

          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md mx-auto mt-4 bg-slate-900/90 p-3 rounded-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl shrink-0 z-50">
        <div className="flex flex-1 bg-black/40 p-1 rounded-xl">
          <button
            onClick={() => setAspectRatio('9:16')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '9:16' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone size={16} /> قصة
          </button>
          <button
            onClick={() => setAspectRatio('1:1')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all ${aspectRatio === '1:1' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Monitor size={16} /> مربع
          </button>
        </div>
        <button
          onClick={handleShare}
          disabled={isGenerating || isSharing || !capturedBlob}
          className="px-6 bg-white text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-50 h-full"
        >
          {isSharing ? <Loader2 size={20} className="animate-spin text-emerald-600" /> : <Share2 size={20} />}
        </button>
      </div>

    </div>
  );
};