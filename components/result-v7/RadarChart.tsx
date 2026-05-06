'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { MatchAnalysis } from '@/lib/report/types';

const MIN_VISIBLE_RADAR_VALUE = 5.5;
const MAX_RADAR_VALUE = 10;

function visibleRadarValues(values: number[]) {
  return values.map((value) => MIN_VISIBLE_RADAR_VALUE + (value / MAX_RADAR_VALUE) * (MAX_RADAR_VALUE - MIN_VISIBLE_RADAR_VALUE));
}

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
            data: visibleRadarValues(data.values),
            backgroundColor: 'rgba(201,169,97,0.3)',
            borderColor: '#C9A961',
            borderWidth: 2,
            pointBackgroundColor: '#C9A961',
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
            angleLines: { color: 'rgba(10,10,10,0.12)' },
            grid: { color: 'rgba(10,10,10,0.1)' },
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { display: false, stepSize: 2 },
            pointLabels: {
              font: { family: "'SUIT Variable', sans-serif", size: 11, weight: 600 },
              color: '#0A0A0A',
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

  return <canvas ref={canvasRef} />;
}
