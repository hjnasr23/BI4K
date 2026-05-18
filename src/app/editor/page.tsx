'use client';

import dynamic from 'next/dynamic';
const TShirtEditor = dynamic(() => import("@/components/TShirtEditor"), { ssr: false });
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col">
      <Navbar />

      <main className="flex-grow relative pt-20 flex flex-col">
        {/* Immersive Mesh Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-blob" />
           <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
           <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        </div>

        <div className="flex-grow container mx-auto px-4 md:px-8 relative z-10 flex flex-col">
          <header className="flex flex-col md:flex-row items-center justify-between py-8 animate-reveal">



          </header>

          <div className="flex-grow pb-8 min-h-0">
            <Suspense fallback={
              <div className="flex flex-col justify-center items-center h-full gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <p className="font-black uppercase tracking-[0.4em] text-primary/60 text-xs">Calibrating Studio</p>
              </div>
            }>
              <TShirtEditor />
            </Suspense>
          </div>
        </div>
      </main>

      {/* Note: Footer removed from Editor view for more workspace space, or made very minimal */}
    </div>
  );
}
