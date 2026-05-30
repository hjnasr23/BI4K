'use client';

import { Package, Clock, CheckCircle2, Truck } from 'lucide-react';

// Placeholder orders data — replace with real Supabase fetch
const mockOrders = [
  { id: '#BI4K-2026-001', date: '28 Mai 2026', status: 'En cours', items: 'T-shirt Premium × 2', total: '299 MAD', statusIcon: Clock, statusColor: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  { id: '#BI4K-2026-002', date: '20 Mai 2026', status: 'Livré', items: 'Mug Magique × 1', total: '149 MAD', statusIcon: CheckCircle2, statusColor: 'text-green-600 bg-green-50 dark:bg-green-500/10' },
  { id: '#BI4K-2026-003', date: '15 Mai 2026', status: 'En livraison', items: 'Hoodie Confort × 1', total: '449 MAD', statusIcon: Truck, statusColor: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
];

export default function OrdersPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Dashboard</p>
        <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Mes Commandes</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Historique et suivi de toutes vos commandes.</p>
      </div>

      {mockOrders.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="font-bold text-neutral-900 dark:text-white">Aucune commande</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Vous n'avez pas encore passé de commande.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockOrders.map(({ id, date, status, items, total, statusIcon: StatusIcon, statusColor }) => (
            <div key={id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 rounded-2xl p-5 hover:border-blue-200 dark:hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 dark:text-white text-sm">{id}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{items}</p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">{date}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-black text-sm text-neutral-900 dark:text-white">{total}</span>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColor}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
