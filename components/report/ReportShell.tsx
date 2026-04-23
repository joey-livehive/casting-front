'use client';

import { ReactNode, useEffect, useState } from 'react';
import { SheetProvider } from './sheetContext';
import { ToneProvider, Tone } from './toneContext';
import { PurchaseToast } from './PurchaseToast';
import { FixedBottomCta } from './FixedBottomCta';
import { PurchaseBottomSheet } from './PurchaseBottomSheet';
import { track } from '@/lib/report/tracking';

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

  useEffect(() => {
    track('report_view', { reportId, tone });
  }, [reportId, tone]);

  const openSheet = (source?: string) => {
    track('sheet_open', { reportId, source }, {
      pixel: 'AddToCart',
      pixelData: { content_name: `sheet_${source}`, content_ids: [reportId] },
    });
    setOpen(true);
  };
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
