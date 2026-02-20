import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Award, CheckCircle2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CompletionModalProps {
  onClose: () => void;
  username?: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ onClose, username }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const CARD_W = 500;
  const CARD_H = 625;

  const date = new Date().toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    if (!printRef.current) return;
    let cancelled = false;

    const run = async () => {
      setIsGenerating(true);
      try {
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 600));

        const canvas = await html2canvas(printRef.current!, {
          scale: 2,
          backgroundColor: '#020617',
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: CARD_W,
          height: CARD_H,
        });

        if (cancelled) return;
        setImageUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('Certificate failed:', e);
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">

      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-sm w-full mb-6 flex flex-col items-center justify-center">
        {isGenerating && (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 size={36} className="animate-spin text-emerald-400" />
            <p className="text-slate-400 text-sm">جاري تحضير الشهادة...</p>
          </div>
        )}
        {!isGenerating && imageUrl && (
          <div className="relative w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <img
              src={imageUrl}
              alt="Certificate"
              className="w-full h-auto object-contain rounded-2xl border border-white/10 shadow-2xl"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 whitespace-nowrap animate-bounce">
              <Download size={18} />
              اضغط مطولاً لحفظ الشهادة
            </div>
          </div>
        )}
        {!isGenerating && !imageUrl && (
          <p className="text-red-400 text-sm text-center py-10">فشل تحضير الشهادة. يرجى أخذ لقطة شاشة.</p>
        )}
      </div>

      {/* Hidden capture target — no transforms, small and safe for iOS */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', left: '-99999px', top: 0, width: CARD_W, height: CARD_H, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}
      >
        <div
          ref={printRef}
          style={{ width: CARD_W, height: CARD_H, background: '#0f172a', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', color: 'white' }}
        >
          {/* Background glows */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(16,185,129,0.1), transparent)' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />

          {/* Inner card */}
          <div style={{ position: 'relative', zIndex: 1, margin: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, background: 'rgba(15,23,42,0.8)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '40px 32px', textAlign: 'center' }}>

            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #34d399, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(3deg)' }}>
                <CheckCircle2 size={30} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', color: 'white' }}>Certificate</div>
                <div style={{ fontSize: 10, color: '#64748b', letterSpacing: 6, textTransform: 'uppercase', marginTop: 4 }}>Of Completion</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, color: '#64748b', fontStyle: 'italic', marginBottom: 8 }}>Presented to</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: '#6ee7b7', fontFamily: 'serif' }}>{username || 'Guest User'}</div>
              </div>
              <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, maxWidth: 220 }}>
                  For successfully completing the recitation of the
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'white', marginTop: 6 }}>Holy Quran</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>Date</div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#34d399', marginTop: 2 }}>{date}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <Award size={14} color="#f59e0b" />
                <div style={{ fontSize: 9, color: '#475569', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 700 }}>Noor App</div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
