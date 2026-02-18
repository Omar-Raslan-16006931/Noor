import React, { useState, useEffect, useRef } from 'react';
import { Compass, Navigation } from 'lucide-react';

interface QiblaCompassProps {
  latitude: number | null;
  longitude: number | null;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ latitude, longitude }) => {
  const [qiblaBearing, setQiblaBearing] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Kaaba coordinates
  const KAABA_LAT = 21.422487;
  const KAABA_LONG = 39.826206;

  useEffect(() => {
    if (latitude && longitude) {
      const bearing = calculateQibla(latitude, longitude);
      setQiblaBearing(bearing);
    }
  }, [latitude, longitude]);

  const calculateQibla = (lat: number, lng: number) => {
    const phiK = (KAABA_LAT * Math.PI) / 180.0;
    const lambdaK = (KAABA_LONG * Math.PI) / 180.0;
    const phi = (lat * Math.PI) / 180.0;
    const lambda = (lng * Math.PI) / 180.0;
    
    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    
    let result = (Math.atan2(y, x) * 180.0) / Math.PI;
    return (result + 360) % 360;
  };

  const startCompass = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('تم رفض إذن الوصول للحساسات.');
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
    
    // iOS (webkitCompassHeading) vs Android (alpha)
    if ((e as any).webkitCompassHeading) {
      heading = (e as any).webkitCompassHeading;
    } else if (e.alpha !== null) {
      // Android standard: alpha is 0 at North but counter-clockwise. 
      // Need to adjust to standard compass heading (0 = N, 90 = E, clockwise)
      heading = 360 - e.alpha; 
    }
    
    setDeviceHeading(heading);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const diff = (qiblaBearing - deviceHeading + 360) % 360;
  const isAligned = diff < 5 || diff > 355; // Within 5 degrees

  return (
    <div className="flex flex-col items-center justify-center h-full pt-10 pb-24">
      <h2 className="text-2xl font-bold text-white mb-2">القبلة</h2>
      <p className="text-slate-400 text-sm mb-8">
        {latitude ? 'قم بتدوير هاتفك حتى يضيء المؤشر باللون الأخضر' : 'جاري تحديد الموقع...'}
      </p>

      {!permissionGranted ? (
        <button 
          onClick={startCompass}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-lg shadow-emerald-900/50 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Compass size={24} />
          <span>تفعيل البوصلة</span>
        </button>
      ) : (
        <div className="relative w-72 h-72">
          {/* Static Compass Dial */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-slate-700 bg-slate-900/50 backdrop-blur-md shadow-2xl transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${-deviceHeading}deg)` }}
          >
             {/* Cardinals */}
             <div className="absolute top-2 left-1/2 -translate-x-1/2 text-slate-500 font-bold">N</div>
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-500 font-bold">S</div>
             <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">E</div>
             <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 font-bold">W</div>

             {/* Kaaba Indicator */}
             <div 
                className="absolute top-1/2 left-1/2 w-1 h-[45%] origin-bottom rounded-full transition-colors duration-300"
                style={{ 
                  transform: `translate(-50%, -100%) rotate(${qiblaBearing}deg)`,
                  backgroundColor: isAligned ? '#10b981' : '#f59e0b',
                  boxShadow: isAligned ? '0 0 20px #10b981' : 'none'
                }}
             >
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isAligned ? 'text-emerald-400' : 'text-amber-500'}`}>
                   <div className="bg-black/80 p-1 rounded-full border border-current">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Center Phone Graphic */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-2 h-2 bg-white rounded-full z-10 shadow-lg"></div>
             <div className="w-64 h-64 rounded-full border border-white/5"></div>
             <div className="w-48 h-48 rounded-full border border-white/5"></div>
          </div>
        </div>
      )}

      {permissionGranted && (
        <div className="mt-12 text-center">
           <div className={`text-4xl font-mono font-bold ${isAligned ? 'text-emerald-400' : 'text-slate-200'}`}>
             {Math.round(qiblaBearing)}°
           </div>
           <p className="text-xs text-slate-500 mt-1">اتجاه مكة المكرمة</p>
           {isAligned && <p className="text-emerald-400 font-bold mt-2 animate-bounce">أنت متجه للقبلة الآن</p>}
        </div>
      )}
      
      {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
    </div>
  );
};
