'use client';
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HelpCircle, Truck, RefreshCcw, ShieldCheck, Mail } from "lucide-react";

export default function HelpPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const helpCards = [
    { title: t.helpCard1Title, desc: t.helpCard1Desc, icon: Truck },
    { title: t.helpCard2Title, desc: t.helpCard2Desc, icon: RefreshCcw },
    { title: t.helpCard3Title, desc: t.helpCard3Desc, icon: HelpCircle },
    { title: t.helpCard4Title, desc: t.helpCard4Desc, icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.helpHeroTitle}</h1>
          <p className="text-foreground/70 text-lg">{t.helpHeroDesc}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {helpCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="p-8 rounded-3xl bg-card-bg border border-card-border hover:border-brand-blue/50 transition-colors group text-center">
                <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-brand-yellow" />
                </div>
                <h3 className="font-bold mb-2">{card.title}</h3>
                <p className="text-sm text-foreground/70">{card.desc}</p>
              </div>
            );
          })}
        </div>

        <section className="bg-card-bg border border-card-border rounded-[2.5rem] p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{t.contactSectionTitle}</h2>
          <p className="text-foreground/70 mb-8">{t.contactSectionDesc}</p>
          <a href="mailto:support@bi4k.com" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-brand-blue text-white hover:bg-brand-blue/90 transition-colors">
            <Mail className="w-5 h-5" />
            Contact Support
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
