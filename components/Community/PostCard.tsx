import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Post } from '../../types';
import { Heart, MessageCircle, Trash2, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { CommentSection } from './CommentSection';
import { formatTimeAgo, formatFullDateTime } from '../../utils/dateUtils';

interface PostCardProps {
  post: Post;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onUpdate: (post: Post) => void;
}

// ── Reusable Confirm Dialog ───────────────────────────────────────────────────
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

export const PostCard: React.FC<PostCardProps> = ({ post, isAdmin, onDelete, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [countLoading, setCountLoading] = useState(true);

  useEffect(() => { fetchCommentCount(); }, [post.id]);

  const fetchCommentCount = async () => {
    try {
      const { count, error } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', post.id);
      if (error) throw error;
      setCommentsCount(count ?? 0);
    } catch {
      setCommentsCount(post.comments_count ?? 0);
    } finally {
      setCountLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const newIsLiked = !post.is_liked;
    const newCount = post.likes_count + (newIsLiked ? 1 : -1);
    onUpdate({ ...post, is_liked: newIsLiked, likes_count: newCount });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (newIsLiked) await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      else await supabase.from('likes').delete().match({ post_id: post.id, user_id: user.id });
    } catch {
      onUpdate({ ...post, is_liked: !newIsLiked, likes_count: post.likes_count });
    } finally {
      setIsLiking(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) {
        console.error('Post delete error:', error);
        throw error;
      }
      onDelete(post.id);
    } catch {
      alert('فشل الحذف. تأكد من صلاحيات الأدمن في Supabase RLS.');
    } finally {
      setShowDeleteConfirm(false);
      setShowMenu(false);
    }
  };

  // Build display name
  const fullName = [post.user?.first_name, post.user?.last_name].filter(Boolean).join(' ');
  const displayName = fullName || post.user?.username || 'مستخدم';
  const handle = post.user?.username || 'user';
  const avatarLetter = displayName[0]?.toUpperCase() || '?';

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmDialog
          message="هل أنت متأكد تماماً من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
          onConfirm={handleDeleteConfirmed}
          onCancel={() => { setShowDeleteConfirm(false); setShowMenu(false); }}
        />
      )}

      <div className="bg-[#111] border border-white/[0.07] rounded-2xl overflow-hidden mb-3 shadow-lg">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="p-[2px] rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#111] flex items-center justify-center overflow-hidden">
                {post.user?.avatar_url
                  ? <img src={post.user.avatar_url} alt="" className="w-full h-full object-cover" />
                  : <span className="text-sm font-bold text-white">{avatarLetter}</span>
                }
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{displayName}</p>
              <div className="flex items-center gap-1.5">
                {fullName && <span className="text-slate-500 text-xs">@{handle}</span>}
                {fullName && <span className="text-slate-700 text-xs">·</span>}
                <span
                  className="text-slate-500 text-xs cursor-default"
                  title={formatFullDateTime(post.created_at)}
                >
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Admin menu */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(p => !p)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute left-0 top-full mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden py-1">
                    <button
                      onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                      <span>حذف المنشور</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="px-4 pb-4">
          <p className="text-white text-[15px] leading-[1.65] dir-rtl whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        <div className="h-px bg-white/[0.06] mx-4" />

        {/* ── Action bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center px-3 py-2 gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-90 select-none ${
              post.is_liked
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
          >
            <Heart size={19} className={`transition-transform duration-150 ${post.is_liked ? 'fill-rose-500 scale-110' : ''}`} />
            <span className="text-xs font-bold tabular-nums min-w-[12px]">
              {post.likes_count > 0 ? post.likes_count : ''}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(p => !p)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all select-none ${
              showComments
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <MessageCircle size={19} className={showComments ? 'fill-emerald-400/20' : ''} />
            <span className={`text-xs font-bold tabular-nums min-w-[12px] transition-opacity ${countLoading ? 'opacity-30' : 'opacity-100'}`}>
              {commentsCount > 0 ? commentsCount : ''}
            </span>
          </button>
        </div>

        {/* ── Comments ───────────────────────────────────────────────────── */}
        {showComments && (
          <div className="border-t border-white/[0.05]">
            <CommentSection
              postId={post.id}
              onCommentAdded={() => {
                setCommentsCount(p => p + 1);
                onUpdate({ ...post, comments_count: commentsCount + 1 });
              }}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>
    </>
  );
};
