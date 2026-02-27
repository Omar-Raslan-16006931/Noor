import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Comment } from '../../types';
import { Loader2, Send, Trash2, CornerDownLeft, X, AlertTriangle } from 'lucide-react';
import { formatTimeAgo } from '../../utils/dateUtils';

interface CommentSectionProps {
  postId: string;
  onCommentAdded: () => void;
  isAdmin?: boolean;
}

// ── Confirmation Dialog ───────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <p className="text-white text-sm font-medium leading-relaxed">{message}</p>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition-colors"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentAdded, isAdmin }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchComments(); }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*, user:profiles(username, first_name, last_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setComments(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Rate limit check: max 10 comments per hour ────────────────────────────
  const checkCommentRateLimit = async (userId: string): Promise<boolean> => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo);
    return (count ?? 0) < 10;
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setRateLimitMsg('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Rate limit
      const allowed = await checkCommentRateLimit(user.id);
      if (!allowed) {
        setRateLimitMsg('لقد تجاوزت الحد الأقصى (10 تعليقات في الساعة). حاول لاحقاً.');
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

      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
        parent_id: replyingTo?.id ?? null,
      });
      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      fetchComments();
      onCommentAdded();
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Admin can delete any comment; use service-level delete
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
    } catch (e) {
      console.error('Failed to delete comment:', e);
      alert('فشل الحذف. تأكد من صلاحيات الأدمن في Supabase RLS.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const startReply = (comment: Comment) => {
    const displayName = [comment.user?.first_name, comment.user?.last_name].filter(Boolean).join(' ')
      || comment.user?.username || 'user';
    setReplyingTo({ id: comment.id, username: displayName });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (id: string) => comments.filter(c => c.parent_id === id);

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const replies = getReplies(comment.id);
    const isReply = depth > 0;

    // Build display name
    const fullName = [comment.user?.first_name, comment.user?.last_name].filter(Boolean).join(' ');
    const displayName = fullName || comment.user?.username || 'مستخدم';
    const handle = comment.user?.username || 'user';
    const avatarLetter = displayName[0]?.toUpperCase() || '?';

    return (
      <div className={`flex gap-2.5 group ${isReply ? 'ml-8 mt-3' : 'mt-4'}`}>
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          <div className={`${isReply ? 'w-7 h-7' : 'w-8 h-8'} rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10`}>
            {comment.user?.avatar_url
              ? <img src={comment.user.avatar_url} alt="" className="w-full h-full object-cover" />
              : <span className={`font-bold text-white ${isReply ? 'text-[10px]' : 'text-xs'}`}>{avatarLetter}</span>
            }
          </div>
        </div>

        {/* Bubble */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#1a1a1a] rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full">
            {/* Name row */}
            <div className="flex items-baseline gap-1.5 mb-0.5 flex-wrap">
              <span className="text-emerald-400 text-xs font-bold leading-none">{displayName}</span>
              {fullName && (
                <span className="text-slate-600 text-[10px] leading-none">@{handle}</span>
              )}
            </div>
            <p className="text-slate-100 text-sm leading-[1.55] whitespace-pre-wrap break-words dir-rtl">
              {comment.content}
            </p>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 mt-1 px-1">
            <span className="text-slate-600 text-[11px]">{formatTimeAgo(comment.created_at)}</span>
            <button
              onClick={() => startReply(comment)}
              className="text-slate-500 hover:text-emerald-400 text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <CornerDownLeft size={11} />
              رد
            </button>
            {isAdmin && (
              <button
                onClick={() => setDeleteTarget(comment.id)}
                className="text-slate-700 hover:text-red-400 text-[11px] font-semibold transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
              >
                <Trash2 size={11} />
                حذف
              </button>
            )}
          </div>

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-1">
              {replies.map(r => <CommentItem key={r.id} comment={r} depth={depth + 1} />)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Confirmation dialog */}
      {deleteTarget && (
        <ConfirmDialog
          message="هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={() => handleDeleteComment(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="px-4 pt-2 pb-3">
        {/* Comments list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-slate-600" size={18} />
          </div>
        ) : rootComments.length === 0 ? (
          <p className="text-center text-slate-600 text-sm py-4">لا توجد تعليقات. كن أول من يعلق!</p>
        ) : (
          <div className="max-h-64 overflow-y-auto custom-scrollbar pb-3">
            {rootComments.map(c => <CommentItem key={c.id} comment={c} />)}
          </div>
        )}

        {/* Rate limit warning */}
        {rateLimitMsg && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400 shrink-0" />
            <p className="text-amber-400 text-xs">{rateLimitMsg}</p>
          </div>
        )}

        {/* Reply banner */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mb-2">
            <p className="text-xs text-emerald-400 font-medium">
              الرد على <span className="font-bold">{replyingTo.username}</span>
            </p>
            <button onClick={() => setReplyingTo(null)} className="text-slate-500 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleAddComment} className="flex items-center gap-2.5 mt-1">
          <input
            ref={inputRef}
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={replyingTo ? `الرد على ${replyingTo.username}...` : 'أضف تعليقاً...'}
            className="flex-1 bg-[#1a1a1a] border border-white/8 rounded-full px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors dir-rtl"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shrink-0"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
      </div>
    </>
  );
};
