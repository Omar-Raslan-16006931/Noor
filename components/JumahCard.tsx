import React, { useState } from 'react';
import { BookOpen, Droplets, Wind, Clock, Heart, Sparkles, UserCheck, X, ChevronLeft, Scroll, Info, ArrowRight } from 'lucide-react';

interface JumahCardProps {
  onOpenKahf: () => void;
}

export const JumahCard: React.FC<JumahCardProps> = ({ onOpenKahf }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-xl border border-emerald-500/20 mb-6 group">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
        
        {/* Decorative Shine */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-400 animate-pulse" size={20} />
              <h2 className="text-2xl font-bold font-quran text-emerald-50 drop-shadow-sm">جمعة مباركة</h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/20 backdrop-blur-sm shadow-sm">
              سنن الجمعة
            </span>
          </div>

          <p className="text-slate-300 text-sm mb-6 leading-relaxed font-serif border-r-2 border-emerald-500/30 pr-3 pl-1">
            قال رسول الله ﷺ: <span className="text-emerald-100">"من قرأ سورة الكهف في يوم الجمعة أضاء له من النور ما بين الجمعتين."</span>
          </p>

          <div className="grid grid-cols-4 gap-2 mb-6">
              <SunnahItem icon={<Droplets size={18} />} label="الغسل" />
              <SunnahItem icon={<Wind size={18} />} label="الطيب" />
              <SunnahItem icon={<UserCheck size={18} />} label="التبكير" />
              <SunnahItem icon={<Heart size={18} />} label="الدعاء" />
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onOpenKahf}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 active:scale-95 group border border-emerald-400/20"
            >
              <BookOpen size={20} className="group-hover:scale-110 transition-transform" />
              <span>سورة الكهف</span>
            </button>
            <button 
              onClick={() => setShowDetails(true)}
              className="px-4 py-3.5 bg-slate-800/50 text-emerald-200 rounded-xl font-bold flex items-center justify-center hover:bg-slate-800 transition-all border border-white/5 hover:border-emerald-500/30"
            >
              <Info size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDetails(false)} />
          <div className="relative w-full max-w-md bg-[#0f172a] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-white/10 ring-1 ring-white/5">
            
            {/* Header */}
            <div className="bg-slate-900/50 p-4 text-white flex items-center justify-between border-b border-white/5 backdrop-blur-md">
              <h3 className="text-lg font-bold flex items-center gap-2 font-quran text-amber-500">
                <Sparkles size={18} />
                فضائل وسنن الجمعة
              </h3>
              <button onClick={() => setShowDetails(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto custom-scrollbar p-4 space-y-6 bg-[#0f172a]">
              
              {/* Section 1: Sunnahs */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Scroll size={16} className="text-emerald-400" />
                  <h4 className="font-bold text-base text-slate-200">سنن يوم الجمعة</h4>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {FRIDAY_SUNNAHS_DETAILED.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-slate-800 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                        {React.cloneElement(item.icon as React.ReactElement, { size: 16 })}
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-200 text-sm mb-0.5 group-hover:text-emerald-100 transition-colors">{item.label}</h5>
                        <p className="text-[10px] text-slate-400 leading-tight group-hover:text-slate-300 transition-colors">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 2: Hadiths */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-slate-400" />
                  <h4 className="font-bold text-base text-slate-200">أحاديث الجمعة</h4>
                </div>
                <div className="space-y-3">
                  {FRIDAY_HADITHS.map((hadith, idx) => (
                    <div key={idx} className="bg-slate-800/30 p-4 rounded-xl border border-white/5 relative overflow-hidden group hover:bg-slate-800/50 hover:border-slate-700 transition-all">
                      <div className="absolute top-3 right-3 text-slate-700 opacity-50 group-hover:text-slate-600 transition-colors">
                        <Info size={24} />
                      </div>
                      
                      <p className="text-slate-300 font-quran text-lg leading-loose relative z-10 mb-3 text-right dir-rtl group-hover:text-slate-200 transition-colors">
                        "{hadith.text}"
                      </p>
                      
                      <div className="flex items-center gap-2 relative z-10">
                        <div className="h-px flex-1 bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded border border-white/5 group-hover:text-slate-400 transition-colors">
                          {hadith.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Duas */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Heart size={16} className="text-amber-500" />
                  <h4 className="font-bold text-base text-slate-200">أدعية مستحبة</h4>
                </div>
                <div className="bg-gradient-to-br from-amber-950/50 via-amber-900/20 to-slate-900/50 p-5 rounded-2xl border border-amber-500/10 relative overflow-hidden group">
                   <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] mix-blend-overlay"></div>
                   
                   <div className="relative z-10 space-y-4">
                     <div className="bg-black/20 p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                       <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider mb-3 block text-center">الصلاة الإبراهيمية</span>
                       <p className="text-center font-quran text-lg leading-loose text-amber-100/90 dir-rtl drop-shadow-sm">
                         "اللهم صلِّ على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد، اللهم بارك على محمد وعلى آل محمد كما باركت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد"
                       </p>
                     </div>
                     
                     <div className="bg-black/20 p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                       <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider mb-3 block text-center">دعاء ساعة الاستجابة</span>
                       <p className="text-center font-quran text-lg leading-loose text-amber-100/90 dir-rtl drop-shadow-sm">
                         "اللهم يا حي يا قيوم، يا ذا الجلال والإكرام، أسألك باسمك الأعظم الطيب المبارك، الأحب إليك الذي إذا دُعيت به أجبت، وإذا استرحمت به رحمت، وإذا استفرجت به فرجت، أن تجعلنا في هذه الدنيا من المقبولين وإلى أعلى درجاتك سابقين"
                       </p>
                     </div>
                   </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SunnahItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex flex-col items-center gap-2 text-slate-400 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-default group/item">
    <div className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover/item:text-emerald-300 group-hover/item:border-emerald-500/40 transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-bold group-hover/item:text-slate-200 transition-colors">{label}</span>
  </div>
);

const FRIDAY_SUNNAHS_DETAILED = [
  { icon: <Droplets size={20} />, label: "الغسل", description: "الاغتسال والتنظف كما للجنابة" },
  { icon: <Wind size={20} />, label: "الطيب والسواك", description: "التطيب بأحسن الطيب واستخدام السواك" },
  { icon: <UserCheck size={20} />, label: "لبس أحسن الثياب", description: "التزين ولبس النظيف من الثياب" },
  { icon: <Clock size={20} />, label: "التبكير للصلاة", description: "الذهاب مبكراً إلى المسجد قبل صعود الإمام" },
  { icon: <BookOpen size={20} />, label: "قراءة سورة الكهف", description: "تضيء للمسلم ما بين الجمعتين" },
  { icon: <Heart size={20} />, label: "الصلاة على النبي", description: "الإكثار من الصلاة والسلام على رسول الله ﷺ" },
  { icon: <ArrowRight size={20} />, label: "المشي إلى المسجد", description: "بكل خطوة أجر سنة صيام وقيام" },
  { icon: <Sparkles size={20} />, label: "تحري ساعة الاستجابة", description: "خاصة آخر ساعة من نهار الجمعة" },
];

const FRIDAY_HADITHS = [
  { text: "خَيْرُ يَوْمٍ طَلَعَتْ عَلَيْهِ الشَّمْسُ يَوْمُ الْجُمُعَةِ، فِيهِ خُلِقَ آدَمُ، وَفِيهِ أُدْخِلَ الْجَنَّةَ، وَفِيهِ أُخْرِجَ مِنْهَا، وَلاَ تَقُومُ السَّاعَةُ إِلاَّ فِي يَوْمِ الْجُمُعَةِ", source: "صحيح مسلم" },
  { text: "مَنْ غَسَّلَ يَوْمَ الْجُمُعَةِ وَاغْتَسَلَ، وَبَكَّرَ وَابْتَكَرَ، وَمَشَى وَلَمْ يَرْكَبْ، وَدَنَا مِنَ الإِمَامِ فَاسْتَمَعَ وَلَمْ يَلْغُ، كَانَ لَهُ بِكُلِّ خُطْوَةٍ عَمَلُ سَنَةٍ أَجْرُ صِيَامِهَا وَقِيَامِهَا", source: "سنن أبي داود" },
  { text: "أَكْثِرُوا عَلَيَّ مِنَ الصَّلاَةِ فِي كُلِّ يَوْمِ جُمُعَةٍ؛ فَإِنَّ صَلاَةَ أُمَّتِي تُعْرَضُ عَلَيَّ فِي كُلِّ يَوْمِ جُمُعَةٍ", source: "السنن الكبرى" }
];
