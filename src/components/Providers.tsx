'use client';

import * as React from 'react';
import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/lib/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  );
}
