import Link from 'next/link';
import { Package, Palette, Settings } from 'lucide-react';

export default function AccountPage() {
  const user = { name: "Alex Dupont", email: "alex@example.com" };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-card-bg border border-card-border p-8 rounded-3xl flex items-center gap-6 mb-8">
        <div className="w-24 h-24 bg-primary text-white text-3xl font-bold rounded-full flex items-center justify-center shadow-lg">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-foreground/70">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/account/orders" className="group bg-card-bg border border-card-border p-6 rounded-2xl hover:border-primary transition-colors flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-1">Mes commandes</h3>
          <p className="text-sm text-foreground/70">Suivez vos colis</p>
        </Link>
        
        <div className="group bg-card-bg border border-card-border p-6 rounded-2xl opacity-60 cursor-not-allowed flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded-full">Bientôt</div>
          <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-4">
            <Palette className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-1">Mes designs</h3>
          <p className="text-sm text-foreground/70">Vos créations</p>
        </div>

        <div className="group bg-card-bg border border-card-border p-6 rounded-2xl opacity-60 cursor-not-allowed flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg mb-1">Paramètres</h3>
          <p className="text-sm text-foreground/70">Gérer mon compte</p>
        </div>
      </div>
    </div>
  );
}
