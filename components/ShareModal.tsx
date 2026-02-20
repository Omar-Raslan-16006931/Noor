import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Monitor, Share2, Loader2, Star, Moon } from 'lucide-react';
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

  const displayText = item.text || item.arabic || '';
  const displayCategory = item.category || item.title || 'Noor';
  const displayNarrator = item.narrator;
  const displaySource = item.source;

  const getTextSize = (text: string): number => {
    if (text.length > 250) return 20;
    if (text.length > 120) return 24;
    if (text.length > 60)  return 28;
    return 34;
  };

  // Stars SVG pattern as a data URI
  const starsBg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">

      <div className="flex justify-between items-center mb-2 px-2 shrink-0">
        <h3 className="font-bold text-lg text-white">معاينة المشاركة</h3>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Preview */}
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
          <p className="text-red-400 text-sm text-center px-4">فشل تحضير الصورة. جرب التقاط لقطة شاشة.</p>
        )}
      </div>

      {/* ─── HIDDEN CAPTURE TARGET ─── */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-99999px', top: 0, width: CARD_WIDTH, height: cardHeight, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}
      >
        <div
          ref={printRef}
          style={{ width: CARD_WIDTH, height: cardHeight, position: 'relative', overflow: 'hidden', background: '#020617', display: 'flex', flexDirection: 'column', color: 'white' }}
        >
          {/* Layer 1: Gradient background */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)' }} />

          {/* Layer 2: Stars pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: starsBg }} />

          {/* Layer 3: Central emerald glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

          {/* Layer 4: Double frame */}
          <div style={{ position: 'absolute', inset: 20, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 30, border: '1px solid rgba(16,185,129,0.1)', borderRadius: 22, pointerEvents: 'none' }} />

          {/* Layer 5: Corner decorations */}
          {([
            { top: 24, left: 24, rotate: '0deg' },
            { top: 24, right: 24, rotate: '90deg' },
            { bottom: 24, right: 24, rotate: '180deg' },
            { bottom: 24, left: 24, rotate: '-90deg' },
          ] as const).map((pos, i) => (
            <div key={i} style={{ position: 'absolute', width: 44, height: 44, opacity: 0.45, ...pos }}>
              <svg viewBox="0 0 100 100" fill="none" stroke="#10b981" strokeWidth="4" style={{ transform: `rotate(${pos.rotate})`, width: '100%', height: '100%' }}>
                <path d="M2 30 V 10 Q 2 2 10 2 H 30" />
              </svg>
            </div>
          ))}

          {/* Layer 6: All content */}
          <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '52px 36px 40px' }}>

            {/* Top: Category badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 28px', borderRadius: 100, background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Star size={16} fill="#10b981" color="#10b981" />
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', color: 'white' }}>{displayCategory}</span>
              <Star size={16} fill="#10b981" color="#10b981" />
            </div>

            {/* Middle: Quote + text + source */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', paddingTop: 20, paddingBottom: 20 }}>

              {/* Quote open mark */}
              <div style={{ alignSelf: 'flex-end', marginRight: 16, marginBottom: -16, opacity: 0.35 }}>
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                  <path d="M30 70 Q10 70 10 50 L10 30 Q10 10 30 10 L50 10 L50 30 Q50 50 30 50 Z" fill="#10b981" opacity="0.15" />
                  <path d="M70 70 Q50 70 50 50 L50 30 Q50 10 70 10 L90 10 L90 30 Q90 50 70 50 Z" fill="#10b981" opacity="0.15" />
                  <path d="M20 35 Q12 42 15 52" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d="M60 35 Q52 42 55 52" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Arabic text — centered, RTL, properly spaced */}
              <p
                dir="rtl"
                style={{
                  fontSize: getTextSize(displayText),
                  lineHeight: 1.85,
                  fontWeight: 700,
                  color: 'white',
                  textAlign: 'center',
                  width: '100%',
                  padding: '0 20px',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  wordBreak: 'break-word',
                  unicodeBidi: 'embed',
                }}
              >
                {displayText}
              </p>

              {/* Quote close mark */}
              <div style={{ alignSelf: 'flex-start', marginLeft: 16, marginTop: -16, opacity: 0.35, transform: 'rotate(180deg)' }}>
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                  <path d="M30 70 Q10 70 10 50 L10 30 Q10 10 30 10 L50 10 L50 30 Q50 50 30 50 Z" fill="#10b981" opacity="0.15" />
                  <path d="M70 70 Q50 70 50 50 L50 30 Q50 10 70 10 L90 10 L90 30 Q90 50 70 50 Z" fill="#10b981" opacity="0.15" />
                  <path d="M20 35 Q12 42 15 52" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  <path d="M60 35 Q52 42 55 52" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Thin divider */}
              <div style={{ width: '60%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)', margin: '20px 0' }} />

              {/* Translation */}
              {item.translation && (
                <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', maxWidth: '86%', lineHeight: 1.7, marginBottom: 14 }}>
                  "{item.translation}"
                </p>
              )}

              {/* Narrator + Source */}
              <div style={{ textAlign: 'center', marginTop: 4 }}>
                {displayNarrator && (
                  <p style={{ fontSize: 17, color: '#34d399', fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>{displayNarrator}</p>
                )}
                <p style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 }}>{displaySource}</p>
              </div>
            </div>

            {/* Bottom: Logo footer */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #059669, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Moon size={18} color="white" fill="rgba(255,255,255,0.25)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: 3 }}>NOOR</span>
                  <span style={{ fontSize: 9, color: '#10b981', textTransform: 'uppercase', letterSpacing: 5, fontWeight: 700 }}>App</span>
                </div>
              </div>
              <span style={{ fontSize: 26, fontWeight: 900, color: 'white', opacity: 0.85, letterSpacing: 2 }}>نــور</span>
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
