'use client';
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { UploadCloud, ShoppingBag } from "lucide-react";

export default function CategoryDetailsPage() {
  const { lang } = useApp();
  const t = translations[lang];
  const pathname = usePathname();
  
  // Extract category from URL, e.g., /categories/tshirts -> tshirts
  const categoryId = pathname.split('/').pop() || '';
  
  // Dummy products based on category
  const dummyProducts = [
    { id: 1, name: "Premium Print 1", price: "29.99", image: "https://placehold.co/400x400/222/FFF?text=Design+1" },
    { id: 2, name: "Custom Design 2", price: "34.99", image: "https://placehold.co/400x400/222/FFF?text=Design+2" },
    { id: 3, name: "Limited Edition 3", price: "45.00", image: "https://placehold.co/400x400/222/FFF?text=Design+3" },
    { id: 4, name: "Artist Collab 4", price: "39.99", image: "https://placehold.co/400x400/222/FFF?text=Design+4" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-16 flex-grow">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Link href="/categories" className="text-sm text-primary hover:underline font-medium mb-4 inline-block">
              &larr; Back to Categories
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold capitalize">
              {categoryId.replace('-', ' ')}
            </h1>
            <p className="text-foreground/70 mt-4 max-w-2xl">
              Explore our collection of high-quality {categoryId.replace('-', ' ')}. Perfect for personalizing with your own 3D designs or AI creations.
            </p>
          </div>
          <Link href="/upload" className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary-hover transition-colors whitespace-nowrap">
            <UploadCloud className="w-5 h-5" />
            Upload Custom Design
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dummyProducts.map((product) => (
            <div key={product.id} className="group rounded-2xl bg-card-bg border border-card-border overflow-hidden hover:border-primary/50 transition-colors">
              <div className="aspect-square relative overflow-hidden bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-primary font-bold mb-4">${product.price}</p>
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-background border border-card-border hover:bg-primary hover:text-white hover:border-primary transition-colors font-medium">
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
