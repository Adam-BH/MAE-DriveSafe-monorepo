import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validate';

const router = Router();

const eventPayloadSchema = z.object({
  occurred_at: z.string(),
  event_type: z.enum([
    'harsh_brake', 'harsh_acceleration', 'sharp_corner',
    'phone_pickup', 'phone_in_use', 'speeding_start', 'speeding_end',
    'night_driving_start', 'night_driving_end',
  ]),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  value: z.number().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const bulkEventsSchema = z.object({
  events: z.array(eventPayloadSchema).min(1),
});

router.post('/:id/events', authenticate, requireRole('driver'), validateBody(bulkEventsSchema), async (req, res) => {
  const { id: sessionId } = req.params;
  const { events } = req.body as z.infer<typeof bulkEventsSchema>;

  const { data: session } = await supabase
    .from('sessions')
    .select('driver_id')
    .eq('id', sessionId)
    .single();

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  if (req.user?.driverId !== session.driver_id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const rows = events.map((e) => ({
    ...e,
    session_id: sessionId,
    driver_id: session.driver_id,
  }));

  const { data, error } = await supabase.from('events').insert(rows).select();
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json({ inserted: data?.length ?? 0 });
});

export default router;
