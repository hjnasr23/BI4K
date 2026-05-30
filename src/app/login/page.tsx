'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, User, Phone, MapPin, X, Boxes } from "lucide-react";
import { useApp } from "@/lib/store";
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from "@/lib/supabase";

// ── Validation Schemas ────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const signupSchema = z.object({
  fullName: z.string().min(3, { message: "Full Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(10, { message: "Phone must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});
type SignupFormValues = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const { lang, showToast } = useApp();
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  // Dual-state control
  const [isLogin, setIsLogin] = useState(true);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('suspended') === 'true') {
        setIsSuspended(true);
      }
    }
  }, []);

  // Forms
  const { 
    register: registerLogin, 
    handleSubmit: handleLoginSubmit, 
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const { 
    register: registerSignup, 
    handleSubmit: handleSignupSubmit, 
    formState: { errors: signupErrors, isSubmitting: isSignupSubmitting } 
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  // Login handler
  const onLoginSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    const { error } = await signIn(data.email, data.password);
    if (error) {
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

  // Signup handler
  const onSignupSubmit = async (data: SignupFormValues) => {
    setAuthError(null);
    const { error, requiresConfirmation } = await signUp(
      data.email,
      data.password,
      data.fullName,
      data.phone,
      data.address
    );
    if (error) {
      setAuthError(error);
    } else {
      // Sync phone and shipping address directly to standard profile columns
      try {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          await supabase.from('profiles').update({
            phone: data.phone,
            shipping_address: { street: data.address, country: "Morocco" }
          }).eq('id', sbUser.id);
        }
      } catch (dbErr) {
        console.error("Failed to update profile attributes during signup:", dbErr);
      }

      if (requiresConfirmation) {
        showToast(lang === 'fr' ? 'Compte créé ! Veuillez vérifier votre email.' : 'Account created! Please check your email.', 'success');
        setIsLogin(true);
      } else {
        showToast(lang === 'fr' ? 'Inscription réussie !' : 'Registration successful!', 'success');
        router.push('/');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors duration-500 flex items-center justify-center p-4 md:p-8">
      
      {/* Modal-style Card Wrapper */}
      <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white dark:bg-neutral-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
        
        {/* Left Branding Panel (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[35%] bg-gradient-to-b from-blue-500 to-amber-500 relative flex-col justify-between overflow-hidden shrink-0">
          {/* Subtle noise/dotted pattern overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          {/* Vertical dashed line in the middle */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-dashed border-white/20 pointer-events-none" />

          {/* Logo icon at top left */}
          <div className="p-8 relative z-10 self-start">
            <Link href="/" className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-105 transition-transform shadow-md">
              <Boxes className="w-6 h-6 text-white" />
            </Link>
          </div>

          {/* Rotated text at bottom left */}
          <div className="relative z-10 p-8 h-40">
            <span className="-rotate-90 origin-bottom-left absolute bottom-12 left-12 text-white/80 tracking-[0.2em] text-[10px] font-bold uppercase whitespace-nowrap block">
              BI4K SECURE ACCESS
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-[65%] p-10 md:p-14 relative flex flex-col justify-between min-h-[620px]">
          
          {/* Close Button at absolute top right */}
          <Link 
            href="/" 
            className="absolute top-8 right-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </Link>

          <div className="w-full">
            {/* Header Badge */}
            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full px-4 py-1.5 text-[10px] font-bold tracking-wider w-fit mb-4 uppercase">
              {isLogin ? "MEMBER ACCESS" : "NEW CREATOR"}
            </div>

            {/* Form Title & Subtitle */}
            <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Join BI4K"}
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-2 font-medium">
              {isLogin 
                ? "Sign in to access your secure design studio." 
                : "Create your account and start customized designs."}
            </p>

            {isSuspended && (
              <div className="p-4 my-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {lang === 'fr' ? "Votre compte a été suspendu par l'administrateur." : "Your account has been suspended by the admin."}
              </div>
            )}

            {authError && (
              <div className="p-4 my-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium">
                {authError}
              </div>
            )}

            {/* DYNAMIC FORMS */}
            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-1">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Email Address
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Mail className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="login-email"
                      {...registerLogin("email")}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
                    />
                  </div>
                  {loginErrors.email && <p className="text-rose-400 text-xs mt-1 font-medium">{loginErrors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Password
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 relative">
                    <Lock className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="login-password"
                      {...registerLogin("password")}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {loginErrors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{loginErrors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isLoginSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl py-4 mt-8 transition-all duration-300 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoginSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setAuthError(null);
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 hover:text-blue-500 cursor-pointer transition-colors"
                  >
                    NO ACCOUNT YET? Register Hub
                  </button>
                </div>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-1">
                {/* Full Name */}
                <div>
                  <label htmlFor="signup-name" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Full Name
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <User className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="signup-name"
                      {...registerSignup("fullName")}
                      type="text"
                      placeholder="Mohamed Alami"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
                    />
                  </div>
                  {signupErrors.fullName && <p className="text-rose-400 text-xs mt-1 font-medium">{signupErrors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="signup-email" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Email Address
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Mail className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="signup-email"
                      {...registerSignup("email")}
                      type="email"
                      placeholder="you@example.com"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
                    />
                  </div>
                  {signupErrors.email && <p className="text-rose-400 text-xs mt-1 font-medium">{signupErrors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="signup-phone" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Phone Number
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <Phone className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="signup-phone"
                      {...registerSignup("phone")}
                      type="tel"
                      placeholder="+212 600-000000"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
                    />
                  </div>
                  {signupErrors.phone && <p className="text-rose-400 text-xs mt-1 font-medium">{signupErrors.phone.message}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="signup-address" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Shipping Address
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    <MapPin className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="signup-address"
                      {...registerSignup("address")}
                      type="text"
                      placeholder="25, Bd Anfa, Casablanca"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium"
                    />
                  </div>
                  {signupErrors.address && <p className="text-rose-400 text-xs mt-1 font-medium">{signupErrors.address.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="signup-password" className="text-[10px] font-bold tracking-widest uppercase text-neutral-800 dark:text-neutral-300 mb-2 mt-6 block">
                    Password
                  </label>
                  <div className="flex items-center bg-blue-50/40 dark:bg-neutral-800/50 border border-blue-100 dark:border-neutral-700 rounded-2xl px-4 py-3.5 transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 relative">
                    <Lock className="text-neutral-500 w-5 h-5 mr-3 shrink-0" />
                    <input
                      id="signup-password"
                      {...registerSignup("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="bg-transparent outline-none w-full text-sm text-neutral-900 dark:text-white placeholder-neutral-400 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                  {signupErrors.password && <p className="text-rose-400 text-xs mt-1 font-medium">{signupErrors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isSignupSubmitting}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl py-4 mt-8 transition-all duration-300 shadow-lg shadow-blue-500/30 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSignupSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Create Account
                    </>
                  )}
                </button>

                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setAuthError(null);
                    }}
                    className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 hover:text-blue-500 cursor-pointer transition-colors"
                  >
                    ALREADY A MEMBER? Login Securely
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Security Footer */}
          <div className="text-neutral-300 dark:text-neutral-600 text-[9px] uppercase tracking-widest flex items-center justify-center gap-1 mt-auto pt-8 border-t border-neutral-100 dark:border-neutral-800">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
            AES-256 BIT ENCRYPTION
          </div>
        </div>
      </div>
    </div>
  );
}

