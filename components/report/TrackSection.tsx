'use client';

import { ReactNode } from 'react';
import { useTrackView } from '@/hooks/useTrackView';

export function TrackSection({
  section,
  reportId,
  children,
}: {
  section: string;
  reportId?: string;
  children: ReactNode;
}) {
  const ref = useTrackView(section, reportId);
  return <div ref={ref}>{children}</div>;
}
