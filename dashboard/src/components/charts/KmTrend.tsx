import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface KmTrendProps {
  data: { month: string; km: number }[];
  height?: number;
}

export function KmTrend({ data, height = 200 }: KmTrendProps) {
  const chartData = data.map((d) => ({
    month: new Date(d.month + '-01').toLocaleDateString('en', { month: 'short' }),
    km: Math.round(d.km),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,52,151,0.08)" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(v: number) => [`${v} km`, 'Distance']}
          contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="km" fill="#2B3497" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
