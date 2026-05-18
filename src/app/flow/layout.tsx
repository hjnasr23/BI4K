'use client';

import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const steps = [
  { id: 'category', label: 'Product' },
  { id: 'variant', label: 'Style' },
  { id: 'editor', label: 'Design' },
  { id: 'preview', label: 'Review' },
];

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const currentStepIndex = steps.findIndex(step => pathname.includes(step.id));
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-32 pb-20 relative z-10">
        {/* Progress Bar Container */}
        <div className="container mx-auto px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex justify-between items-center">
              {/* Background Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
              
              {/* Active Progress Line */}
              <motion.div 
                className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />

              {steps.map((step, idx) => (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-2 transition-colors duration-500 ${idx <= activeIndex ? 'bg-primary border-primary text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-[#0d0d12] border-white/10 text-white/20'}`}
                    animate={{ scale: idx === activeIndex ? 1.2 : 1 }}
                  >
                    {idx + 1}
                  </motion.div>
                  <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-colors duration-500 ${idx <= activeIndex ? 'text-primary' : 'text-white/10'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
