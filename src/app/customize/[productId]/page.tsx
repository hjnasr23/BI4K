'use client';
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Upload, ArrowRight, Zap, Palette, Boxes } from "lucide-react";

export default function ChoicePage() {
  const { lang } = useApp();
  const params = useParams();
  const searchParams = useSearchParams();

  const productId = params.productId as string;
  const mockupUrl = searchParams.get('mockupUrl') || '';

  const options = [
    {
      id: 'ai',
      title: lang === 'fr' ? 'Studio IA' : 'AI Magic Studio',
      desc: lang === 'fr'
        ? 'Laissez notre intelligence artificielle transformer vos mots en designs spectaculaires.'
        : 'Let our artificial intelligence transform your words into spectacular designs.',
      icon: Sparkles,
      color: 'bg-primary',
      accent: 'text-primary',
      badge: 'Most Popular',
      link: `/editor?productId=${productId}&mockupUrl=${encodeURIComponent(mockupUrl)}`
    },
    {
      id: 'upload',
      title: lang === 'fr' ? 'Upload Master' : 'Upload Master',
      desc: lang === 'fr'
        ? 'Prenez le contrôle total en utilisant vos propres créations et logos personnalisés.'
        : 'Take full control by using your own custom creations and logos.',
      icon: Upload,
      color: 'bg-secondary',
      accent: 'text-secondary',
      link: `/upload?productId=${productId}&mockupUrl=${encodeURIComponent(mockupUrl)}`
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-16 flex-grow flex flex-col items-center justify-center relative z-10">
        {/* Animated Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-96 h-96 bg-primary/30 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/30 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        </div>

        <div className="text-center mb-20 max-w-3xl animate-reveal">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 mb-8">
            <Palette className="w-3 h-3 text-primary" />
            Customization Hub
          </div>

          <p className="text-xl text-foreground/50 font-medium leading-relaxed max-w-2xl mx-auto">
            {lang === 'fr'
              ? 'Choisissez comment vous souhaitez donner vie à votre vision créative.'
              : 'Choose how you want to bring your creative vision to life.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl animate-reveal">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Link
                key={option.id}
                href={option.link}
                className="group relative overflow-hidden rounded-[3rem] bg-card-bg border border-card-border p-12 hover:border-primary/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] shadow-2xl"
              >
                {/* Glow Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${option.id === 'ai' ? 'from-primary/10' : 'from-secondary/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                {option.badge && (
                  <div className="absolute top-8 right-8 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                    {option.badge}
                  </div>
                )}

                <div className={`w-20 h-20 rounded-[1.5rem] ${option.color}/20 flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform duration-500 shadow-inner`}>
                  <Icon className={`w-10 h-10 ${option.accent} group-hover:scale-110 transition-transform`} />
                </div>

                <h2 className="text-4xl font-black mb-6 flex items-center gap-4 tracking-tighter">
                  {option.title}
                  <ArrowRight className="w-8 h-8 opacity-0 -translate-x-6 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary" />
                </h2>

                <p className="text-xl text-foreground/50 font-medium leading-relaxed mb-10 max-w-sm">
                  {option.desc}
                </p>

                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-primary group-hover:gap-5 transition-all">
                  {lang === 'fr' ? 'Commencer la création' : 'Start Creating'}
                  <div className="w-10 h-px bg-primary/30 group-hover:w-20 transition-all" />
                </div>

                {/* Decorative background number */}
                <span className="absolute -right-10 -bottom-10 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none italic group-hover:scale-110 transition-transform duration-1000">
                  {option.id === 'ai' ? '01' : '02'}
                </span>
              </Link>
            );
          })}
        </div>

        <Link href="/categories/tshirts" className="mt-20 group flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-foreground/30 hover:text-primary transition-colors">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            &larr;
          </div>
          {lang === 'fr' ? 'Explorer d\'autres produits' : 'Explore other products'}
        </Link>
      </main>

      <Footer />
    </div>
  );
}
