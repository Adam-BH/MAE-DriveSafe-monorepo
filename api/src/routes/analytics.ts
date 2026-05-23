import { Router } from 'express';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';
import { TopRiskDriver } from '../types/index';

const router = Router();

router.get('/portfolio', authenticate, requireRole('insurer'), async (_req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [driversRes, scoresRes, claimsRes, sessionsRes] = await Promise.all([
    supabase.from('drivers').select('id, app_user_id', { count: 'exact' }),
    supabase.from('scores').select('composite_score, risk_tier, driver_id').order('created_at', { ascending: false }),
    supabase.from('claims').select('status, estimated_cost, settled_cost'),
    supabase.from('sessions').select('id', { count: 'exact' }).gte('started_at', thirtyDaysAgo.toISOString()),
  ]);

  const totalDrivers = driversRes.count ?? 0;
  const drivers = driversRes.data ?? [];
  const allScores = scoresRes.data ?? [];

  const latestScoreByDriver = new Map<string, { composite_score: number | null; risk_tier: string | null }>();
  for (const s of allScores) {
    if (!latestScoreByDriver.has(s.driver_id)) {
      latestScoreByDriver.set(s.driver_id, { composite_score: s.composite_score, risk_tier: s.risk_tier });
    }
  }

  const scoredDrivers = Array.from(latestScoreByDriver.values());
  const avgScore = scoredDrivers.length > 0
    ? Math.round(scoredDrivers.reduce((s, d) => s + (d.composite_score ?? 0), 0) / scoredDrivers.length)
    : 0;

  const dist = { low: 0, medium: 0, high: 0 };
  for (const d of scoredDrivers) {
    if (d.risk_tier === 'low') dist.low++;
    else if (d.risk_tier === 'medium') dist.medium++;
    else if (d.risk_tier === 'high') dist.high++;
  }

  const claims = claimsRes.data ?? [];
  const activeClaims = claims.filter((c) => c.status === 'open' || c.status === 'under_review').length;
  const totalPremium = totalDrivers * 150;
  const settledCost = claims.reduce((s, c) => s + (c.settled_cost ?? 0), 0);
  const estimatedCost = claims.reduce((s, c) => s + (c.estimated_cost ?? 0), 0);
  const lossRatio = totalPremium > 0 ? (settledCost + estimatedCost * 0.5) / totalPremium : 0;

  const appAdoption = totalDrivers > 0
    ? (drivers.filter((d) => d.app_user_id).length / totalDrivers) * 100
    : 0;

  const estimatedSavings = scoredDrivers
    .filter((d) => (d.composite_score ?? 0) >= 70)
    .reduce((s) => s + 150 * 0.08, 0);

  const { data: topRiskData } = await supabase
    .from('scores')
    .select('driver_id, composite_score, risk_tier, phone_avg_sec, drivers(full_name)')
    .eq('risk_tier', 'high')
    .order('composite_score', { ascending: true })
    .limit(10);

  const topRiskDrivers: TopRiskDriver[] = (topRiskData ?? []).map((r: any) => ({
    id: r.driver_id,
    full_name: r.drivers?.full_name ?? 'Unknown',
    composite_score: r.composite_score,
    risk_tier: r.risk_tier,
    phone_avg_sec: r.phone_avg_sec,
    open_claims: 0,
  }));

  res.json({
    total_drivers: totalDrivers,
    avg_score: avgScore,
    loss_ratio: Math.round(lossRatio * 100) / 100,
    high_risk_count: dist.high,
    active_claims: activeClaims,
    sessions_30d: sessionsRes.count ?? 0,
    app_adoption_pct: Math.round(appAdoption),
    estimated_savings_ytd: Math.round(estimatedSavings),
    score_distribution: dist,
    top_risk_drivers: topRiskDrivers,
  });
});

router.get('/driver/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  if (req.user?.role === 'driver' && req.user?.driverId !== id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const [scoreHistory, sessions, events] = await Promise.all([
    supabase.from('scores').select('*').eq('driver_id', id).order('period_start'),
    supabase.from('sessions').select('*').eq('driver_id', id).not('ended_at', 'is', null).order('started_at'),
    supabase.from('events').select('event_type, occurred_at, value').eq('driver_id', id),
  ]);

  const eventBreakdown: Record<string, number> = {};
  for (const e of events.data ?? []) {
    eventBreakdown[e.event_type] = (eventBreakdown[e.event_type] ?? 0) + 1;
  }

  const monthlyKmMap = new Map<string, number>();
  for (const s of sessions.data ?? []) {
    const month = s.started_at.slice(0, 7);
    monthlyKmMap.set(month, (monthlyKmMap.get(month) ?? 0) + (s.distance_km ?? 0));
  }
  const monthlyKm = Array.from(monthlyKmMap.entries()).map(([month, km]) => ({ month, km }));

  const phoneAvgTrend = (scoreHistory.data ?? []).map((s) => ({
    period: s.period_start,
    avg_sec: s.phone_avg_sec ?? 0,
  }));

  const allSessions = sessions.data ?? [];
  const scoredSessions = allSessions.filter((s) => s.trip_score !== null);
  const bestTrip = scoredSessions.reduce<typeof allSessions[0] | null>(
    (best, s) => (!best || s.trip_score! > best.trip_score!) ? s : best, null
  );
  const worstTrip = scoredSessions.reduce<typeof allSessions[0] | null>(
    (worst, s) => (!worst || s.trip_score! < worst.trip_score!) ? s : worst, null
  );

  res.json({
    score_history: scoreHistory.data ?? [],
    event_breakdown: eventBreakdown,
    monthly_km: monthlyKm,
    phone_avg_trend: phoneAvgTrend,
    best_trip: bestTrip,
    worst_trip: worstTrip,
  });
});

export default router;
