'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { MatchAnalysis } from '@/lib/report/types';

export function RadarChart({ data }: { data: MatchAnalysis['radarData'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '일치도',
            data: data.values,
            backgroundColor: 'rgba(236, 106, 61, 0.3)',
            borderColor: '#EC6A3D',
            borderWidth: 2,
            pointBackgroundColor: '#EC6A3D',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            angleLines: { color: 'rgba(28,26,23,0.15)' },
            grid: { color: 'rgba(28,26,23,0.12)' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { display: false, stepSize: 2 },
            pointLabels: {
              font: { family: 'var(--font-gowun)', size: 12, weight: 600 },
              color: '#1C1A17',
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="relative w-full aspect-square max-w-[360px] mx-auto my-2">
      <canvas ref={canvasRef} />
    </div>
  );
}
