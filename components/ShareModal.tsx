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
          scale: 2,
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
    if (text.length > 250) return { fontSize: 20 };
    if (text.length > 120) return { fontSize: 24 };
    if (text.length > 60)  return { fontSize: 28 };
    return { fontSize: 34 };
  };

  // Stars SVG background — identical to your original working version
  const starsBg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">

      <div className="flex justify-between items-center mb-2 px-2 shrink-0">
        <h3 className="font-bold text-lg text-white">معاينة المشاركة</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

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

      {/* ── HIDDEN CAPTURE TARGET ── ONLY THIS SECTION IS CHANGED ── */}
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

          {/* ── BACKGROUND LAYERS ── */}

          {/* 1. Base gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }} />

          {/* 2. Stars pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: starsBg }} />

          {/* 3. Central emerald radial glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, height: 480, background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* ── FRAMES ── */}

          {/* 4. Outer white frame */}
          <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, pointerEvents: 'none' }} />

          {/* 5. Inner emerald frame */}
          <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(16,185,129,0.12)', borderRadius: 22, pointerEvents: 'none' }} />

          {/* ── CORNER BRACKETS ── */}
          {([
            { top: 20,    left: 20,   rotate: '0deg'   },
            { top: 20,    right: 20,  rotate: '90deg'  },
            { bottom: 20, right: 20,  rotate: '180deg' },
            { bottom: 20, left: 20,   rotate: '-90deg' },
          ] as const).map((pos, i) => (
            <div key={i} style={{ position: 'absolute', width: 40, height: 40, opacity: 0.45, ...pos }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="4" style={{ transform: `rotate(${pos.rotate})`, width: '100%', height: '100%' }}>
                <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
              </svg>
            </div>
          ))}

          {/* ── ALL CONTENT ── */}
          <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '48px 36px 36px',
          }}>

            {/* TOP: Category badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 28px', borderRadius: 100, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Star size={15} fill="#10b981" color="#10b981" />
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'white' }}>{displayCategory}</span>
              <Star size={15} fill="#10b981" color="#10b981" />
            </div>

            {/* MIDDLE: Quote icon + Arabic text + divider + narrator/source */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 0, paddingTop: 12, paddingBottom: 12 }}>

              {/* Opening quote — pure SVG path, always renders in canvas */}
              <div style={{ alignSelf: 'flex-end', marginRight: 8, marginBottom: -8, opacity: 0.3 }}>
                <svg width="52" height="52" viewBox="0 0 80 80" fill="none">
                  <path d="M10 50 C10 30 20 20 36 18 L36 28 C28 30 24 36 24 44 L36 44 L36 62 L10 62 Z" fill="#10b981"/>
                  <path d="M46 50 C46 30 56 20 72 18 L72 28 C64 30 60 36 60 44 L72 44 L72 62 L46 62 Z" fill="#10b981"/>
                </svg>
              </div>

              {/* Arabic text — centered, RTL, correct line-height */}
              <p
                dir="rtl"
                style={{
                  ...getTextSize(displayText || ''),
                  lineHeight: 1.9,
                  fontWeight: 700,
                  color: 'white',
                  textAlign: 'center',
                  width: '100%',
                  padding: '8px 24px',
                  textShadow: '0 2px 12px rgba(0,0,0,0.5)',
                  wordBreak: 'break-word',
                }}
              >
                {displayText}
              </p>

              {/* Closing quote — flipped */}
              <div style={{ alignSelf: 'flex-start', marginLeft: 8, marginTop: -8, opacity: 0.3, transform: 'rotate(180deg)' }}>
                <svg width="52" height="52" viewBox="0 0 80 80" fill="none">
                  <path d="M10 50 C10 30 20 20 36 18 L36 28 C28 30 24 36 24 44 L36 44 L36 62 L10 62 Z" fill="#10b981"/>
                  <path d="M46 50 C46 30 56 20 72 18 L72 28 C64 30 60 36 60 44 L72 44 L72 62 L46 62 Z" fill="#10b981"/>
                </svg>
              </div>

              {/* Emerald gradient divider */}
              <div style={{ width: '55%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent)', margin: '18px 0' }} />

              {/* Translation */}
              {item.translation && (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', maxWidth: '86%', lineHeight: 1.7, marginBottom: 12 }}>
                  "{item.translation}"
                </p>
              )}

              {/* Narrator + Source */}
              <div style={{ textAlign: 'center' }}>
                {displayNarrator && (
                  <p style={{ fontSize: 17, color: '#34d399', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{displayNarrator}</p>
                )}
                <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 }}>{displaySource}</p>
              </div>
            </div>

            {/* BOTTOM: Logo footer */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #059669, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Moon size={18} color="white" fill="rgba(255,255,255,0.25)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: 3 }}>NOOR</span>
                  <span style={{ fontSize: 9, color: '#10b981', textTransform: 'uppercase', letterSpacing: 5, fontWeight: 700 }}>App</span>
                </div>
              </div>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'white', opacity: 0.88 }}>نــور</span>
            </div>

          </div>
        </div>
      </div>

      {/* Controls — UNCHANGED */}
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
