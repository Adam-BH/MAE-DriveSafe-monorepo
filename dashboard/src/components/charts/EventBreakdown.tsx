import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface EventBreakdownProps {
  data: Record<string, number>;
  height?: number;
}

const EVENT_LABELS: Record<string, string> = {
  harsh_brake: 'Hard Brake',
  harsh_acceleration: 'Hard Accel',
  sharp_corner: 'Sharp Corner',
  phone_pickup: 'Phone Pickup',
  phone_in_use: 'Phone Use',
  speeding_start: 'Speeding',
  night_driving_start: 'Night Drive',
};

export function EventBreakdown({ data, height = 200 }: EventBreakdownProps) {
  const chartData = Object.entries(data).map(([type, count]) => ({
    name: EVENT_LABELS[type] ?? type,
    count,
  }));

  if (chartData.length === 0) {
    return <p className="text-text-muted text-body text-center py-8">No events recorded</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(43,52,151,0.08)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans' }} width={60} />
        <Tooltip contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 8 }} />
        <Bar dataKey="count" fill="#4BBFA0" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
