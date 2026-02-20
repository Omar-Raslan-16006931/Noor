import React, { useRef, useState } from 'react';
import { X, Loader2, Award, CheckCircle2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CompletionModalProps {
  onClose: () => void;
  username?: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ onClose, username }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [date] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));

  const generateImage = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    try {
      // FIX: Use lower scale on mobile to avoid canvas memory overflow
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const captureScale = isMobile ? 1.5 : 2.5;

      const canvas = await html2canvas(printRef.current, {
        scale: captureScale,
        backgroundColor: '#020617',
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImageUrl(dataUrl);

    } catch (e) {
      console.error('Certificate Generation Failed:', e);
      alert('نعتذر، حدث خطأ أثناء تحضير الشهادة. يرجى أخذ لقطة شاشة بدلاً من ذلك.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">

      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="max-w-sm w-full relative mb-6 rounded-sm overflow-hidden flex flex-col items-center justify-center">

        {generatedImageUrl ? (
          <div className="relative w-full flex flex-col items-center animate-in zoom-in-95 duration-300">
            <img
              src={generatedImageUrl}
              alt="Quran Completion Certificate"
              className="w-full h-auto object-contain shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl border border-white/10"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white px-6 py-3 rounded-full backdrop-blur-md font-bold text-sm shadow-xl flex items-center gap-2 whitespace-nowrap animate-bounce">
              <Download size={18} />
              اضغط مطولاً لحفظ الشهادة
            </div>
          </div>
        ) : (
          <div className="shadow-2xl rounded-2xl overflow-hidden transform scale-95 sm:scale-100 w-full">
            <div ref={printRef} className="bg-[#020617] text-white p-0 relative overflow-hidden aspect-[4/5] flex flex-col">

              {/* FIX: replaced blur-[80px] (filter: blur) with radial gradients — html2canvas can't render CSS filters on mobile */}
              <div className="absolute inset-0 bg-slate-950"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12)_0%,transparent_70%)] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] translate-y-1/2 -translate-x-1/2"></div>

              {/* FIX: removed backdrop-blur-sm — replaced with opaque bg for html2canvas compatibility */}
              <div className="relative z-10 h-full flex flex-col items-center justify-between p-12 text-center m-4 border border-white/5 rounded-[2rem] bg-slate-900/60">

                <div className="flex flex-col items-center gap-6 mt-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 rotate-3">
                    <CheckCircle2 size={40} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">
                      Certificate
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em]">Of Completion</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
                  <div className="w-full space-y-4">
                    <p className="text-slate-400 font-serif italic text-sm opacity-80">Presented to</p>
                    {/* FIX: replaced bg-clip-text text-transparent gradient with solid color — gradient text renders invisible in html2canvas on mobile */}
                    <h2 className="text-4xl font-bold text-emerald-300 font-quran py-2">
                      {username || 'Guest User'}
                    </h2>
                  </div>

                  <div className="w-12 h-px bg-white/10"></div>

                  <div className="space-y-2">
                    <p className="text-slate-300 font-serif text-sm leading-relaxed max-w-[200px] mx-auto opacity-90">
                      For successfully completing the recitation of the
                    </p>
                    <p className="text-2xl font-bold text-white font-serif tracking-wide">
                      Holy Quran
                    </p>
                  </div>
                </div>

                <div className="w-full flex justify-between items-end border-t border-white/10 pt-6">
                  <div className="text-left">
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Date</p>
                    <p className="text-xs font-mono text-emerald-400">{date}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mb-1">
                      <Award size={12} className="text-amber-500" />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Noor App</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>

      {!generatedImageUrl && (
        <button
          onClick={generateImage}
          disabled={isGenerating}
          className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full flex items-center gap-3 hover:bg-emerald-50 active:scale-95 transition-all shadow-xl"
        >
          {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          <span>حفظ الشهادة</span>
        </button>
      )}
    </div>
  );
};
