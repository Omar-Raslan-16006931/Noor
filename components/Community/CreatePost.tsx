import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, X, Pencil, AlertTriangle } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setRateLimitMsg('');
    setTimeout(() => textareaRef.current?.focus(), 80);
  };

  const handleClose = () => {
    setIsOpen(false);
    setContent('');
    setRateLimitMsg('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  // ── Rate limit: max 10 posts per hour ─────────────────────────────────────
  const checkPostRateLimit = async (userId: string): Promise<boolean> => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);
    return (count ?? 0) < 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setRateLimitMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Rate limit check
      const allowed = await checkPostRateLimit(user.id);
      if (!allowed) {
        setRateLimitMsg('لقد تجاوزت الحد الأقصى (10 منشورات في الساعة). حاول لاحقاً.');
        setSubmitting(false);
        return;
      }

      const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();
      if (!profile) {
        await supabase.from('profiles').insert({
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          updated_at: new Date().toISOString()
        });
      }

      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content: content.trim(),
      });
      if (error) throw error;

      handleClose();
      onPostCreated();
    } catch {
      alert('فشل النشر. حاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = 280 - content.length;
  const nearLimit = remaining <= 30;

  return (
    <>
      {/* ── FAB ──────────────────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="fixed bottom-20 right-4 z-[60] w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xl shadow-emerald-900/40 flex items-center justify-center transition-all border border-emerald-400/20"
        aria-label="منشور جديد"
      >
        <Pencil size={18} />
      </button>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={handleClose} />

          <div className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
              <h3 className="text-white font-bold text-base">منشور جديد</h3>
              <div className="w-8" />
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-5">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleInput}
                placeholder="شارك خواطرك مع المجتمع..."
                rows={5}
                className="w-full bg-[#1a1a1a] border border-white/[0.07] rounded-xl text-white text-[15px] placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 resize-none dir-rtl leading-relaxed p-4 transition-colors"
                maxLength={280}
              />

              {/* Rate limit warning */}
              {rateLimitMsg && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mt-3">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  <p className="text-amber-400 text-xs">{rateLimitMsg}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 h-7">
                  {content.length > 0 && (
                    <>
                      <svg viewBox="0 0 28 28" className="w-6 h-6 -rotate-90 shrink-0">
                        <circle cx="14" cy="14" r="11" fill="none" stroke="#1f2937" strokeWidth="3" />
                        <circle
                          cx="14" cy="14" r="11"
                          fill="none"
                          stroke={remaining <= 0 ? '#ef4444' : nearLimit ? '#f59e0b' : '#10b981'}
                          strokeWidth="3"
                          strokeDasharray="69.12"
                          strokeDashoffset={`${Math.max(0, 69.12 * (remaining / 280))}`}
                          strokeLinecap="round"
                          className="transition-all duration-100"
                        />
                      </svg>
                      {nearLimit && (
                        <span className={`text-xs font-mono font-bold ${remaining <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                          {remaining}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!content.trim() || submitting || remaining < 0}
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>نشر</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
