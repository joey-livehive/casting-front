'use client';

import { createContext, useContext } from 'react';

interface Sheet {
  openSheet: () => void;
}

const SheetContext = createContext<Sheet | null>(null);

export const SheetProvider = SheetContext.Provider;

export function useSheet(): Sheet {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('useSheet must be used within <ReportShell>');
  return ctx;
}
