import React, { useEffect, useState } from 'react';
import { Auth } from './Auth';
import { Session } from '@supabase/supabase-js';
import {
  Moon, Calendar, LogOut, Info, Settings as SettingsIcon, Database,
  User, Minus, Plus, Heart, ShieldCheck, MessageSquare, Bug,
  CheckCircle, XCircle, Loader2, Image as ImageIcon, Pencil, X, Check
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PrayerData, Report } from '../types';
import { reportService } from '../services/reportService';

interface SettingsProps {
  session: Session | null;
  hijriAdjustment: number;
  onHijriChange: (val: number) => void;
  prayerData: PrayerData | null;
  onOpenBranding: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  session, hijriAdjustment, onHijriChange, prayerData, onOpenBranding
}) => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // ── Profile Edit State ────────────────────────────────────────────────────
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Report State ──────────────────────────────────────────────────────────
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<'suggestion' | 'bug'>('suggestion');
  const [reportMessage, setReportMessage] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // ── Admin State ───────────────────────────────────────────────────────────
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    if (session) fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('username, is_admin, first_name, last_name')
      .eq('id', session.user.id)
      .single();

    if (data && !error) {
      setUsername(data.username || '');
      setIsAdmin(data.is_admin || false);
      const fn = data.first_name || session.user.user_metadata?.first_name || session.user.user_metadata?.full_name?.split(' ')[0] || '';
      const ln = data.last_name  || session.user.user_metadata?.last_name  || session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '';
      setFirstName(fn);
      setLastName(ln);
    } else if (session.user.user_metadata) {
      setFirstName(session.user.user_metadata.first_name || session.user.user_metadata.full_name?.split(' ')[0] || '');
      setLastName(session.user.user_metadata.last_name  || session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || '');
    }
  };

  // ── Open edit mode ────────────────────────────────────────────────────────
  const handleStartEdit = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setIsEditingProfile(true);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFirstName('');
    setEditLastName('');
  };

  // ── Save first/last name ──────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!session) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setFirstName(editFirstName.trim());
      setLastName(editLastName.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditingProfile(false);
      }, 1200);
    } catch (e) {
      console.error('Error saving profile:', e);
      alert('فشل الحفظ. حاول مجدداً.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportMessage.trim()) return;
    setIsSubmittingReport(true);
    try {
      await reportService.submitReport(reportType, reportMessage);
      setReportSuccess(true);
      setReportMessage('');
      setTimeout(() => { setReportSuccess(false); setShowReportForm(false); }, 2000);
    } catch {
      alert('حدث خطأ أثناء إرسال التقرير.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const data = await reportService.getAllReports();
      setReports(data);
    } catch (e) { console.error(e); }
    finally { setLoadingReports(false); }
  };

  const toggleReportRead = async (id: string, current: boolean) => {
    try {
      await reportService.toggleReadStatus(id, current);
      setReports(reports.map(r => r.id === id ? { ...r, is_read: !current } : r));
    } catch (e) { console.error(e); }
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || username || 'مستخدم';
  const displayInitial = (firstName || username || session?.user.email || '?')[0]?.toUpperCase();

  return (
    <div className="pt-6 space-y-6 px-4 pb-10">

      {/* Page title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-emerald-500">
          <SettingsIcon size={20} />
        </div>
        <h2 className="text-2xl font-bold text-white">الإعدادات</h2>
      </div>

      {/* ── Admin Panel ──────────────────────────────────────────────────── */}
      {isAdmin && (
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-transparent">
          <button
            onClick={() => { setShowAdminPanel(!showAdminPanel); if (!showAdminPanel) fetchReports(); }}
            className="w-full flex items-center justify-between text-amber-400 font-bold mb-3"
          >
            <span className="flex items-center gap-2"><ShieldCheck size={18} />لوحة التحكم (Admin)</span>
            {showAdminPanel ? <Minus size={16} /> : <Plus size={16} />}
          </button>
          <button
            onClick={onOpenBranding}
            className="w-full flex items-center justify-between text-purple-400 font-bold border-t border-white/5 pt-3"
          >
            <span className="flex items-center gap-2"><ImageIcon size={18} />توليد شعار وهوية (Branding)</span>
            <Plus size={16} />
          </button>
          {showAdminPanel && (
            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2">
              {loadingReports ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-amber-400" /></div>
              ) : reports.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-4">لا توجد تقارير حالياً</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
                  {reports.map(report => (
                    <div key={report.id} className={`p-3 rounded-xl border ${report.is_read ? 'bg-black/20 border-white/5 opacity-60' : 'bg-amber-500/10 border-amber-500/20'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${report.type === 'bug' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 'bg-blue-500/20 text-blue-400 border-blue-500/20'}`}>
                            {report.type === 'bug' ? 'مشكلة' : 'اقتراح'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => toggleReportRead(report.id, report.is_read)}
                          className={`text-[10px] px-2 py-1 rounded-md transition-colors ${report.is_read ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500 text-emerald-950 font-bold'}`}
                        >
                          {report.is_read ? 'مقروء' : 'جديد'}
                        </button>
                      </div>
                      <p className="text-xs text-white mb-2 leading-relaxed">{report.message}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-white/5 pt-2 mt-2">
                        <User size={10} />
                        <span>{report.user?.username}</span>
                        <span className="text-slate-600">|</span>
                        <span>{report.user?.email}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Report / Suggestion ──────────────────────────────────────────── */}
      {session && (
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-900/10 to-transparent">
          {!showReportForm ? (
            <button onClick={() => setShowReportForm(true)} className="w-full flex items-center justify-between text-blue-200 font-bold">
              <span className="flex items-center gap-2 text-sm"><MessageSquare size={16} className="text-blue-400" />إبلاغ عن مشكلة أو اقتراح</span>
              <Plus size={16} />
            </button>
          ) : (
            <div className="animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-blue-200 flex items-center gap-2"><MessageSquare size={16} />إرسال تقرير</h3>
                <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-white"><Minus size={16} /></button>
              </div>
              {reportSuccess ? (
                <div className="bg-emerald-500/20 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <CheckCircle className="mx-auto text-emerald-400 mb-2" size={24} />
                  <p className="text-emerald-200 text-xs font-bold">تم الإرسال بنجاح! شكراً لمساهمتك.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setReportType('suggestion')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${reportType === 'suggestion' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-black/20 text-slate-400 border-transparent'}`}>اقتراح</button>
                    <button type="button" onClick={() => setReportType('bug')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors border ${reportType === 'bug' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-black/20 text-slate-400 border-transparent'}`}>مشكلة</button>
                  </div>
                  <textarea
                    value={reportMessage}
                    onChange={e => setReportMessage(e.target.value)}
                    placeholder={reportType === 'suggestion' ? 'اكتب اقتراحك هنا...' : 'وصف المشكلة التي واجهتها...'}
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 min-h-[80px] resize-none"
                    required
                  />
                  <button type="submit" disabled={isSubmittingReport || !reportMessage.trim()} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                    {isSubmittingReport ? <Loader2 size={14} className="animate-spin" /> : 'إرسال'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Free & No Ads ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 shadow-lg">
        <div className="bg-emerald-500/20 p-1.5 rounded-full text-emerald-400"><ShieldCheck size={20} /></div>
        <div>
          <p className="text-white font-bold text-xs">مجاني بالكامل 100٪</p>
          <p className="text-emerald-200/80 text-[10px]">خالٍ من الإعلانات</p>
        </div>
      </div>

      {/* ── Account + Profile Editor ──────────────────────────────────────── */}
      {session ? (
        <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-900/10 to-transparent space-y-4">
          <h3 className="text-base font-bold text-white">حسابي</h3>

          {/* Avatar + name row */}
          <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-emerald-900/40 shrink-0">
              {displayInitial}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                {displayName}
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded border border-emerald-500/20">PRO</span>
              </h4>
              <p className="text-[10px] text-slate-400 truncate">@{username || 'user'}</p>
              <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
            </div>
            {/* Edit toggle button */}
            {!isEditingProfile && (
              <button
                onClick={handleStartEdit}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                title="تعديل الاسم"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          {/* ── Editable name fields ──────────────────────────────────────── */}
          {isEditingProfile && (
            <div className="bg-black/20 border border-white/8 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <User size={13} className="text-emerald-400" />
                تعديل الاسم
              </p>

              {/* First name */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">الاسم الأول</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                  placeholder="أدخل اسمك الأول..."
                  className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors dir-rtl"
                />
              </div>

              {/* Last name */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500 font-medium">اسم العائلة</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                  placeholder="أدخل اسم العائلة..."
                  className="w-full bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors dir-rtl"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X size={13} />
                  إلغاء
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    saveSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50'
                  }`}
                >
                  {savingProfile ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : saveSuccess ? (
                    <><Check size={13} /><span>تم الحفظ!</span></>
                  ) : (
                    <><Check size={13} /><span>حفظ</span></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
              <p className="text-[9px] text-slate-500 mb-1">نوع التخزين</p>
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                <Database size={12} />
                <span>سحابي (Cloud)</span>
              </div>
            </div>
            <div className="bg-black/20 p-2.5 rounded-xl border border-white/5">
              <p className="text-[9px] text-slate-500 mb-1">المعرف</p>
              <div className="flex items-center gap-2 text-slate-300 text-[10px] font-bold">
                <User size={12} />
                <span>@{username || firstName || 'user'}</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-200 border border-red-500/20 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs font-bold"
          >
            <LogOut size={14} />
            تسجيل الخروج
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
            <Info className="text-amber-400 shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-amber-100/80 leading-relaxed">
              أنت تستخدم التطبيق كزائر. سيتم حفظ بياناتك (JSON) محلياً. لضمان مزامنة الإعدادات والتقدم، يرجى إنشاء حساب.
            </p>
          </div>
          <Auth />
        </div>
      )}

      {/* ── Hijri Adjustment ──────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-900/10">
        <div className="absolute top-0 right-0 p-4 opacity-5"><Moon size={80} /></div>
        <div className="relative z-10">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-400" />
            ضبط التاريخ الهجري
          </h3>
          <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">تعديل التاريخ الهجري ليتوافق مع الرؤية الشرعية في بلدك.</p>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex flex-col items-center gap-3">
            {prayerData && (
              <div className="text-center animate-in fade-in duration-500">
                <p className="text-[9px] text-slate-500 mb-1 font-bold tracking-wider">التاريخ الحالي بالتطبيق</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <p className="text-lg font-bold font-quran text-emerald-400 leading-none">
                    {prayerData.date.hijri.day} {prayerData.date.hijri.month.ar} {prayerData.date.hijri.year}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-center gap-4 w-full">
              <button onClick={() => onHijriChange(hijriAdjustment - 1)} disabled={hijriAdjustment <= -2} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5">
                <Minus size={16} />
              </button>
              <div className="w-20 flex flex-col items-center justify-center">
                <span className="text-2xl font-mono font-bold text-white tracking-widest">
                  {hijriAdjustment > 0 ? `+${hijriAdjustment}` : hijriAdjustment}
                </span>
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">يوم</span>
              </div>
              <button onClick={() => onHijriChange(hijriAdjustment + 1)} disabled={hijriAdjustment >= 2} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/5">
                <Plus size={16} />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 text-center w-full pt-2 border-t border-white/5">أقصى تعديل مسموح (+/- يومين)</p>
          </div>
        </div>
      </div>

      {/* ── Donations ─────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-900/20 to-transparent relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12"><Heart size={80} /></div>
        <div className="relative z-10">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Heart size={16} className="text-emerald-400" />
            دعم التطبيق
          </h3>
          <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">ساهم في استمرار وتطوير تطبيق نور. صدقة جارية لك ولنا إن شاء الله.</p>
          <button
            onClick={() => alert('سيتم إضافة روابط التبرع قريباً')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 text-xs font-bold"
          >
            <Heart size={14} className="fill-white" />
            تـبـرع الآن
          </button>
        </div>
      </div>
    </div>
  );
};
