import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

interface QiblaCompassProps {
  latitude: number | null;
  longitude: number | null;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ latitude, longitude }) => {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (latitude && longitude) {
      const bearing = calculateQibla(latitude, longitude);
      setQiblaBearing(bearing);
    }
  }, [latitude, longitude]);

  // 1000% Precise Spherical Trigonometry Formula for exact Earth curvature bearing
  const calculateQibla = (lat: number, lng: number) => {
    // Exact WGS84 Coordinates of the Kaaba
    const KAABA_LAT = 21.422487;
    const KAABA_LONG = 39.826206;

    const phi1 = (lat * Math.PI) / 180.0;
    const phi2 = (KAABA_LAT * Math.PI) / 180.0;
    const lambda1 = (lng * Math.PI) / 180.0;
    const lambda2 = (KAABA_LONG * Math.PI) / 180.0;
    const dLambda = lambda2 - lambda1;

    const y = Math.sin(dLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);

    let bearing = (Math.atan2(y, x) * 180.0) / Math.PI;
    return (bearing + 360) % 360;
  };

  const startCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('تم رفض إذن الوصول للحساسات. يرجى تفعيلها من إعدادات المتصفح.');
        }
      } catch (e) {
        setError('حدث خطأ أثناء طلب الأذن.');
      }
    } else {
      // Non-iOS 13+ devices
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation);
    }
  };

  const handleOrientation = (e: DeviceOrientationEvent) => {
    let heading = 0;
    
    // iOS (webkitCompassHeading) gives True North. Android (alpha) gives relative/magnetic.
    if (typeof (e as any).webkitCompassHeading !== 'undefined') {
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android standard adjustment
      heading = 360 - e.alpha; 
    }
    
    setDeviceHeading(heading);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const diff = Math.abs((qiblaBearing - deviceHeading + 360) % 360);
  const isAligned = diff < 4 || diff > 356; // Tightened precision to 4 degrees

  return (
    // Added w-full and overflow-x-hidden to strictly prevent left/right scrolling
    <div className="flex flex-col items-center justify-center h-full pt-2 pb-16 w-full overflow-x-hidden px-2">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold font-quran text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-lg mb-1">
          اتجاه القبلة
        </h2>
        <p className="text-amber-100/60 text-[10px] px-4">
          {latitude ? 'قم بتدوير هاتفك حتى يتطابق المؤشر مع الكعبة' : 'جاري تحديد الموقع الدقيق...'}
        </p>
      </div>

      {!permissionGranted ? (
        <button 
          onClick={startCompass}
          className="relative overflow-hidden group bg-gradient-to-br from-amber-600 to-amber-800 text-white px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(217,119,6,0.3)] flex items-center gap-3 transition-all active:scale-95 border border-amber-500/30 mt-10"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20 mix-blend-overlay"></div>
          <Compass size={24} className="relative z-10 group-hover:rotate-180 transition-transform duration-700" />
          <span className="relative z-10 font-bold tracking-wider">تفعيل البوصلة</span>
        </button>
      ) : (
        <div className="relative flex flex-col items-center w-full max-w-[320px]">
            {/* The Compass Container */}
            <div className="relative w-72 h-72 flex items-center justify-center mt-2">
              
              {/* Outer Alignment Glow Ring */}
              <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${isAligned ? 'bg-emerald-500/20 shadow-[0_0_60px_rgba(16,185,129,0.4)] scale-105' : 'bg-transparent scale-100'}`}></div>

              {/* Rotating Compass Dial */}
              <div 
                className="absolute inset-2 rounded-full transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${-deviceHeading}deg)` }}
              >
                 {/* Ornate Background Frame */}
                 <div className="absolute inset-0 rounded-full bg-slate-900 border-2 border-amber-500/20 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30"></div>
                 </div>

                 {/* Rub el Hizb (8-Pointed Star) Background Pattern */}
                 <div className="absolute inset-5 border border-amber-500/10 rotate-45"></div>
                 <div className="absolute inset-5 border border-amber-500/10"></div>

                 {/* Concentric Rings */}
                 <div className="absolute inset-8 rounded-full border border-dashed border-amber-500/20"></div>
                 <div className="absolute inset-14 rounded-full border border-amber-500/10 bg-black/40 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]"></div>

                 {/* Cardinal Directions */}
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 text-amber-500/80 font-serif font-bold text-[10px] tracking-widest">N</div>
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 font-serif font-bold text-[10px] tracking-widest rotate-180">S</div>
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 font-serif font-bold text-[10px] tracking-widest rotate-90">E</div>
                 <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-serif font-bold text-[10px] tracking-widest -rotate-90">W</div>

                 {/* Qibla Indicator Line & Kaaba Icon */}
                 <div 
                    className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom transition-transform duration-300 z-20"
                    style={{ transform: `translateX(-50%) rotate(${qiblaBearing}deg)` }}
                 >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                       <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 border transition-all duration-500 ${isAligned ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' : 'border-amber-500/50 scale-100'}`}>
                          <div className="w-3.5 h-4 bg-black relative rounded-sm border-t-2 border-amber-400">
                             <div className="absolute top-0 right-0 w-[1.5px] h-1.5 bg-amber-400/80"></div>
                          </div>
                       </div>
                    </div>

                    <div className={`absolute top-5 bottom-3 left-1/2 -translate-x-1/2 w-[1.5px] rounded-full transition-colors duration-500 ${isAligned ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-gradient-to-b from-amber-500 to-transparent opacity-50'}`}></div>
                 </div>
              </div>

              {/* Center Pivot Point */}
              <div className="absolute z-10 flex items-center justify-center pointer-events-none">
                 <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-amber-500/30 flex items-center justify-center shadow-xl shadow-black">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                 </div>
              </div>

              {/* Phone Heading Indicator (Static Top Chevron) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`transition-colors duration-500 ${isAligned ? 'text-emerald-500 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'text-amber-500'}`}>
                    <path d="M12 2L22 20L12 17L2 20L12 2Z" fill="currentColor" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
                 </svg>
              </div>

            </div>

            {/* Readout Display */}
            <div className="mt-8 flex flex-col items-center">
               <div className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl px-8 py-3 text-center shadow-xl min-w-[160px]">
                  <div className={`text-4xl font-mono font-black tracking-tighter transition-colors duration-500 ${isAligned ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-amber-400'}`}>
                    {/* Fixed to 1 decimal place for precision display */}
                    {qiblaBearing.toFixed(1)}°
                  </div>
                  <div className="w-10 h-px bg-white/10 mx-auto my-1.5"></div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">الزاوية الدقيقة</div>
               </div>

               {/* Alignment Message */}
               <div className="h-6 mt-3 flex items-center justify-center">
                  {isAligned ? (
                     <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold px-4 py-1.5 rounded-full animate-pulse flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        أنت متجه للقبلة الآن
                     </div>
                  ) : (
                     <p className="text-amber-500/60 text-[11px] font-medium">قم بالدوران لليمين أو اليسار</p>
                  )}
               </div>
            </div>
        </div>
      )}
      
      {error && (
         <div className="mt-4 bg-red-950/50 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center max-w-xs">
            {error}
         </div>
      )}
    </div>
  );
};