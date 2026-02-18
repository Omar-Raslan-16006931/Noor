import React, { useEffect, useState } from 'react';

interface DynamicBackgroundProps {
  sunriseTime?: string; // HH:MM format
  sunsetTime?: string; // HH:MM format
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ 
  sunriseTime = "06:00", 
  sunsetTime = "18:00" 
}) => {
  const [timeState, setTimeState] = useState({
    percentage: 0, // 0 to 100 representing position in the day (0=sunrise, 50=noon, 100=sunset)
    isDay: true,
    phase: 'day' as 'dawn' | 'day' | 'dusk' | 'night'
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [srH, srM] = sunriseTime.split(':').map(Number);
      const [ssH, ssM] = sunsetTime.split(':').map(Number);
      
      const srMinutes = srH * 60 + srM;
      const ssMinutes = ssH * 60 + ssM;

      let isDay = currentMinutes >= srMinutes && currentMinutes < ssMinutes;
      let percentage = 0;
      let phase: 'dawn' | 'day' | 'dusk' | 'night' = 'night';

      if (isDay) {
        const totalDayMinutes = ssMinutes - srMinutes;
        const elapsed = currentMinutes - srMinutes;
        percentage = (elapsed / totalDayMinutes) * 100;

        if (percentage < 15) phase = 'dawn';
        else if (percentage > 85) phase = 'dusk';
        else phase = 'day';
      } else {
        // Night logic
        phase = 'night';
        // Calculate night percentage for moon?
        // Keep simple for now: Moon roughly opposite to sun
        // If it's night, we can just position moon high
        percentage = 50; 
      }

      setTimeState({ percentage, isDay, phase });
    };

    const interval = setInterval(calculateTime, 1000 * 60); // Update every minute
    calculateTime();
    return () => clearInterval(interval);
  }, [sunriseTime, sunsetTime]);

  // Styles based on phase
  const getGradient = () => {
    switch (timeState.phase) {
      case 'dawn':
        return 'from-indigo-900 via-purple-800 to-orange-400';
      case 'day':
        return 'from-sky-400 via-sky-300 to-sky-100';
      case 'dusk':
        return 'from-slate-900 via-purple-900 to-orange-500';
      case 'night':
        return 'from-slate-950 via-slate-900 to-slate-950';
      default:
        return 'from-slate-900 to-slate-800';
    }
  };

  const sunPositionBottom = timeState.isDay 
    ? Math.sin((timeState.percentage / 100) * Math.PI) * 70 // Arc path
    : -20; // Hidden

  const sunPositionLeft = timeState.isDay 
    ? timeState.percentage 
    : 50;

  return (
    <div className={`fixed inset-0 z-0 transition-all duration-[2000ms] bg-gradient-to-b ${getGradient()} overflow-hidden`}>
      
      {/* Stars (Night only) */}
      <div className={`absolute inset-0 stars transition-opacity duration-1000 ${timeState.phase === 'night' ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Sun */}
      <div 
        className="absolute w-24 h-24 rounded-full blur-xl bg-amber-300 transition-all duration-[2000ms] ease-linear opacity-60"
        style={{ 
          bottom: `${sunPositionBottom + 10}%`, 
          left: `${sunPositionLeft}%`,
          transform: 'translateX(-50%)',
          display: timeState.isDay ? 'block' : 'none'
        }}
      ></div>
      <div 
        className="absolute w-16 h-16 rounded-full bg-amber-100 shadow-[0_0_60px_rgba(252,211,77,0.8)] transition-all duration-[2000ms] ease-linear"
        style={{ 
          bottom: `${sunPositionBottom + 10}%`, 
          left: `${sunPositionLeft}%`,
          transform: 'translateX(-50%)',
          display: timeState.isDay ? 'block' : 'none'
        }}
      ></div>

      {/* Moon (Night only) */}
      <div 
        className={`absolute top-20 right-10 w-16 h-16 rounded-full bg-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-1000 ${timeState.phase === 'night' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="absolute w-full h-full rounded-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* Landscape Silhouette (Mountains/Dunes) */}
      <div className="absolute bottom-0 left-0 right-0 h-48 md:h-64 transition-colors duration-[2000ms]">
         {/* Back layer */}
         <div 
           className={`absolute bottom-0 left-0 right-0 h-full w-[120%] -ml-10 rounded-[100%] scale-150 translate-y-[40%] ${timeState.isDay ? 'bg-emerald-800/20' : 'bg-slate-900'}`}
         ></div>
         {/* Front layer */}
         <div 
           className={`absolute bottom-0 left-0 right-0 h-32 w-[120%] -ml-10 rounded-[100%] scale-125 translate-y-[30%] ${timeState.isDay ? 'bg-emerald-900/30' : 'bg-black'}`}
         ></div>
      </div>
      
      {/* Atmospheric Glow overlay */}
      <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${timeState.isDay ? 'bg-amber-500/10' : 'bg-blue-900/20'}`}></div>
    </div>
  );
};
