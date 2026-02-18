import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { JournalEntry } from '../types';
import { PenTool, Plus, X, Calendar, Trash2 } from 'lucide-react';

export const Journal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    setEntries(storageService.getJournalEntries());
  }, []);

  const handleSave = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      date: new Date().toLocaleDateString('ar-SA'),
      mood: 'reflecting'
    };

    const updated = storageService.addJournalEntry(entry);
    setEntries(updated);
    setIsComposing(false);
    setNewTitle('');
    setNewContent('');
  };

  const handleDelete = (id: string) => {
    if(confirm('هل أنت متأكد من حذف هذه الخاطرة؟')) {
       const updated = storageService.deleteJournalEntry(id);
       setEntries(updated);
    }
  };

  return (
    <div className="pb-24 pt-6 space-y-6 px-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-bold text-white">خواطري</h2>
            <p className="text-xs text-slate-400">مساحتك الخاصة للتأمل والدعاء</p>
         </div>
         <button 
           onClick={() => setIsComposing(true)}
           className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-900/50 transition-all active:scale-95"
         >
           <Plus size={24} />
         </button>
      </div>

      {entries.length === 0 && !isComposing ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 opacity-60">
           <PenTool size={48} className="mb-4" />
           <p>لا توجد خواطر مسجلة بعد</p>
           <p className="text-sm">ابدأ بتدوين مشاعرك في هذا الشهر الفضيل</p>
        </div>
      ) : (
        <div className="space-y-3">
           {entries.map(entry => (
             <div key={entry.id} className="glass-panel rounded-2xl p-5 border-r-4 border-emerald-500">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-lg text-white">{entry.title}</h3>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded-full flex items-center gap-1">
                        <Calendar size={10} />
                        {entry.date}
                      </span>
                      <button onClick={() => handleDelete(entry.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
             </div>
           ))}
        </div>
      )}

      {/* Compose Modal Overlay */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
           <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                 <h3 className="font-bold text-white">خاطرة جديدة</h3>
                 <button onClick={() => setIsComposing(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-4 space-y-4">
                 <input
                   autoFocus
                   type="text"
                   placeholder="عنوان الخاطرة (مثلاً: شعور أول يوم رمضان)"
                   value={newTitle}
                   onChange={(e) => setNewTitle(e.target.value)}
                   className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors"
                 />
                 <textarea
                   placeholder="اكتب ما يجول في خاطرك..."
                   value={newContent}
                   onChange={(e) => setNewContent(e.target.value)}
                   rows={8}
                   className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                 />
                 <button 
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all"
                 >
                    حفظ الخاطرة
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
