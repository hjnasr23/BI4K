'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserPlus, LogIn, User, Phone, MapPin } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, lang, showToast, authModalView } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema)
  });

  const supabase = createClient();

  useEffect(() => {
    if (isAuthModalOpen) {
      setIsLogin(authModalView === 'login');
    }
  }, [isAuthModalOpen, authModalView]);

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
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;

        // Upsert profiles on login just in case
        if (authData.user) {
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: authData.user.user_metadata?.full_name ?? '',
              preferred_lang: 'fr',
            });
          } catch (dbErr) {
            console.error('Failed to upsert profiles on login:', dbErr);
          }
        }

        showToast(lang === 'fr' ? 'Connexion réussie !' : 'Login successful!', 'success');
        closeModal();
      } else {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName ?? '',
              phone: data.phone ?? '',
              address: data.address ?? '',
            }
          }
        });
        if (error) throw error;

        // Upsert profiles profile
        if (authData.user) {
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: data.fullName ?? '',
              phone: data.phone ?? '',
              shipping_address: data.address ?? '',
              preferred_lang: 'fr',
            });
          } catch (dbErr) {
            console.error('Failed to upsert profiles on signup:', dbErr);
          }
        }

        const requiresConfirmation = authData.session === null;
        if (requiresConfirmation) {
          const msg = lang === 'fr' ? 'Compte créé ! Veuillez confirmer votre e-mail.' : 'Account created! Please check your email.';
          setSuccessMsg(msg);
          showToast(msg, 'success');
        } else {
          const msg = lang === 'fr' ? 'Compte créé avec succès !' : 'Account successfully created!';
          setSuccessMsg(msg);
          showToast(msg, 'success');
        }
        reset();
      }
    } catch (error: any) {
      let msg = error.message;
      if (error.message === 'Invalid login credentials') {
        msg = lang === 'fr' ? 'Identifiants invalides.' : 'Invalid login credentials.';
      } else if (error.message === 'User already registered') {
        msg = lang === 'fr' ? 'Cet e-mail est déjà enregistré.' : 'User already registered.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-xl animate-fadeIn">
       {/* Animated Background Blobs for Modal */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-blue/40 rounded-full blur-[80px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-yellow/30 rounded-full blur-[80px] animate-blob animation-delay-2000" />
       </div>

      <div className="relative w-full max-w-lg overflow-hidden glass border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[3rem] animate-reveal">
        
        <button 
          onClick={closeModal}
          className="absolute top-8 right-8 text-foreground/20 hover:text-brand-yellow transition-colors bg-white/5 hover:bg-white/10 rounded-2xl p-3 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col lg:flex-row">
           {/* Visual Sidebar (Hidden on mobile) */}
           <div className="hidden lg:flex w-40 bg-gradient-to-b from-brand-blue to-brand-yellow p-8 flex-col justify-between relative overflow-hidden">
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-4">
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
                <div className="mb-8 p-5 text-xs font-bold text-brand-yellow bg-brand-yellow/5 border border-brand-yellow/10 rounded-2xl animate-reveal">
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
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-brand-blue transition-colors" />
                    <input 
                      {...register("email")}
                      type="email"
                      placeholder="name@studio.com"
                      className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm placeholder-gray-400"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] text-brand-yellow mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.email.message}</p>}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-brand-blue transition-colors" />
                    <input 
                      {...register("password")}
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm placeholder-gray-400"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] text-brand-yellow mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.password.message}</p>}
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-3 animate-reveal">
                      <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Nom complet / Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-brand-blue transition-colors" />
                        <input 
                          {...register("fullName")}
                          type="text"
                          placeholder="John Doe"
                          className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 animate-reveal">
                      <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Téléphone / Phone</label>
                      <div className="relative group">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-brand-blue transition-colors" />
                        <input 
                          {...register("phone")}
                          type="tel"
                          placeholder="+212 600-000000"
                          className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 animate-reveal">
                      <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">Adresse de livraison / Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/20 group-focus-within:text-brand-blue transition-colors" />
                        <input 
                          {...register("address")}
                          type="text"
                          placeholder="123 Rue de la Liberté, Casablanca"
                          className="w-full pl-14 pr-6 py-4 bg-white text-gray-900 border border-card-border rounded-2xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue outline-none transition-all font-medium text-sm placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {errorMsg && (
                  <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center animate-reveal">
                    {errorMsg}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 mt-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white bg-brand-blue hover:bg-brand-blue/90 shadow-2xl shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group/btn"
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
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {isLogin ? "No account yet?" : "Already a member?"}
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }}
                    className="ml-3 font-black text-brand-blue hover:text-brand-blue/80 transition-colors"
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
