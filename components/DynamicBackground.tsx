import React, { useEffect, useState } from 'react';

interface DynamicBackgroundProps {
  sunriseTime?: string; // HH:MM format
  sunsetTime?: string; // HH:MM format
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ 
  sunriseTime = "06:00", 
  sunsetTime = "18:00" 
}) => {
  const [phase, setPhase] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day');

  useEffect(() => {
    const calculatePhase = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Default values if time is invalid
      let srMinutes = 6 * 60;
      let ssMinutes = 18 * 60;

      if (sunriseTime && sunsetTime) {
        const [srH, srM] = sunriseTime.split(':').map(Number);
        const [ssH, ssM] = sunsetTime.split(':').map(Number);
        if (!isNaN(srH)) srMinutes = srH * 60 + srM;
        if (!isNaN(ssH)) ssMinutes = ssH * 60 + ssM;
      }

      if (currentMinutes >= srMinutes - 45 && currentMinutes < srMinutes + 45) {
        setPhase('dawn');
      } else if (currentMinutes >= srMinutes + 45 && currentMinutes < ssMinutes - 45) {
        setPhase('day');
      } else if (currentMinutes >= ssMinutes - 45 && currentMinutes < ssMinutes + 45) {
        setPhase('dusk');
      } else {
        setPhase('night');
      }
    };

    const interval = setInterval(calculatePhase, 60000);
    calculatePhase();
    return () => clearInterval(interval);
  }, [sunriseTime, sunsetTime]);

  const getGradient = () => {
    switch (phase) {
      case 'dawn':
        return 'bg-gradient-to-br from-indigo-900 via-purple-700 to-orange-400';
      case 'day':
        return 'bg-gradient-to-br from-sky-400 via-blue-500 to-emerald-400';
      case 'dusk':
        return 'bg-gradient-to-br from-slate-900 via-purple-900 to-amber-600';
      case 'night':
        return 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950';
      default:
        return 'bg-gradient-to-br from-slate-900 to-slate-800';
    }
  };

  return (
    <div className={`fixed inset-0 z-0 transition-all duration-[5000ms] ease-in-out ${getGradient()} overflow-hidden`}>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          20% { opacity: 0.6; transform: translateY(80vh) scale(1); }
          80% { opacity: 0.6; transform: translateY(20vh) scale(1); }
          100% { transform: translateY(-10vh) scale(0); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        .particle {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0;
        }
      `}</style>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.07] mix-blend-overlay"></div>
      
      {/* Night/Dusk Stars */}
      {(phase === 'night' || phase === 'dusk') && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <div className="stars opacity-50 absolute inset-0"></div>
          {/* Extra random twinkling stars */}
          {[...Array(30)].map((_, i) => (
             <div 
               key={`star-${i}`}
               className="particle animate-pulse"
               style={{
                 top: `${Math.random() * 100}%`,
                 left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 2 + 1}px`,
                 height: `${Math.random() * 2 + 1}px`,
                 animationDuration: `${Math.random() * 3 + 2}s`,
                 animationDelay: `${Math.random() * 5}s`,
                 opacity: Math.random() * 0.5 + 0.2
               }}
             ></div>
          ))}
          {/* Moon Glow Hint (Top Right) */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-indigo-100 rounded-full blur-[80px] opacity-20"></div>
        </div>
      )}

      {/* Day/Dawn Sun Rays */}
      {(phase === 'day' || phase === 'dawn') && (
         <div className="absolute inset-0 overflow-hidden transition-opacity duration-1000">
            {/* Spinning Light Rays */}
            <div className="absolute -top-[50%] -right-[50%] w-[200%] h-[200%] animate-[spin_120s_linear_infinite] opacity-[0.08] pointer-events-none">
                {[0, 45, 90, 135].map((deg) => (
                    <div 
                        key={deg}
                        className="absolute top-1/2 left-1/2 w-full h-40 bg-gradient-to-r from-transparent via-white to-transparent"
                        style={{ transform: `translate(-50%, -50%) rotate(${deg}deg)` }}
                    ></div>
                ))}
            </div>
            {/* Sun Glow Hint (Top Right) */}
            <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] opacity-40 ${phase === 'day' ? 'bg-yellow-200' : 'bg-orange-300'}`}></div>
         </div>
      )}

      {/* Dynamic Ambient Orbs */}
      <div className={`absolute -top-20 -left-20 w-[30rem] h-[30rem] rounded-full blur-[120px] mix-blend-screen transition-colors duration-[5000ms] ${
          phase === 'day' ? 'bg-sky-300/30' : 
          phase === 'dawn' ? 'bg-rose-400/30' : 
          phase === 'dusk' ? 'bg-purple-600/30' : 
          'bg-indigo-900/40'
      }`}></div>

      <div className={`absolute -bottom-20 -right-20 w-[35rem] h-[35rem] rounded-full blur-[120px] mix-blend-screen transition-colors duration-[5000ms] ${
          phase === 'day' ? 'bg-emerald-300/20' : 
          phase === 'dawn' ? 'bg-amber-400/20' : 
          phase === 'dusk' ? 'bg-orange-600/20' : 
          'bg-slate-800/40'
      }`}></div>

      {/* Floating Particles (Dust/Light motes) - Visible in all phases */}
      <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
             <div 
               key={`mote-${i}`}
               className="particle"
               style={{
                 left: `${Math.random() * 100}%`,
                 width: `${Math.random() * 3 + 1}px`,
                 height: `${Math.random() * 3 + 1}px`,
                 animation: `float-up ${Math.random() * 15 + 20}s linear infinite`,
                 animationDelay: `-${Math.random() * 20}s`,
                 background: phase === 'night' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.6)'
               }}
             ></div>
          ))}
      </div>
    </div>
  );
};
