'use client';

import { ReactNode, useState } from 'react';
import { SheetProvider } from './sheetContext';
import { ToneProvider, Tone } from './toneContext';
import { PurchaseToast } from './PurchaseToast';
import { FixedBottomCta } from './FixedBottomCta';
import { PurchaseBottomSheet } from './PurchaseBottomSheet';

export function ReportShell({
  reportId,
  tone,
  children,
}: {
  reportId: string;
  tone: Tone;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const openSheet = () => setOpen(true);
  const closeSheet = () => setOpen(false);

  return (
    <ToneProvider value={tone}>
      <SheetProvider value={{ openSheet }}>
        {children}
        <PurchaseToast />
        <FixedBottomCta />
        <PurchaseBottomSheet open={open} onClose={closeSheet} reportId={reportId} />
      </SheetProvider>
    </ToneProvider>
  );
}
