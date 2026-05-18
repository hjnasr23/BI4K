'use client';
import { useState, useMemo } from 'react';
import { allProducts } from '@/data/products';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [sort, setSort] = useState('default');

  const categories = ['Tous', 'T-Shirts', 'Mugs', 'Hoodies', 'Casquettes', 'Accessories', 'Déco'];

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (category !== 'Tous') {
      result = result.filter(p => p.category === category);
    }

    if (sort === 'price_asc') {
      result.sort((a, b) => a.basePrice - b.basePrice);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => b.basePrice - a.basePrice);
    }

    return result;
  }, [search, category, sort]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Nos Produits à Personnaliser</h1>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-card-border bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === c 
                  ? 'bg-primary text-white border border-primary' 
                  : 'bg-card-bg text-foreground border border-card-border hover:border-primary'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <select
          className="w-full md:w-48 px-4 py-2 rounded-full border border-card-border bg-background"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Trier par</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group">
            <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden transition-shadow hover:shadow-xl">
              <div className="aspect-[4/5] bg-white relative overflow-hidden">
                <img
                  src={product.mockupUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{product.category}</span>
                <h3 className="font-bold text-lg mt-1 mb-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="font-bold">À partir de {product.basePrice.toFixed(2)} €</span>
                  <span className="text-primary font-medium text-sm">Personnaliser →</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-foreground/60">Aucun produit ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}
