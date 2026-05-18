'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserPlus, LogIn } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema)
  });

  const supabase = createClient();

  if (!isAuthModalOpen) return null;

  const closeModal = () => {
    setIsAuthModalOpen(false);
    reset();
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const onSubmit = async (data: AuthFormValues) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        closeModal();
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        setSuccessMsg("Check your email to confirm your account!");
        reset();
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-xl animate-fadeIn">
       {/* Animated Background Blobs for Modal */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/40 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/40 rounded-full blur-[80px] animate-blob animation-delay-2000" />
       </div>

      <div className="relative w-full max-w-lg overflow-hidden glass border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[3rem] animate-reveal">
        
        <button 
          onClick={closeModal}
          className="absolute top-8 right-8 text-foreground/20 hover:text-primary transition-colors bg-white/5 hover:bg-white/10 rounded-2xl p-3 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row">
           {/* Visual Sidebar (Hidden on mobile) */}
           <div className="hidden lg:flex w-40 bg-gradient-to-b from-primary to-accent p-8 flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10 flex flex-col gap-8">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                 </div>
                 <div className="space-y-4">
                    <div className="w-1 h-8 bg-white/30 rounded-full" />
                    <div className="w-1 h-12 bg-white rounded-full" />
                    <div className="w-1 h-8 bg-white/30 rounded-full" />
                 </div>
              </div>
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 rotate-[-90deg] origin-left translate-y-[-20px] whitespace-nowrap">
                   BI4K SECURE ACCESS
                 </p>
              </div>
           </div>

           <div className="flex-1 p-12">
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                  {isLogin ? 'Member Access' : 'New Creator'}
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-4">
                  {isLogin ? 'Welcome Back' : 'Join BI4K'}
                </h2>
                <p className="text-sm text-foreground/40 font-medium">
                  {isLogin ? 'Enter your credentials to manage your designs.' : 'Start your creative journey with AI today.'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-8 p-5 text-xs font-bold text-accent bg-accent/5 border border-accent/10 rounded-2xl animate-reveal">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-8 p-5 text-xs font-bold text-green-400 bg-green-400/5 border border-green-400/10 rounded-2xl animate-reveal">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input 
                      {...register("email")}
                      type="email"
                      placeholder="name@studio.com"
                      className="w-full pl-14 pr-6 py-4 bg-background/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-accent mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.email.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
                    <input 
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-4 bg-background/50 border border-card-border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-medium text-sm"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] text-accent mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.password.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 mt-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-primary hover:bg-primary-hover shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      {isLogin ? 'Authorize Access' : 'Create Account'}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-card-border text-center">
                <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
                  {isLogin ? "No account yet?" : "Already a member?"}
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }}
                    className="ml-3 font-black text-primary hover:text-primary-hover transition-colors"
                  >
                    {isLogin ? 'Register Hub' : 'Login Securely'}
                  </button>
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 opacity-10">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-[8px] font-black uppercase tracking-[0.3em]">AES-256 Bit Encryption</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
