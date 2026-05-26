'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Zap, CheckCircle2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { useAuth } from "@/lib/hooks/useAuth";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  terms: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { lang, showToast } = useApp();
  const t = translations[lang];
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setAuthError(null);
    const { error, requiresConfirmation } = await signUp(data.email, data.password, data.name);
    if (error) {
      let message = error;
      if (error === 'User already registered') {
        message = lang === 'fr' ? 'Cet e-mail est déjà enregistré.' : 'User already registered.';
      }
      setAuthError(message);
    } else {
      if (requiresConfirmation) {
        showToast(lang === 'fr' ? 'Compte créé ! Veuillez confirmer votre e-mail.' : 'Account created! Please check your email.', 'success');
        setSuccess(true);
        setTimeout(() => router.push('/login'), 4000);
      } else {
        showToast(lang === 'fr' ? 'Compte créé avec succès !' : 'Account successfully created!', 'success');
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#08080a] text-foreground">

      {/* Left form panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 order-2 lg:order-1">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-yellow" />
            </div>
            <span className="font-black text-sm tracking-tighter uppercase text-white/70">BI4K</span>
          </div>

          <h2 className="text-3xl font-black tracking-tighter mb-1">{t.signupTitle}</h2>
          <p className="text-sm text-foreground/50 mb-8">{t.signupSubtitle}</p>

          {/* Success state */}
          {success ? (
            <div className="p-6 rounded-3xl bg-brand-blue/10 border border-brand-blue/20 text-center">
              <CheckCircle2 className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
              <p className="font-black text-lg text-brand-yellow mb-2">Account Created!</p>
              <p className="text-sm text-foreground/50">Check your email to confirm your account. Redirecting to sign in…</p>
            </div>
          ) : (
            <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {authError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                  {authError}
                </div>
              )}

              {/* Full name */}
              <div className="space-y-1.5">
                <label htmlFor="signup-name" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                  {t.signupNameLabel}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                  <input
                    id="signup-name"
                    {...register("name")}
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-card-border text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm font-medium"
                  />
                </div>
                {errors.name && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                  {t.signupEmailLabel}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                  <input
                    id="signup-email"
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
                <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                  {t.signupPasswordLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                  <input
                    id="signup-password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border border-card-border text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    id="signup-toggle-password"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label htmlFor="signup-confirm-password" className="block text-xs font-bold uppercase tracking-widest text-foreground/50">
                  {t.signupConfirmLabel}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 pointer-events-none" />
                  <input
                    id="signup-confirm-password"
                    {...register("confirmPassword")}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-white border border-card-border text-gray-900 placeholder-gray-400 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    id="signup-toggle-confirm"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground/70 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
              </div>

              {/* Terms */}
              <label htmlFor="signup-terms" className="flex items-start gap-3 cursor-pointer group mt-2">
                <input
                  id="signup-terms"
                  {...register("terms")}
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-brand-blue focus:ring-brand-blue/30 focus:ring-offset-0 shrink-0"
                />
                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors font-medium leading-relaxed">
                  {t.signupTerms}
                </span>
              </label>
              {errors.terms && <p className="text-rose-400 text-xs font-medium -mt-2">{errors.terms.message}</p>}

              {/* Submit */}
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-brand-blue hover:bg-brand-blue/90 text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-brand-blue/20 mt-2"
              >
                {isSubmitting
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><UserPlus className="w-4 h-4" />{t.signupBtn}</>
                }
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-foreground/40">
            {t.signupHaveAccount}{" "}
            <Link href="/login" id="signup-to-login-link" className="text-brand-yellow font-bold hover:text-brand-yellow/80 transition-colors">
              {t.signupLoginLink}
            </Link>
          </p>
          <div className="mt-4 text-center">
            <Link href="/" id="signup-back-home" className="text-xs text-foreground/30 hover:text-foreground/60 transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Right decorative panel */}
      <div className="hidden lg:flex w-[42%] relative flex-col items-center justify-center p-16 overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-blue/30 via-[#08080a] to-[#08080a]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-brand-blue/15 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #4A90E2 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-sm text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3.5 h-3.5" />
            Get Started
          </div>
          <h1 className="text-4xl font-black tracking-tighter leading-tight mb-4 text-white">
            Your creative<br /><span className="text-brand-yellow">journey starts here.</span>
          </h1>
          <p className="text-sm text-white/40 font-medium leading-relaxed">
            Join thousands of creators who are designing, printing, and shipping their ideas with BI4K.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: "10k+", label: "Active Creators" },
              { value: "99%", label: "Satisfaction Rate" },
              { value: "24h", label: "Delivery in Morocco" },
              { value: "∞", label: "Design Possibilities" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-2xl font-black text-brand-yellow">{stat.value}</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
