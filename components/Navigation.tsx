import React from 'react';
import { Home, BookOpen, Scroll, Settings, Calculator, Users } from 'lucide-react';
import { AppTab } from '../types';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: AppTab.HOME, icon: Home, label: 'الرئيسية' },
    { id: AppTab.QURAN, icon: BookOpen, label: 'الختمة' },
    { id: AppTab.COMMUNITY, icon: Users, label: 'المجتمع' },
    { id: AppTab.ZAKAT, icon: Calculator, label: 'الزكاة' },
    { id: AppTab.SETTINGS, icon: Settings, label: 'إعدادات' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="glass-panel rounded-full flex justify-around items-center h-16 px-4 shadow-2xl mx-auto max-w-sm border-t border-amber-500/10 bg-slate-900/95 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center transition-all duration-300 w-14 ${
                isActive ? '-translate-y-3' : 'text-slate-500'
              }`}
            >
              <div
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-2 ring-emerald-900 scale-105'
                    : 'hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span
                className={`text-[10px] mt-1 font-bold transition-all duration-300 ${
                  isActive ? 'text-emerald-400 opacity-100 translate-y-0' : 'opacity-0 translate-y-2 h-0 overflow-hidden'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};