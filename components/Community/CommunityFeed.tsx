import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Post } from '../../types';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import { Loader2, RefreshCw, Users } from 'lucide-react';

// ── Add isActive prop ─────────────────────────────────────────────────────────
interface CommunityFeedProps {
  isActive?: boolean;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ isActive }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Mount: load once ──────────────────────────────────────────────────────
  useEffect(() => {
    checkAdmin();
    fetchPosts();
  }, []);

  // ── Refresh feed silently every time tab becomes active ───────────────────
  // Uses setRefreshing(true) instead of setLoading(true) so there's
  // no full-screen spinner — just the small refresh icon spins in the header
  useEffect(() => {
    if (isActive) {
      setRefreshing(true);
      fetchPosts();
    }
  }, [isActive]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      setIsAdmin(data?.is_admin || false);
    }
  };

  const fetchPosts = async () => {
    // Only show full-screen loader on very first load (posts array is empty)
    // All subsequent refreshes just spin the header icon quietly
    if (posts.length === 0) setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      let { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles(username, first_name, last_name, avatar_url),
          likes(user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error?.code === 'PGRST200') {
        const fb = await supabase
          .from('posts')
          .select(`*, likes(user_id)`)
          .order('created_at', { ascending: false })
          .limit(50);
        data = fb.data;
        error = fb.error;
      }
      if (error) throw error;

      setPosts(
        (data || []).map((p: any) => ({
          ...p,
          user: p.user || { username: 'مستخدم', first_name: null, last_name: null, avatar_url: null },
          is_liked: p.likes?.some((l: any) => l.user_id === user?.id) || false,
          likes_count: p.likes?.length || p.likes_count || 0,
        }))
      );
    } catch (e) {
      console.error('Error fetching posts:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto px-3 pb-28">

      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-black/70 backdrop-blur-xl pt-4 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-emerald-500" />
          <h1 className="text-[17px] font-bold text-white">المجتمع</h1>
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchPosts(); }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-emerald-500" size={28} />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-slate-600" />
          </div>
          <p className="text-white font-semibold mb-1">لا توجد منشورات بعد</p>
          <p className="text-slate-500 text-sm">كن أول من يشارك!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              isAdmin={isAdmin}
              onDelete={id => setPosts(prev => prev.filter(x => x.id !== id))}
              onUpdate={u => setPosts(prev => prev.map(x => x.id === u.id ? u : x))}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <CreatePost onPostCreated={fetchPosts} />
    </div>
  );
};
