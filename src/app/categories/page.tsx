'use client';
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Shirt, Coffee, Smartphone, Image as ImageIcon, Boxes } from "lucide-react";

export default function CategoriesPage() {
  const { lang } = useApp();
  const t = translations[lang];

  const categories = [
    { id: 'tshirts', name: t.cat1Title, desc: t.cat1Desc, icon: Shirt, color: 'text-primary' },
    { id: 'hoodies', name: t.cat2Title, desc: t.cat2Desc, icon: Shirt, color: 'text-secondary' },
    { id: 'mugs', name: t.cat3Title, desc: t.cat3Desc, icon: Coffee, color: 'text-accent' },
    { id: 'phone-cases', name: t.cat4Title, desc: t.cat4Desc, icon: Smartphone, color: 'text-primary' },
    { id: 'caps', name: t.cat5Title, desc: t.cat5Desc, icon: Boxes, color: 'text-secondary' }, // Assuming Hat is not in lucide-react or we use Boxes
    { id: 'canvas', name: t.cat6Title, desc: t.cat6Desc, icon: ImageIcon, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-center">
          {t.homeCategoriesTitle}
        </h1>
        <p className="text-center text-foreground/70 max-w-2xl mx-auto mb-16">
          {t.homeCategoriesDesc}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link 
                href={`/categories/${cat.id}`} 
                key={cat.id}
                className="p-8 rounded-3xl bg-card-bg border border-card-border flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 transition-all group"
              >
                <div>
                  <div className={`p-4 rounded-2xl bg-background inline-block mb-6 shadow-sm border border-card-border`}>
                    <Icon className={`w-8 h-8 ${cat.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{cat.name}</h3>
                  <p className="text-foreground/70">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
