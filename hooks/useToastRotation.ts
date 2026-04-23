'use client';

import { useEffect, useRef, useState } from 'react';
import { toastData, PurchaseToast } from '@/lib/report/purchaseToastData';

export function useToastRotation() {
  const [currentToast, setCurrentToast] = useState<PurchaseToast | null>(null);
  const [visible, setVisible] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let nextTimer: ReturnType<typeof setTimeout> | null = null;

    const showNext = () => {
      setCurrentToast(toastData[idxRef.current % toastData.length]);
      setVisible(true);
      idxRef.current++;

      hideTimer = setTimeout(() => setVisible(false), 3000);
      nextTimer = setTimeout(showNext, 6000 + Math.random() * 3000);
    };

    const firstTimer = setTimeout(showNext, 3500);

    return () => {
      clearTimeout(firstTimer);
      if (hideTimer) clearTimeout(hideTimer);
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, []);

  return { currentToast, visible };
}
