import Link from 'next/link';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order_id?: string }> }) {
  const { order_id } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-500">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-32">
        <div className="glass p-12 rounded-[3rem] border border-emerald-500/20 max-w-2xl w-full text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
          
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 italic">Order Confirmed</h1>
          
          <p className="text-lg text-foreground/60 mb-2">
            Your payment was successful and your order is now processing in our studio.
          </p>
          
          {order_id && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-mono text-xs text-foreground/50 mt-4 mb-10">
              <Package className="w-4 h-4 text-primary" /> Order ID: {order_id}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/orders" className="px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all w-full sm:w-auto">
              Track Order
            </Link>
            <Link href="/categories" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 w-full sm:w-auto">
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
