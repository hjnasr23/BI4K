'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Boxes, Mail, Lock } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    // Ready for Prisma/Supabase auth
    console.log("Login data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-fadeInUp">
        <div className="flex justify-center mb-6 text-primary">
          <Boxes className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">{t.loginTitle}</h2>
        <p className="text-center text-foreground/70 mb-8">{t.loginSubtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.loginEmailLabel}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input 
                {...register("email")}
                type="email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.loginPasswordLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input 
                {...register("password")}
                type="password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-card-border text-primary focus:ring-primary bg-background" />
              {t.loginRemember}
            </label>
            <Link href="#" className="text-primary hover:text-primary-hover font-medium">
              {t.loginForgot}
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isSubmitting ? "..." : t.loginBtn}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/70">
          {t.loginNoAccount}{" "}
          <Link href="/signup" className="text-primary font-bold hover:underline">
            {t.loginSignupLink}
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm">
          <Link href="/" className="text-foreground/50 hover:text-foreground">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
