import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';

const router = Router();

const scoresQuerySchema = z.object({
  period: z.enum(['30d', '90d', '180d', 'all']).default('90d'),
});

router.get('/drivers/:id/scores', authenticate, validateQuery(scoresQuerySchema), async (req, res) => {
  const { id } = req.params;
  const { period } = req.query as z.infer<typeof scoresQuerySchema>;

  if (req.user?.role === 'driver' && req.user?.driverId !== id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  let query = supabase
    .from('scores')
    .select('*')
    .eq('driver_id', id)
    .order('period_start', { ascending: true });

  if (period !== 'all') {
    const days = parseInt(period);
    const from = new Date();
    from.setDate(from.getDate() - days);
    query = query.gte('period_start', from.toISOString().split('T')[0]);
  }

  const { data, error } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.post('/scores/compute/:driverId', authenticate, async (req, res) => {
  const { driverId } = req.params;

  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);

  const startStr = periodStart.toISOString().split('T')[0];
  const endStr = periodEnd.toISOString().split('T')[0];

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('driver_id', driverId)
    .gte('started_at', periodStart.toISOString())
    .not('ended_at', 'is', null);

  if (!sessions || sessions.length === 0) {
    res.json({ message: 'No sessions in period, score not updated' });
    return;
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('driver_id', driverId)
    .gte('occurred_at', periodStart.toISOString());

  const totalKm = sessions.reduce((s, x) => s + (x.distance_km ?? 0), 0);
  const totalSec = sessions.reduce((s, x) => s + (x.duration_sec ?? 0), 0);
  const totalHours = totalSec / 3600;
  const weeksInPeriod = 30 / 7;
  const weeklyHours = totalHours / weeksInPeriod;

  const phoneEvents = (events ?? []).filter(
    (e) => e.event_type === 'phone_pickup' || e.event_type === 'phone_in_use'
  );
  const phonePickups = phoneEvents.filter((e) => e.event_type === 'phone_pickup').length;
  const phoneUseSec = phoneEvents
    .filter((e) => e.event_type === 'phone_in_use')
    .reduce((s, e) => s + (e.value ?? 0), 0);
  const phoneAvgSec = sessions.length > 0 ? phoneUseSec / sessions.length : 0;

  const harshBrakes = (events ?? []).filter((e) => e.event_type === 'harsh_brake').length;
  const sharpCorners = (events ?? []).filter((e) => e.event_type === 'sharp_corner').length;

  const speedingEvents = (events ?? []).filter((e) => e.event_type === 'speeding_start');
  const speedingPct = sessions.length > 0 ? (speedingEvents.length / sessions.length) * 100 : 0;

  const nightSessions = sessions.filter((s) => s.time_of_day === 'night').length;
  const nightPct = sessions.length > 0 ? (nightSessions / sessions.length) * 100 : 0;

  const harshBrakesPer100km = totalKm > 0 ? (harshBrakes / totalKm) * 100 : 0;
  const sharpCornersPer100km = totalKm > 0 ? (sharpCorners / totalKm) * 100 : 0;

  const phoneScore = Math.max(0, Math.min(100, 100 - phonePickups * 4 - phoneUseSec * 0.08));
  const brakingScore = Math.max(0, Math.min(100, 100 - harshBrakesPer100km * 8));
  const speedingScore = Math.max(0, Math.min(100, 100 - speedingPct * 1.5));
  const corneringScore = Math.max(0, Math.min(100, 100 - sharpCornersPer100km * 6));
  const nightScore = Math.max(0, Math.min(100, 100 - nightPct * 0.4));
  const hoursScore = Math.max(0, Math.min(100, 100 - Math.max(0, (weeklyHours - 20) * 2)));

  const composite = Math.round(
    phoneScore * 0.25 +
    brakingScore * 0.20 +
    speedingScore * 0.20 +
    corneringScore * 0.15 +
    nightScore * 0.10 +
    hoursScore * 0.10
  );

  const riskTier = composite >= 80 ? 'low' : composite >= 50 ? 'medium' : 'high';
  const discountPct = composite >= 80 ? 15 : composite >= 70 ? 8 : composite >= 50 ? 3 : 0;

  const { data, error } = await supabase
    .from('scores')
    .upsert({
      driver_id: driverId,
      period_start: startStr,
      period_end: endStr,
      composite_score: composite,
      phone_score: Math.round(phoneScore),
      braking_score: Math.round(brakingScore),
      speeding_score: Math.round(speedingScore),
      cornering_score: Math.round(corneringScore),
      night_score: Math.round(nightScore),
      trips_counted: sessions.length,
      km_counted: totalKm,
      phone_avg_sec: phoneAvgSec,
      harsh_brakes_per_100km: harshBrakesPer100km,
      speeding_pct: speedingPct,
      night_pct: nightPct,
      risk_tier: riskTier,
      discount_pct: discountPct,
    }, { onConflict: 'driver_id,period_start' })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
