'use client';
 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Zap, Eye, EyeOff, ShieldAlert } from 'lucide-react';
 
export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
 
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
 
    const data = await res.json();
 
    if (!res.ok) {
      setError(data.error ?? 'Login failed.');
      setLoading(false);
      return;
    }
 
    router.push('/admin');
    router.refresh();
  };
 
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#08080a] overflow-hidden">
      
      {/* Background ambient glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-brand-blue/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-brand-yellow/10 rounded-full blur-[100px] pointer-events-none" />
 
      <div className="relative z-10 w-full max-w-md animate-reveal">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 mb-5 shadow-lg shadow-brand-blue/10">
            <Zap className="w-7 h-7 text-brand-yellow" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Admin Portal</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">BI4K — RESTRICTED ACCESS SYSTEM</p>
        </div>
 
        {/* Glassmorphic Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-10">
          <form id="admin-login-form" onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}
 
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="admin-email" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Security Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bi4k.com"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-100 text-sm placeholder:text-slate-600 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                />
              </div>
            </div>
 
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="admin-password" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Access Token / Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500 group-focus-within:text-brand-blue transition-colors pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-11 py-4 rounded-2xl bg-black/40 border border-white/5 text-slate-100 text-sm placeholder:text-slate-600 focus:border-brand-blue/50 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  id="admin-toggle-password"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>
 
            {/* Submit Button */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4.5 mt-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-brand-blue hover:bg-brand-blue/90 text-white shadow-xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Authorize Terminal Session'
              )}
            </button>
          </form>
        </div>
 
        {/* Professional hint panel */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span>Enterprise Security Guard Active</span>
          </p>
        </div>
      </div>
    </div>
  );
}
