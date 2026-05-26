'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { useAuth } from '@/lib/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  remember: z.boolean().optional(),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { lang, showToast } = useApp();
  const t = translations[lang];
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
      // Map standard Supabase error messages
      let message = error;
      if (error === 'Invalid login credentials') {
        message = lang === 'fr' ? 'Identifiants invalides.' : 'Invalid login credentials.';
      }
      setAuthError(message);
    } else {
      showToast(lang === 'fr' ? 'Connexion réussie !' : 'Login successful!', 'success');
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex bg-[#08080a] text-foreground">

      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[45%] relative flex-col items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/30 via-[#08080a] to-[#08080a]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-blue/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-yellow/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #4A90E2 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-sm text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest mb-8">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secure Access
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-tight mb-4 text-white">
            Welcome<br /><span className="text-brand-yellow">back.</span>
          </h1>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Sign in to access your custom creations, track your orders, and continue designing.
          </p>
          <div className="mt-10 space-y-3 text-left">
            {["AI-powered design studio", "Real-time order tracking", "Saved design library"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-2.5 h-2.5 text-brand-blue" />
                </div>
                <span className="text-xs text-white/50 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-yellow" />
            </div>
            <span className="font-black text-sm tracking-tighter uppercase text-white/70">BI4K</span>
          </div>

          <h2 className="text-3xl font-black tracking-tighter mb-1">{t.loginTitle}</h2>
          <p className="text-sm text-foreground/50 mb-8">{t.loginSubtitle}</p>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {authError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {authError}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                {t.loginEmailLabel}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                <input
                  id="login-email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-card-border text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm font-medium"
                />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                {t.loginPasswordLabel}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                <input
                  id="login-password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border border-card-border text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  id="login-toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
            </div>

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between">
              <label htmlFor="login-remember" className="flex items-center gap-2 cursor-pointer group">
                <input
                  id="login-remember"
                  {...register("remember")}
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue/30 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors font-medium">
                  {t.loginRemember}
                </span>
              </label>
              <Link href="#" id="login-forgot-link" className="text-xs text-brand-yellow hover:text-brand-yellow/80 font-bold transition-colors">
                {t.loginForgot}
              </Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-brand-blue hover:bg-brand-blue/90 text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20 mt-2"
            >
              {isSubmitting
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><LogIn className="w-4 h-4" />{t.loginBtn}</>
              }
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-foreground/40">
            {t.loginNoAccount}{" "}
            <Link href="/signup" id="login-to-signup-link" className="text-brand-yellow font-bold hover:text-brand-yellow/80 transition-colors">
              {t.loginSignupLink}
            </Link>
          </p>
          <div className="mt-4 text-center">
            <Link href="/" id="login-back-home" className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
