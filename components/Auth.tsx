
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2, Mail, Lock, User, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1. Input Sanitization
    const cleanEmail = email.trim();
    const cleanUsername = username.trim().toLowerCase();
    
    // 2. Strict Validation Regex (Alphanumeric + Underscore only)
    const usernameRegex = /^[a-z0-9_]+$/;

    try {
      if (isSignUp) {
        // Validation Checks
        if (cleanUsername.length < 4) {
          throw new Error('يجب أن يتكون اسم المستخدم من 4 حروف على الأقل');
        }

        if (cleanUsername.length > 20) {
          throw new Error('اسم المستخدم طويل جداً');
        }

        if (!usernameRegex.test(cleanUsername)) {
           throw new Error('اسم المستخدم يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطة سفلية (_) فقط');
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              first_name: firstName.trim(),
              last_name: lastName.trim()
            }
          }
        });
        
        if (error) {
            if (error.message.includes('unique constraint')) {
                throw new Error('اسم المستخدم مستخدم بالفعل');
            }
            throw error;
        }
        
        if (data.session) {
           setMessage('تم إنشاء الحساب بنجاح!');
           window.location.reload();
        } else {
           setMessage('تم إنشاء الحساب! يرجى التحقق من البريد الإلكتروني.');
        }
      } else {
        // Sign In Logic (Email or Username)
        let signInEmail = cleanEmail;

        // Check if input is NOT an email (assume username)
        if (!cleanEmail.includes('@')) {
           // Use RPC function to get email from username securely
           const { data: emailData, error: emailError } = await supabase
             .rpc('get_email_by_username', { username_input: cleanEmail });
           
           if (emailError || !emailData) {
             console.error('Username lookup failed:', emailError);
             throw new Error('اسم المستخدم غير موجود');
           }
           signInEmail = emailData;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage(error.message || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
           {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h2>
        <p className="text-slate-400 text-xs">
           {isSignUp 
             ? 'احفظ تقدمك وبياناتك في ملف واحد آمن' 
             : 'مرحباً بعودتك'}
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs text-center mb-4 flex items-center justify-center gap-2 ${message.includes('نجاح') ? 'bg-emerald-500/20 text-emerald-200' : 'bg-red-500/20 text-red-200'}`}>
          {!message.includes('نجاح') && <AlertCircle size={14} />}
          {message}
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-4">
        {isSignUp && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <div className="flex gap-2">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs text-slate-400 mr-1 font-bold">الاسم الأول</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="محمد"
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs text-slate-400 mr-1 font-bold">اسم العائلة</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 px-3 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="أحمد"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 mr-1 font-bold">اسم المستخدم</label>
                <div className="relative">
                    <User className="absolute right-3 top-3 text-slate-500" size={16} />
                    <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        if (/^[a-z0-9_]*$/.test(val)) {
                            setUsername(val);
                        }
                    }}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors dir-ltr"
                    placeholder="username"
                    minLength={4}
                    maxLength={20}
                    />
                </div>
                <p className="text-[10px] text-slate-500 mr-1">أحرف إنجليزية وأرقام و "_" فقط</p>
              </div>
            </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 mr-1 font-bold">{isSignUp ? 'البريد الإلكتروني' : 'البريد الإلكتروني أو اسم المستخدم'}</label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 text-slate-500" size={16} />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors dir-ltr"
              placeholder={isSignUp ? "name@example.com" : "username or email"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-slate-400 mr-1 font-bold">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-3 text-slate-500" size={16} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:border-emerald-500 focus:outline-none transition-colors dir-rtl"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : (
            <>
              {isSignUp ? (
                 <><span>إنشاء حساب</span><UserPlus size={18} /></>
              ) : (
                 <><span>دخول</span><LogIn size={18} /></>
              )}
            </>
          )}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-white/5 text-center">
        <button
          onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
          className="text-slate-400 text-xs hover:text-white transition-colors"
        >
          {isSignUp ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب جديد'}
        </button>
      </div>
    </div>
  );
};
