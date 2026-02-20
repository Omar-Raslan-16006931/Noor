import { supabase } from '../lib/supabaseClient';
import { Report } from '../types';

export const reportService = {
  // Submit a new report
  submitReport: async (type: 'suggestion' | 'bug', message: string) => {
    const { error } = await supabase
      .from('reports')
      .insert([
        { type, message }
      ]);
    
    if (error) throw error;
  },

  // Fetch all reports (Admin only)
  getAllReports: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        user:profiles(username, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match Report interface
    return (data || []).map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      type: item.type,
      message: item.message,
      is_read: item.is_read,
      created_at: item.created_at,
      user: {
        username: item.user?.username || 'Unknown',
        email: item.user?.email || 'No Email'
      }
    }));
  },

  // Mark report as read/unread (Admin only)
  toggleReadStatus: async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('reports')
      .update({ is_read: !currentStatus })
      .eq('id', id);
    
    if (error) throw error;
  }
};
