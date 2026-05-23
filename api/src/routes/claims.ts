import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';

const router = Router();

const listQuerySchema = z.object({
  status: z.enum(['open', 'under_review', 'approved', 'denied', 'settled', 'litigated']).optional(),
  fraud_flag: z.coerce.boolean().optional(),
  driver_id: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get('/', authenticate, requireRole('insurer'), validateQuery(listQuerySchema), async (req, res) => {
  const { status, fraud_flag, driver_id, page, limit } = req.query as z.infer<typeof listQuerySchema>;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('claims')
    .select('*, drivers(full_name, policy_id)', { count: 'exact' })
    .order('filed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (fraud_flag !== undefined) query = query.eq('fraud_flag', fraud_flag);
  if (driver_id) query = query.eq('driver_id', driver_id);

  const { data, error, count } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

const createClaimSchema = z.object({
  driver_id: z.string().uuid(),
  session_id: z.string().uuid().optional(),
  incident_at: z.string().optional(),
  claim_type: z.enum(['property_damage', 'bodily_injury', 'total_loss', 'theft', 'weather', 'other']).optional(),
  estimated_cost: z.number().positive().optional(),
  incident_lat: z.number().optional(),
  incident_lng: z.number().optional(),
  description: z.string().optional(),
  evidence_urls: z.array(z.string().url()).optional(),
});

router.post('/', authenticate, requireRole('insurer'), validateBody(createClaimSchema), async (req, res) => {
  const body = req.body as z.infer<typeof createClaimSchema>;

  let phoneAtImpact: boolean | null = null;
  let telematicsMatch: boolean | null = null;

  if (body.incident_at && body.driver_id) {
    const incidentTime = new Date(body.incident_at);
    const windowStart = new Date(incidentTime.getTime() - 5 * 60 * 1000).toISOString();
    const windowEnd = new Date(incidentTime.getTime() + 5 * 60 * 1000).toISOString();

    const { data: phoneEvents } = await supabase
      .from('events')
      .select('id')
      .eq('driver_id', body.driver_id)
      .in('event_type', ['phone_pickup', 'phone_in_use'])
      .gte('occurred_at', windowStart)
      .lte('occurred_at', windowEnd)
      .limit(1);

    phoneAtImpact = (phoneEvents?.length ?? 0) > 0;
  }

  if (body.incident_lat && body.incident_lng && body.session_id) {
    const { data: session } = await supabase
      .from('sessions')
      .select('gps_trace')
      .eq('id', body.session_id)
      .single();

    if (session?.gps_trace) {
      const trace = session.gps_trace as Array<{ lat: number; lng: number }>;
      const threshold = 0.01; // ~1km
      telematicsMatch = trace.some(
        (p) =>
          Math.abs(p.lat - body.incident_lat!) < threshold &&
          Math.abs(p.lng - body.incident_lng!) < threshold
      );
    }
  }

  const { data, error } = await supabase
    .from('claims')
    .insert({ ...body, phone_at_impact: phoneAtImpact, telematics_match: telematicsMatch })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(data);
});

const patchClaimSchema = z.object({
  status: z.enum(['open', 'under_review', 'approved', 'denied', 'settled', 'litigated']).optional(),
  settled_cost: z.number().positive().optional(),
  adjuster_notes: z.string().optional(),
  fraud_flag: z.boolean().optional(),
  fraud_reason: z.string().optional(),
});

router.patch('/:id', authenticate, requireRole('insurer'), validateBody(patchClaimSchema), async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('claims')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data);
});

export default router;
