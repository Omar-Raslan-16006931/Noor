
import React, { useEffect, useState } from 'react';
import { Auth } from './Auth';
import { Session } from '@supabase/supabase-js';
import { Moon, Calendar, LogOut, Info, Settings as SettingsIcon, Database, User, Minus, Plus, Heart, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PrayerData } from '../types';

interface SettingsProps {
  session: Session | null;
  hijriAdjustment: number;
  onHijriChange: (val: number) => void;
  prayerData: PrayerData | null;
}

export const Settings: React.FC<SettingsProps> = ({ session, hijriAdjustment, onHijriChange, prayerData }) => {
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session) return;
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', session.user.id)
      .single();
    
    if (data) {
      setUsername(data.username);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="pt-6 space-y-6 px-4">
      <div className="flex items-center gap-3 mb-2">
         <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500">
            <SettingsIcon size={20} />
         </div>
         <h2 className="text-2xl font-bold text-white">الإعدادات</h2>
      </div>

      {/* Free & No Ads Banner */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
         <div className="bg-emerald-500/20 p-2 rounded-full text-emerald-400">
             <ShieldCheck size={24} />
         </div>
         <div>
             <p className="text-white font-bold text-sm">مجاني بالكامل 100٪</p>
             <p className="text-emerald-200/80 text-xs">خالٍ من الإعلانات ومفتوح المصدر</p>
         </div>
      </div>

      {/* Account Section (Moved to Top) */}
      {session ? (
        <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-900/10 to-transparent">
           <h3 className="text-lg font-bold text-white mb-4">حسابي</h3>
           
           <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-900/40">
                    {username ? username[0].toUpperCase() : session.user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                    <h4 className="text-lg font-bold text-white truncate flex items-center gap-2">
                       {username || 'مستخدم'}
                       <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded border border-emerald-500/20">PRO</span>
                    </h4>
                    <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                 <p className="text-[10px] text-slate-500 mb-1">نوع التخزين</p>
                 <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <Database size={14} />
                    <span>سحابي (Cloud)</span>
                 </div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                 <p className="text-[10px] text-slate-500 mb-1">المعرف</p>
                 <div className="flex items-center gap-2 text-slate-300 text-xs font-bold">
                    <User size={14} />
                    <span>@{username || 'user'}</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleLogout}
             className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/20 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm font-bold"
           >
             <LogOut size={16} />
             تسجيل الخروج
           </button>
        </div>
      ) : (
        <div className="space-y-4">
           <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
              <Info className="text-amber-400 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-amber-100/80 leading-relaxed">
                 أنت تستخدم التطبيق كزائر. سيتم حفظ بياناتك (JSON) محلياً. لضمان مزامنة الإعدادات والتقدم، يرجى إنشاء حساب.
              </p>
           </div>
           <Auth />
        </div>
      )}

      {/* Hijri Adjustment Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-900/10">
         <div className="absolute top-0 right-0 p-6 opacity-5">
            <Moon size={100} />
         </div>
         
         <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
               <Calendar size={18} className="text-emerald-400" />
               ضبط التاريخ الهجري
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
               تعديل التاريخ الهجري ليتوافق مع الرؤية الشرعية في بلدك.
            </p>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-4">
               
               {/* Date Preview */}
               {prayerData && (
                 <div className="text-center animate-in fade-in duration-500">
                    <p className="text-[10px] text-slate-500 mb-1 font-bold tracking-wider">التاريخ الحالي بالتطبيق</p>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                        <p className="text-xl font-bold font-quran text-emerald-400 leading-none">
                            {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year}
                        </p>
                    </div>
                 </div>
               )}

               {/* Controls */}
               <div className="flex items-center justify-center gap-4 w-full">
                  <button 
                    onClick={() => onHijriChange(hijriAdjustment - 1)}
                    disabled={hijriAdjustment <= -2}
                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
                  >
                    <Minus size={20} />
                  </button>
                  
                  <div className="w-24 flex flex-col items-center justify-center">
                     <span className="text-3xl font-mono font-bold text-white tracking-widest">
                        {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}
                     </span>
                     <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">يوم</span>
                  </div>

                  <button 
                    onClick={() => onHijriChange(hijriAdjustment + 1)}
                    disabled={hijriAdjustment >= 2}
                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5"
                  >
                    <Plus size={20} />
                  </button>
               </div>
               <p className="text-[10px] text-slate-500 text-center w-full pt-2 border-t border-white/5">أقصى تعديل مسموح (+/- يومين)</p>
            </div>
         </div>
      </div>

      {/* Donations Section (Updated Color to Green/Emerald) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-900/20 to-transparent relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
             <Heart size={120} />
          </div>
          
          <div className="relative z-10">
             <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Heart size={18} className="text-emerald-400" />
                دعم التطبيق
             </h3>
             <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                ساهم في استمرار وتطوير تطبيق نور. صدقة جارية لك ولنا إن شاء الله.
             </p>
             
             <button 
               className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 text-sm font-bold"
               onClick={() => alert('سيتم إضافة روابط التبرع قريباً')} 
             >
               <Heart size={16} className="fill-white" />
               تـبـرع الآن
             </button>
          </div>
      </div>
    </div>
  );
};
