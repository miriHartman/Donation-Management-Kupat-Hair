import React from 'react';
import { Toaster } from 'sonner';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-['Rubik'] text-slate-900 overflow-x-hidden">
      {children}
      <Toaster position="top-center" richColors />
    </div>
  );
}
