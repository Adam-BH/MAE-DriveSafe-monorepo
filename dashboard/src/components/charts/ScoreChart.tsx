import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface ScorePoint {
  period_start: string;
  composite_score: number | null;
}

interface ScoreChartProps {
  data: ScorePoint[];
  height?: number;
}

export function ScoreChart({ data, height = 260 }: ScoreChartProps) {
  const chartData = data.map((d) => ({
    date: new Date(d.period_start).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    score: d.composite_score,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,52,151,0.08)" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'DM Sans' }} />
        <Tooltip
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8, border: 'rgba(43,52,151,0.12)' }}
        />
        <ReferenceLine y={80} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Low risk', position: 'right', fontSize: 10 }} />
        <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Med risk', position: 'right', fontSize: 10 }} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#2B3497"
          strokeWidth={2}
          dot={{ r: 3, fill: '#2B3497' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
