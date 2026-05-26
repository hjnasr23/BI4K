"use client";
 
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Tag, Package, LogOut, Zap, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
 
const navItems = [
  { href: '/admin',             label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/admin/orders',      label: 'Commandes',   icon: ShoppingCart },
  { href: '/admin/categories',  label: 'Catégories',  icon: Tag },
  { href: '/admin/products',    label: 'Produits',    icon: Package },
];
 
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  const handleSignOut = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };
 
  // If we are on the admin login page, center the content with absolutely NO sidebar or top bar
  if (pathname === '/admin/login') {
    return (
      <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-emerald-500/30 flex items-center justify-center w-full">
        {children}
      </div>
    );
  }
 
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Sidebar Header */}
      <div className={`flex items-center ${isSidebarOpen ? 'gap-3 px-6' : 'justify-center'} py-5 border-b border-white/5 shrink-0`}>
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {isSidebarOpen && (
          <div className="animate-reveal">
            <p className="text-xs font-black uppercase tracking-widest text-white">BI4K</p>
            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Admin Portal</p>
          </div>
        )}
      </div>
 
      {/* Sidebar Nav */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center p-3.5'} rounded-xl text-sm font-semibold transition-all ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
              title={!isSidebarOpen ? label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {isSidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
 
      {/* Sidebar Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center p-3.5'} rounded-xl text-sm font-semibold text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all`}
          title={!isSidebarOpen ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {isSidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
 
  return (
    <div className="min-h-screen flex bg-zinc-950 text-slate-100 font-sans selection:bg-emerald-500/30">
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900 border-b border-white/5 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-white">BI4K Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white">
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
 
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 bg-zinc-900 border-r border-white/5 z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
 
      {/* Desktop Sidebar (Collapsible) */}
      <aside className={`hidden md:flex ${isSidebarOpen ? 'w-72' : 'w-20'} shrink-0 flex-col bg-zinc-900 border-r border-white/5 transition-all duration-300`}>
        <SidebarContent />
      </aside>
 
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-y-auto pt-16 md:pt-0 bg-zinc-950">
        
        {/* Sticky Desktop Top Bar */}
        <header className="hidden md:flex h-16 border-b border-white/5 items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
              {pathname === '/admin' ? 'Dashboard Overview' : navItems.find(item => item.href === pathname)?.label || 'Admin Portal'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              Live Connection
            </div>
          </div>
        </header>
 
        <div className="flex-1 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
