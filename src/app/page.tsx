'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { UploadCloud, Zap, Shield, MessageCircle, Boxes } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <section className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto mb-24 animate-fadeInUp">
          <div className="px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium tracking-wide">
            {t.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            {lang === 'fr' ? 'Sublimez votre style avec' : 'Elevate Your Style with'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">BI4K</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/upload" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover hover:scale-105 transition-all shadow-lg hover:shadow-primary/25">
              <UploadCloud className="w-5 h-5" />
              Upload 3D Model
            </Link>
            <Link href="/categories" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-card-bg border border-card-border hover:bg-card-bg/80 transition-colors">
              Explore Categories
            </Link>
          </div>
        </section>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-card-bg border border-card-border flex flex-col justify-between hover:border-primary/50 transition-colors group">
            <div>
              <Zap className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-foreground/70">Experience industry-leading turnaround times. Most orders are printed and shipped within 24 hours globally.</p>
            </div>
            <div className="mt-8 h-32 rounded-xl bg-gradient-to-r from-primary/20 to-transparent"></div>
          </div>

          <div className="p-8 rounded-3xl bg-card-bg border border-card-border flex flex-col justify-between hover:border-secondary/50 transition-colors group">
            <div>
              <Shield className="w-10 h-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">Industrial Quality</h3>
              <p className="text-foreground/70">State-of-the-art printers and premium materials ensuring exceptional strength and precision.</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-card-bg border border-card-border flex flex-col justify-between hover:border-accent/50 transition-colors group">
            <div>
              <MessageCircle className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">Expert Support</h3>
              <p className="text-foreground/70">Our engineering experts are available 24/7 to help optimize your designs for manufacturability.</p>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-card-bg border border-card-border flex flex-col justify-between hover:border-primary/50 transition-colors group">
            <div>
              <Boxes className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold mb-2">{t.homeCategoriesTitle}</h3>
              <p className="text-foreground/70 mb-6">{t.homeCategoriesDesc}</p>
              <Link href="/categories" className="inline-flex items-center font-bold text-primary hover:text-primary-hover">
                View all categories &rarr;
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
