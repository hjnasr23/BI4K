'use client';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Boxes, Mail, Lock, User } from "lucide-react";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    // Ready for Prisma/Supabase auth
    console.log("Signup data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-card-bg border border-card-border shadow-2xl animate-fadeInUp">
        <div className="flex justify-center mb-6 text-primary">
          <Boxes className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-2">{t.signupTitle}</h2>
        <p className="text-center text-foreground/70 mb-8">{t.signupSubtitle}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t.signupNameLabel}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input 
                {...register("name")}
                type="text"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.signupEmailLabel}</label>
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
            <label className="block text-sm font-medium mb-1">{t.signupPasswordLabel}</label>
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

          <div>
            <label className="block text-sm font-medium mb-1">{t.signupConfirmLabel}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
              <input 
                {...register("confirmPassword")}
                type="password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-card-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-70 flex justify-center items-center mt-6"
          >
            {isSubmitting ? "..." : t.signupBtn}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-foreground/70">
          {t.signupHaveAccount}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            {t.signupLoginLink}
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
