'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Zap, Eye, EyeOff } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <Zap className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-slate-500 mt-1">BI4K — Restricted Access</p>
        </div>

        <form id="admin-login-form" onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bi4k.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 pointer-events-none" />
              <input
                id="admin-password"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 text-sm placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
              />
              <button
                type="button"
                id="admin-toggle-password"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-widest bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Sign In to Admin'
            }
          </button>
        </form>

        {/* Hint box */}
        <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/5 text-center">
          <p className="text-[11px] text-slate-600 font-medium">
            Credentials are set in <code className="text-slate-500">.env.local</code>
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            <code className="text-violet-500">ADMIN_EMAIL</code> &amp; <code className="text-violet-500">ADMIN_PASSWORD</code>
          </p>
        </div>
      </div>
    </div>
  );
}
