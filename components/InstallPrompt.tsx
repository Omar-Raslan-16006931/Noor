
import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    
    // Detect Safari (exclude Chrome/others on iOS)
    const isSafari = userAgent.includes('safari') && !userAgent.includes('crios') && !userAgent.includes('fxios');
    
    // Detect if already installed (standalone mode)
    const isStandalone = (window as any).navigator.standalone === true;

    // Wait a bit before showing to not annoy immediately
    const timer = setTimeout(() => {
        if (isIOS && isSafari && !isStandalone) {
            const isDismissed = localStorage.getItem('install_prompt_dismissed');
            // Check session expiry for dismissal (e.g., show again after a few days? For now just simple dismiss)
            if (!isDismissed) {
                setShow(true);
            }
        }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('install_prompt_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500 dir-rtl">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 p-5 rounded-2xl shadow-2xl relative">
        <button 
            onClick={dismiss}
            className="absolute top-2 left-2 text-slate-400 hover:text-white p-1"
        >
            <X size={18} />
        </button>
        
        <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-emerald-800 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                <span className="text-white font-serif font-bold text-2xl">ن</span>
            </div>
            <div className="flex-1">
                <h3 className="text-white font-bold text-sm mb-1">تثبيت تطبيق نور</h3>
                <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    للحصول على تجربة كاملة بدون شريط المتصفح، أضف التطبيق للشاشة الرئيسية.
                </p>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-white/5 p-2 rounded-lg">
                        <Share size={16} />
                        <span>1. اضغط على زر المشاركة في الأسفل</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-white/5 p-2 rounded-lg">
                        <PlusSquare size={16} />
                        <span>2. اختر "إضافة إلى الصفحة الرئيسية"</span>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Pointer Arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-b border-r border-emerald-500/30 rotate-45 transform"></div>
      </div>
    </div>
  );
};
