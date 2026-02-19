
import React, { useRef, useState, useEffect } from 'react';
import { X, Share2, Loader2, Trophy, Star, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabaseClient';

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
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
      
      // Define target high-res dimensions (1080px width, 4:5 aspect ratio)
      const width = 1080;
      const height = 1350;
      
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
      
      document.body.appendChild(clone);
      
      // Wait for clone to render
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
        width: width,
        height: height,
      });

      // Cleanup
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
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900"></div>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]"></div>

            <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 text-center border-[8px] border-double border-amber-500/20 m-4">
                
                <div className="flex flex-col items-center gap-4 mt-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                        <Trophy size={40} className="text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-serif font-bold text-amber-100 tracking-wider">CERTIFICATE</h1>
                        <p className="text-[10px] text-amber-500/80 uppercase tracking-[0.3em]">OF COMPLETION</p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
                    <p className="text-slate-400 font-serif italic text-sm">This is to certify that</p>
                    
                    <div className="relative py-2 px-8 border-b border-white/20">
                        <h2 className="text-3xl font-bold text-white font-quran">{username || 'Guest User'}</h2>
                        <Star size={16} className="absolute -top-2 -right-2 text-amber-400 fill-amber-400 animate-pulse" />
                    </div>

                    <p className="text-slate-300 font-serif leading-relaxed text-sm">
                        Has successfully completed the recitation of the<br/>
                        <span className="text-emerald-400 font-bold text-lg">Holy Quran</span>
                    </p>
                </div>

                <div className="w-full flex justify-between items-end border-t border-white/10 pt-6 mt-4">
                    <div className="text-left">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Date</p>
                        <p className="text-xs font-mono text-emerald-400">{date}</p>
                    </div>
                    <div className="text-right">
                         <div className="flex items-center justify-end gap-1 mb-1">
                             <Award size={14} className="text-amber-500" />
                             <span className="text-[10px] text-slate-500 uppercase tracking-wider">Noor App</span>
                         </div>
                         <p className="text-[10px] text-slate-600">Spiritual Assistant</p>
                    </div>
                </div>

            </div>
         </div>
      </div>

      <button 
        onClick={handleShare}
        disabled={isGenerating}
        className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full flex items-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all shadow-lg shadow-white/10"
      >
        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
        <span>Share Achievement</span>
      </button>
    </div>
  );
};
