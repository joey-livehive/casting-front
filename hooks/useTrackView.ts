'use client';

import { useEffect, useRef } from 'react';
import { trackOnce } from '@/lib/report/tracking';

export function useTrackView(section: string, reportId?: string) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackOnce('scroll_depth', { section, reportId }, {
            pixel: 'ViewContent',
            pixelData: { content_name: section, content_ids: [reportId || ''] },
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [section, reportId]);

  return ref;
}
