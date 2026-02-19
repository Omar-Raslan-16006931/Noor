
import React, { useRef, useState, useEffect } from 'react';
import { X, Share2, Loader2, Trophy, Award, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CompletionModalProps {
  onClose: () => void;
  username?: string;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ onClose, username }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [date] = useState(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));

  const handleShare = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);

    let clone: HTMLElement | null = null;

    try {
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
      const width = 1080;
      const height = 1350;
      
      const original = printRef.current;
      clone = original.cloneNode(true) as HTMLElement;
      
      Object.assign(clone.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: `${width}px`,
        height: `${height}px`,
        zIndex: '-9999',
        transform: 'none',
        borderRadius: '0',
        margin: '0',
      });
      
      document.body.appendChild(clone);
      
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(clone, {
        scale: 1.5,
        backgroundColor: '#020617', 
        useCORS: true,
        width: width,
        height: height,
        logging: false,
      });

      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
        clone = null;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob generation failed');
        const file = new File([blob], 'quran-completion.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Quran Completion',
            text: 'Alhamdulillah, I have completed reading the Holy Quran using Noor App.'
          });
        } else {
            const link = document.createElement('a');
            link.download = 'quran-completion.png';
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsGenerating(false);
      }, 'image/png', 1.0);
    } catch (e) {
      if (clone && document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      console.error(e);
      alert('Failed to share image');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute top-4 right-4 z-50">
         <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
            <X size={24} />
         </button>
      </div>

      <div className="max-w-sm w-full relative mb-6 shadow-2xl rounded-sm overflow-hidden transform scale-95 sm:scale-100 transition-transform">
         {/* Capture Area */}
         <div ref={printRef} className="bg-[#020617] text-white p-0 relative overflow-hidden aspect-[4/5] flex flex-col">
            {/* Minimal Background */}
            <div className="absolute inset-0 bg-slate-950"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
            
            {/* Subtle Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-12 text-center m-4 border border-white/5 rounded-[2rem] bg-white/[0.02] backdrop-blur-sm">
                
                {/* Header */}
                <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 rotate-3">
                        <CheckCircle2 size={40} className="text-white drop-shadow-md" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-3xl font-serif font-bold text-white tracking-widest uppercase">
                            Certificate
                        </h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em]">Of Completion</p>
                    </div>
                </div>

                {/* Main Body */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8 w-full">
                    <div className="w-full space-y-4">
                        <p className="text-slate-400 font-serif italic text-sm opacity-80">Presented to</p>
                        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-emerald-400 font-quran py-2 drop-shadow-sm">
                            {username || 'Guest User'}
                        </h2>
                    </div>

                    <div className="w-12 h-px bg-white/10"></div>

                    <div className="space-y-2">
                        <p className="text-slate-300 font-serif text-sm leading-relaxed max-w-[200px] mx-auto opacity-90">
                            For successfully completing the recitation of the
                        </p>
                        <p className="text-2xl font-bold text-white font-serif tracking-wide drop-shadow-md">
                            Holy Quran
                        </p>
                    </div>
                </div>

                {/* Footer */}
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

      <button 
        onClick={handleShare}
        disabled={isGenerating}
        className="bg-white text-slate-900 font-bold py-4 px-10 rounded-full flex items-center gap-3 hover:bg-emerald-50 active:scale-95 transition-all shadow-xl"
      >
        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        <span>Share Achievement</span>
      </button>
    </div>
  );
};
