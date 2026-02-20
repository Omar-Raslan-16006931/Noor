import React, { useState, useEffect } from 'react';
import { RotateCcw, Activity, Settings } from 'lucide-react';

export const TasbihCounter: React.FC = () => {
  const [count, setCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('tasbih_count') || '0');
    } catch { return 0; }
  });
  
  const [target, setTarget] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('tasbih_target') || '33');
    } catch { return 33; }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('tasbih_sound') === 'true';
  });

  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    // Default to true if not set
    const stored = localStorage.getItem('tasbih_vibration');
    return stored === null ? true : stored === 'true';
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Persist state
  useEffect(() => {
    localStorage.setItem('tasbih_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbih_target', target.toString());
  }, [target]);

  useEffect(() => {
    localStorage.setItem('tasbih_sound', soundEnabled.toString());
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('tasbih_vibration', vibrationEnabled.toString());
  }, [vibrationEnabled]);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    
    // Haptic feedback
    if (vibrationEnabled && navigator.vibrate) {
      if (newCount % target === 0) {
        navigator.vibrate([100, 50, 100]); // Long vibration on target
      } else {
        navigator.vibrate(15); // Short tick
      }
    }
  };

  const confirmReset = () => {
    setCount(0);
    setShowResetConfirm(false);
    if (vibrationEnabled && navigator.vibrate) navigator.vibrate(50);
  };

  const progress = Math.min((count % target) / target * 100, 100);
  const cycles = Math.floor(count / target);

  return (
    <div className="flex flex-col h-full space-y-4 pb-20 relative">
      {/* Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-xs w-full mx-4 transform scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2 text-center">تصفير العداد</h3>
            <p className="text-slate-400 text-sm text-center mb-6">هل أنت متأكد من رغبتك في تصفير العداد؟</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmReset}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                تصفير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-bold text-white font-serif">المسبحة الإلكترونية</h2>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full bg-slate-800/50 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass-panel p-4 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-200">
          <h3 className="text-sm font-bold text-emerald-400 mb-3">الإعدادات</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">الهدف (عدد التسبيحات)</span>
              <div className="flex gap-2">
                {[33, 99, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => setTarget(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      target === val 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">الاهتزاز</span>
              <button
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  vibrationEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-500'
                }`}
              >
                <Activity size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Display */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative group cursor-pointer" onClick={handleIncrement}>
          {/* Outer Glow Ring */}
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
          
          {/* Main Circle */}
          <div className="relative w-64 h-64 rounded-full glass-card flex flex-col items-center justify-center border-4 border-slate-700/50 shadow-2xl active:scale-95 transition-transform duration-100 select-none">
            
            {/* Progress Ring SVG */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeDasharray="753.98" // 2 * pi * 120
                strokeDashoffset={753.98 - (753.98 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            <div className="z-10 flex flex-col items-center">
              <span className="text-6xl font-bold text-white font-mono tracking-tighter mb-2">
                {count}
              </span>
              <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">
                تسبيحة
              </span>
            </div>
          </div>
        </div>

        {/* Stats / Info */}
        <div className="mt-8 flex gap-4 text-center w-full max-w-xs px-4">
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
            <p className="text-xs text-slate-400 mb-1 font-bold">الدورات المكتملة</p>
            <p className="text-2xl font-bold text-white font-mono">{cycles}</p>
          </div>
          <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg">
            <p className="text-xs text-slate-400 mb-1 font-bold">الهدف الحالي</p>
            <p className="text-2xl font-bold text-white font-mono">{target}</p>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95"
        >
          <RotateCcw size={18} />
          <span className="font-bold text-sm">تصفير العداد</span>
        </button>
      </div>
    </div>
  );
};
