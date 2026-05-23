import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const createSessionSchema = z.object({
  started_at: z.string(),
  device_platform: z.enum(['ios', 'android']).optional(),
  app_version: z.string().optional(),
});

router.post('/', authenticate, requireRole('driver'), validateBody(createSessionSchema), async (req, res) => {
  const driverId = req.user!.driverId;
  if (!driverId) {
    res.status(400).json({ error: 'No driver associated with this account' });
    return;
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert({ ...req.body, driver_id: driverId })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

const gpsPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  speed_kmh: z.number(),
  ts: z.string(),
});

const endSessionSchema = z.object({
  ended_at: z.string(),
  distance_km: z.number().optional(),
  route_type: z.enum(['highway', 'urban', 'rural', 'mixed']).optional(),
  gps_trace: z.array(gpsPointSchema).optional(),
  score_breakdown: z.object({
    phone: z.number(),
    braking: z.number(),
    speeding: z.number(),
    cornering: z.number(),
    night: z.number(),
  }).optional(),
  trip_score: z.number().int().min(0).max(100).optional(),
  weather: z.string().optional(),
});

router.patch('/:id', authenticate, requireRole('driver'), validateBody(endSessionSchema), async (req, res) => {
  const { id } = req.params;
  const body = req.body as z.infer<typeof endSessionSchema>;

  const { data: session } = await supabase
    .from('sessions')
    .select('started_at, driver_id')
    .eq('id', id)
    .single();

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (req.user?.driverId !== session.driver_id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const startTs = new Date(session.started_at).getTime();
  const endTs = new Date(body.ended_at).getTime();
  const duration_sec = Math.round((endTs - startTs) / 1000);

  const { data, error } = await supabase
    .from('sessions')
    .update({ ...body, duration_sec })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (req.user?.role === 'driver' && req.user?.driverId !== session.driver_id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('session_id', id)
    .order('occurred_at');

  res.json({ ...session, events: events ?? [] });
});

export default router;
