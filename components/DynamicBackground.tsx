import React, { useEffect, useState, useMemo } from 'react';

interface DynamicBackgroundProps {
  fajrTime?: string; // HH:MM
  sunriseTime?: string; // HH:MM
  maghribTime?: string; // HH:MM
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ 
  fajrTime = "05:00", 
  sunriseTime = "06:30",
  maghribTime = "18:00" 
}) => {
  const [phase, setPhase] = useState<'sunrise' | 'day' | 'maghrib' | 'night'>('day');

  // Define static gradients for each phase
  const GRADIENTS = {
    sunrise: 'bg-gradient-to-b from-slate-900 via-[#4c1d95] to-[#f97316]',
    day: 'bg-gradient-to-b from-[#0f172a] via-[#0369a1] to-[#38bdf8]',
    maghrib: 'bg-gradient-to-b from-[#172554] via-[#312e81] to-[#d97706]',
    night: 'bg-gradient-to-b from-black via-slate-950 to-[#0f172a]',
  };

  useEffect(() => {
    const calculatePhase = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Parse Times to Minutes
      const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };

      const fMinutes = parseTime(fajrTime);
      const sMinutes = parseTime(sunriseTime);
      const mMinutes = parseTime(maghribTime);

      // Phase Windows
      // 1. Maghrib: 20 mins before -> 45 mins after
      const maghribStart = mMinutes - 20;
      const maghribEnd = mMinutes + 45;

      // 2. Sunrise: 20 mins before actual Sunrise -> 2 hours after
      const sunriseStart = sMinutes - 20;
      const sunriseEnd = sMinutes + 120;

      // Logic with day boundary handling
      // We assume standard day ordering since these are daily times
      
      if (currentMinutes >= maghribStart && currentMinutes < maghribEnd) {
        setPhase('maghrib');
      } 
      else if (currentMinutes >= sunriseStart && currentMinutes < sunriseEnd) {
        setPhase('sunrise');
      } 
      else if (currentMinutes >= sunriseEnd && currentMinutes < maghribStart) {
        setPhase('day');
      } 
      else {
        setPhase('night');
      }
    };

    // Run immediately and every minute
    calculatePhase();
    const interval = setInterval(calculatePhase, 10000); // Check every 10s for responsiveness
    return () => clearInterval(interval);
  }, [fajrTime, sunriseTime, maghribTime]);

  // Generate static star properties once per session
  const stars = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: `star-${i}`,
      top: `${Math.random() * 60}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.7 + 0.3,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`
    }));
  }, []);

  // Visual Configuration
  const isMaghrib = phase === 'maghrib';
  const isSunrise = phase === 'sunrise';
  const isDay = phase === 'day';
  const isNight = phase === 'night';
  
  // Sun/Moon Position
  const sunTop = isDay ? '15%' : isSunrise ? '70%' : isMaghrib ? '75%' : '110%';
  const sunLeft = isSunrise ? '20%' : isMaghrib ? '80%' : isDay ? '80%' : '50%';
  
  // Sun/Moon Color
  const sunColor = isMaghrib 
    ? 'bg-amber-500/80 shadow-[0_0_100px_rgba(245,158,11,0.6)]' // Sunset Orange
    : isSunrise 
      ? 'bg-orange-400/80 shadow-[0_0_80px_rgba(251,146,60,0.6)]' // Sunrise Peach
      : 'bg-yellow-100/90 shadow-[0_0_120px_rgba(255,255,255,0.6)]'; // Day White/Yellow

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-900">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes drift {
          from { transform: translateX(-150vw); }
          to { transform: translateX(150vw); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* 1. Background Layers (Cross-fading) */}
      {Object.entries(GRADIENTS).map(([key, gradientClass]) => (
        <div 
          key={key}
          className={`absolute inset-0 transition-opacity duration-[5000ms] ease-in-out ${gradientClass} ${phase === key ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* 2. Global Readability Overlay (Vignette) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none z-10"></div>

      {/* 3. Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-[0.05] pointer-events-none z-10"></div>
      
      {/* 4. Stars (Night & Maghrib) */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[3000ms] ${isNight || isMaghrib ? 'opacity-100' : 'opacity-0'}`}>
          {stars.map((star) => (
             <div 
               key={star.id}
               className="absolute rounded-full bg-white shadow-[0_0_2px_#fff]"
               style={{
                 top: star.top,
                 left: star.left,
                 width: star.width,
                 height: star.height,
                 opacity: star.opacity,
                 animation: `twinkle ${star.animationDuration} infinite ease-in-out`,
                 animationDelay: star.animationDelay
               }}
             ></div>
          ))}
          {/* Moon for Night */}
          <div className={`absolute top-12 right-8 w-24 h-24 rounded-full bg-slate-100 shadow-[0_0_60px_rgba(255,255,255,0.4)] opacity-90 blur-[2px] transition-transform duration-[5000ms] ${isNight ? 'translate-y-0' : '-translate-y-40'}`}>
                <div className="absolute w-full h-full rounded-full bg-slate-200 opacity-20" style={{ transform: 'translateX(-4px)' }}></div>
          </div>
      </div>

      {/* 5. Sun (Day, Sunrise, Maghrib) */}
      <div 
        className={`absolute w-32 h-32 rounded-full transition-all duration-[5000ms] ease-in-out blur-xl ${sunColor} ${isNight ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
            top: sunTop, 
            left: sunLeft,
            transform: 'translate(-50%, -50%)'
        }}
      ></div>

    {/* 6. Clouds (Fewer, Slower, and Blurrier - with Night Mode) */}
      <div className="absolute inset-0 pointer-events-none">
          
          {/* Cloud 1 - Midground (Visible Day & Faint at Night) */}
          <div className={`absolute top-[15%] animate-[drift_150s_linear_infinite] transition-opacity duration-[5000ms] ${isNight ? 'opacity-10' : 'opacity-100'}`} style={{ animationDelay: '-10s' }}>
              <svg viewBox="0 0 24 24" className="w-32 h-auto fill-white/20 blur-[4px]"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.31-1.748-4.217-4.004-4.46A6.98 6.98 0 0011 4a6.98 6.98 0 00-6.996 6.04A4.5 4.5 0 005.5 19h12z"/></svg>
          </div>

          {/* Cloud 2 - Background (Largest, Slowest - Visible Day & Faint at Night) */}
          <div className={`absolute top-[25%] animate-[drift_200s_linear_infinite] transition-opacity duration-[5000ms] ${isNight ? 'opacity-10' : 'opacity-100'}`} style={{ animationDelay: '-60s' }}>
              <svg viewBox="0 0 24 24" className="w-48 h-auto fill-white/10 blur-[6px]"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.31-1.748-4.217-4.004-4.46A6.98 6.98 0 0011 4a6.98 6.98 0 00-6.996 6.04A4.5 4.5 0 005.5 19h12z"/></svg>
          </div>

          {/* Cloud 3 - Foreground (Smallest, Fastest - Hides completely at Night) */}
          <div className={`absolute top-[10%] animate-[drift_110s_linear_infinite] transition-opacity duration-[5000ms] ${isNight ? 'opacity-0' : 'opacity-100'}`} style={{ animationDelay: '-30s' }}>
              <svg viewBox="0 0 24 24" className="w-24 h-auto fill-white/30 blur-[3px]"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.31-1.748-4.217-4.004-4.46A6.98 6.98 0 0011 4a6.98 6.98 0 00-6.996 6.04A4.5 4.5 0 005.5 19h12z"/></svg>
          </div>

          {/* Cloud 4 - Lower Midground (Hides completely at Night) */}
          <div className={`absolute top-[35%] animate-[drift_180s_linear_infinite] transition-opacity duration-[5000ms] ${isNight ? 'opacity-0' : 'opacity-100'}`} style={{ animationDelay: '-90s' }}>
              <svg viewBox="0 0 24 24" className="w-28 h-auto fill-white/15 blur-[5px]"><path d="M17.5 19c2.485 0 4.5-2.015 4.5-4.5 0-2.31-1.748-4.217-4.004-4.46A6.98 6.98 0 0011 4a6.98 6.98 0 00-6.996 6.04A4.5 4.5 0 005.5 19h12z"/></svg>
          </div>
          
      
          
      </div>

      {/* 7. Ambient Atmosphere Glows */}
      <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t transition-opacity duration-[3000ms] from-orange-500/20 to-transparent blur-3xl ${isSunrise ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t transition-opacity duration-[3000ms] from-amber-600/20 to-transparent blur-3xl ${isMaghrib ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
};