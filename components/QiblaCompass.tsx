import React, { useState, useEffect } from 'react';
import { Compass, AlertTriangle, Crosshair } from 'lucide-react';

interface QiblaCompassProps {
  latitude: number | null;
  longitude: number | null;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ latitude, longitude }) => {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isAbsolute, setIsAbsolute] = useState<boolean>(false);

  // Exact WGS-84 Coordinates of the Kaaba
  const KAABA_LAT = 21.422487;
  const KAABA_LONG = 39.826206;

  useEffect(() => {
    if (latitude && longitude) {
      // Rigorous Spherical Trigonometry Formula (Haversine-based) for exact Earth curvature bearing
      const phiK = (KAABA_LAT * Math.PI) / 180.0;
      const lambdaK = (KAABA_LONG * Math.PI) / 180.0;
      const phi = (latitude * Math.PI) / 180.0;
      const lambda = (longitude * Math.PI) / 180.0;
      
      const y = Math.sin(lambdaK - lambda) * Math.cos(phiK);
      const x = Math.cos(phi) * Math.sin(phiK) - Math.sin(phi) * Math.cos(phiK) * Math.cos(lambdaK - lambda);
      
      let bearing = (Math.atan2(y, x) * 180.0) / Math.PI;
      setQiblaBearing((bearing + 360) % 360);
    }
  }, [latitude, longitude]);

  const startCompass = async () => {
    // 1. iOS Safari Permission Request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('تم رفض إذن الوصول للبوصلة. يرجى تفعيلها من إعدادات Safari.');
        }
      } catch (e) {
        setError('حدث خطأ أثناء طلب إذن البوصلة.');
      }
    } else {
      // 2. Android / Other Browsers
      setPermissionGranted(true);
      
      // FORCE Absolute Orientation on Android (queries actual Magnetometer, not relative position)
      if ('ondeviceorientationabsolute' in window) {
        window.addEventListener('deviceorientationabsolute', handleOrientation);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    }
  };

  const handleOrientation = (e: any) => {
    let heading = 0;
    
    if (typeof e.webkitCompassHeading !== 'undefined') {
      // iOS provides highly accurate True North via this property
      heading = e.webkitCompassHeading;
      setIsAbsolute(true);
    } else if (e.absolute === true || e.type === 'deviceorientationabsolute') {
      // Android Hardware Magnetometer (Absolute North)
      heading = 360 - e.alpha; 
      setIsAbsolute(true);
    } else if (e.alpha !== null) {
      // Fallback: If device lacks absolute sensors, try standard alpha
      heading = 360 - e.alpha;
    }
    
    setDeviceHeading(heading);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if ('ondeviceorientationabsolute' in window) {
         window.removeEventListener('deviceorientationabsolute', handleOrientation);
      }
    };
  }, []);

  const diff = Math.abs((qiblaBearing - deviceHeading + 360) % 360);
  const isAligned = diff < 3 || diff > 357; // Ultra-strict 3-degree alignment window

  return (
    <div className="flex flex-col items-center justify-center h-full pt-2 pb-16 w-full overflow-x-hidden px-2">
      
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold font-quran text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 drop-shadow-lg mb-1">
          اتجاه القبلة
        </h2>
        <p className="text-amber-100/60 text-[10px] px-4">
          أدق حساب للزاوية بناءً على إحداثيات GPS وحساسات الجهاز
        </p>
      </div>

      {!latitude && (
         <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-[10px] px-4 py-2 rounded-lg flex items-center gap-2 mb-4 animate-pulse">
            <AlertTriangle size={14} className="text-red-400" />
            تأكد من تفعيل الموقع (GPS) للحصول على زاوية صحيحة 100%
         </div>
      )}

      {!permissionGranted ? (
        <button 
          onClick={startCompass}
          className="relative overflow-hidden group bg-gradient-to-br from-amber-600 to-amber-800 text-white px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(217,119,6,0.3)] flex items-center gap-3 transition-all active:scale-95 border border-amber-500/30 mt-8"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20 mix-blend-overlay"></div>
          <Compass size={24} className="relative z-10 group-hover:rotate-180 transition-transform duration-700" />
          <span className="relative z-10 font-bold tracking-wider">تفعيل البوصلة الدقيقة</span>
        </button>
      ) : (
        <div className="relative flex flex-col items-center w-full mt-4">
            
            {/* The Compass Gauge Container */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
              
              {/* Outer Alignment Glow */}
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isAligned ? 'bg-emerald-500/20 shadow-[0_0_80px_rgba(16,185,129,0.5)] scale-105' : 'bg-transparent scale-100'}`}></div>

              {/* Rotating Instrument Dial */}
              <div 
                className="absolute inset-2 rounded-full transition-transform duration-200 ease-out"
                style={{ transform: `rotate(${-deviceHeading}deg)` }}
              >
                 {/* Main Plate */}
                 <div className="absolute inset-0 rounded-full bg-slate-950 border-4 border-slate-800 shadow-[inset_0_0_50px_rgba(0,0,0,1)]"></div>

                 {/* 360 Degree Ticks Generator */}
                 {Array.from({ length: 72 }).map((_, i) => {
                    const deg = i * 5; // Tick every 5 degrees
                    const isMain = deg % 30 === 0; // Large tick every 30 degrees
                    return (
                        <div key={i} className="absolute inset-1 flex justify-center" style={{ transform: `rotate(${deg}deg)` }}>
                            <div className={`w-[1.5px] rounded-full ${isMain ? 'h-3 bg-amber-400/80 mt-1' : 'h-1.5 bg-slate-600 mt-1'}`}></div>
                            {isMain && deg !== 0 && deg !== 90 && deg !== 180 && deg !== 270 && (
                                <span className="absolute top-5 text-[8px] font-mono text-slate-500 font-bold">{deg}</span>
                            )}
                        </div>
                    );
                 })}

                 {/* Cardinal Directions */}
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 text-amber-500 font-serif font-black text-sm drop-shadow-md">N</div>
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-400 font-serif font-bold text-xs rotate-180">S</div>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold text-xs rotate-90">E</div>
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-serif font-bold text-xs -rotate-90">W</div>

                 {/* Inner Decorative Ring */}
                 <div className="absolute inset-12 rounded-full border border-dashed border-white/10 bg-slate-900/50"></div>

                 {/* Target Qibla Indicator Line */}
                 <div 
                    className="absolute top-0 left-1/2 w-0.5 h-1/2 origin-bottom transition-transform duration-300 z-20"
                    style={{ transform: `translateX(-50%) rotate(${qiblaBearing}deg)` }}
                 >
                    {/* The Kaaba Icon precisely on the target degree */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                       <div className={`w-9 h-9 flex items-center justify-center rounded-lg bg-slate-900 border-2 transition-all duration-300 ${isAligned ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-125' : 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] scale-100'}`}>
                          <div className="w-4 h-4.5 bg-black relative rounded-sm border-t-2 border-amber-400">
                             <div className="absolute top-0 right-0 w-[1.5px] h-2 bg-amber-400/80"></div>
                          </div>
                       </div>
                    </div>

                    {/* Beam to Center */}
                    <div className={`absolute top-6 bottom-0 left-1/2 -translate-x-1/2 w-[2px] transition-colors duration-300 ${isAligned ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-gradient-to-b from-amber-500 to-transparent'}`}></div>
                 </div>
              </div>

              {/* Center Pivot Point */}
              <div className="absolute z-30 flex items-center justify-center pointer-events-none">
                 <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center shadow-2xl">
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                 </div>
              </div>

              {/* Fixed Phone Heading Indicator (Red/Green Crosshair pointing to the physical top of the phone) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-40 pointer-events-none flex flex-col items-center">
                 <div className={`w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent transition-colors duration-300 ${isAligned ? 'border-b-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,1)]' : 'border-b-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`}></div>
              </div>
            </div>

            {/* Precision Readout Dashboard */}
            <div className="mt-8 w-full max-w-xs grid grid-cols-2 gap-3">
               
               {/* Device Current Heading */}
               <div className="bg-slate-900/80 border border-white/10 rounded-xl p-3 flex flex-col items-center shadow-lg">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                     <Compass size={10} />
                     اتجاه هاتفك
                  </span>
                  <span className="text-xl font-mono font-bold text-white tracking-wider">
                     {deviceHeading.toFixed(1)}°
                  </span>
               </div>

               {/* Target Qibla Bearing */}
               <div className="bg-slate-900/80 border border-amber-500/20 rounded-xl p-3 flex flex-col items-center shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/5"></div>
                  <span className="text-[9px] text-amber-500/80 font-bold uppercase tracking-widest mb-1 flex items-center gap-1 relative z-10">
                     <Crosshair size={10} />
                     زاوية الكعبة
                  </span>
                  <span className="text-xl font-mono font-bold text-amber-400 tracking-wider relative z-10">
                     {qiblaBearing.toFixed(1)}°
                  </span>
               </div>
            </div>

            {/* Alignment Status */}
            <div className="h-10 mt-4 flex items-center justify-center w-full">
               {isAligned ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-sm font-bold px-6 py-2 rounded-full animate-bounce flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                     مضبوط 100% على القبلة
                  </div>
               ) : (
                  <p className="text-slate-400 text-xs flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                     قم بالدوران حتى يتطابق اتجاه هاتفك مع الكعبة
                  </p>
               )}
            </div>

            {/* Sensor Warning */}
            {!isAbsolute && permissionGranted && (
               <p className="text-[8px] text-slate-600 mt-4 text-center max-w-[250px]">
                  ملاحظة: جهازك لا يدعم حساس المغناطيسية المطلق (Absolute Magnetometer). المعايرة قد تكون تقريبية. يرجى تحريك الهاتف بشكل رقم 8 للمعايرة.
               </p>
            )}

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