'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { UploadCloud, Zap, Shield, MessageCircle, Boxes, Sparkles, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { lang } = useApp();
  const t = translations[lang];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto mb-24 animate-fadeInUp">
          <div className="px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium tracking-wide border border-accent/20 flex items-center gap-2 hover-lift">
            <Sparkles className="w-4 h-4" />
            {t.badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            {lang === 'fr' ? 'Sublimez votre style avec' : 'Elevate Your Style with'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradientShift">BI4K</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 leading-relaxed max-w-2xl">
            {t.heroDesc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Link href="/upload" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-primary to-primary-hover text-white hover:scale-105 transition-all shadow-lg hover:shadow-primary/40 duration-300 group">
              <UploadCloud className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Upload 3D Model
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/categories" className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold bg-card-bg border border-card-border hover:bg-card-bg/80 hover:border-primary/50 transition-all hover-lift">
              Explore Categories
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {/* Large Feature Card */}
          <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-card-bg to-card-bg/50 border border-card-border flex flex-col justify-between hover:border-primary/50 transition-all hover-lift group overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-foreground/70 leading-relaxed">Experience industry-leading turnaround times. Most orders are printed and shipped within 24 hours globally.</p>
            </div>
            <div className="mt-8 h-32 rounded-xl bg-gradient-to-r from-primary/20 via-accent/10 to-transparent group-hover:from-primary/30 transition-all"></div>
          </div>

          {/* Secondary Feature Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card-bg to-card-bg/50 border border-card-border flex flex-col justify-between hover:border-secondary/50 transition-all hover-lift group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 p-3 rounded-lg bg-secondary/10 w-fit group-hover:bg-secondary/20 transition-colors">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Industrial Quality</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">State-of-the-art printers and premium materials ensuring exceptional strength and precision.</p>
            </div>
          </div>

          {/* Accent Feature Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-card-bg to-card-bg/50 border border-card-border flex flex-col justify-between hover:border-accent/50 transition-all hover-lift group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 p-3 rounded-lg bg-accent/10 w-fit group-hover:bg-accent/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Support</h3>
              <p className="text-foreground/70 text-sm leading-relaxed">Our engineering experts are available 24/7 to help optimize your designs.</p>
            </div>
          </div>

          {/* Categories Feature Card */}
          <div className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 flex flex-col justify-between hover:border-primary/50 transition-all hover-lift group">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                <Boxes className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">{t.homeCategoriesTitle}</h3>
              <p className="text-foreground/70 mb-6 leading-relaxed">{t.homeCategoriesDesc}</p>
              <Link href="/categories" className="inline-flex items-center font-bold text-primary hover:text-primary-hover group/link">
                View all categories
                <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10 border border-primary/20 text-center mt-20 hover-lift">
          <h2 className="text-3xl font-bold mb-4">Ready to create?</h2>
          <p className="text-foreground/70 mb-6">Join thousands of creators making unique, high-quality designs with BI4K.</p>
          <Link href="/categories" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover transition-colors">
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
