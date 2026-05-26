'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function Toasts() {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let colorClasses = 'border-brand-blue/20 text-brand-blue bg-brand-blue/5';
        
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          colorClasses = 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          colorClasses = 'border-rose-500/20 text-rose-400 bg-rose-500/5';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-reveal ${colorClasses}`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-foreground/40 hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
