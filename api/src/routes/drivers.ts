import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateQuery, validateBody } from '../middleware/validate.js';

const router = Router();

const listQuerySchema = z.object({
  risk_tier: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get('/', authenticate, requireRole('insurer'), validateQuery(listQuerySchema), async (req, res) => {
  const { risk_tier, search, page, limit } = req.query as z.infer<typeof listQuerySchema>;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('drivers')
    .select(`
      *,
      scores!inner(composite_score, risk_tier, discount_pct, period_start, period_end)
    `, { count: 'exact' })
    .order('enrolled_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (risk_tier) {
    query = query.eq('scores.risk_tier', risk_tier);
  }
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,policy_id.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

router.get('/:id', authenticate, requireRole('insurer'), async (req, res) => {
  const { id } = req.params;

  const [driverRes, scoreRes, claimsRes, sessionsRes] = await Promise.all([
    supabase.from('drivers').select('*').eq('id', id).single(),
    supabase.from('scores').select('*').eq('driver_id', id).order('period_start', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('claims').select('id', { count: 'exact' }).eq('driver_id', id).eq('status', 'open'),
    supabase.from('sessions').select('*').eq('driver_id', id).order('started_at', { ascending: false }).limit(5),
  ]);

  if (driverRes.error) {
    res.status(404).json({ error: 'Driver not found' });
    return;
  }

  res.json({
    driver: driverRes.data,
    latest_score: scoreRes.data,
    open_claims_count: claimsRes.count ?? 0,
    recent_sessions: sessionsRes.data ?? [],
  });
});

const patchSchema = z.object({
  insurer_notes: z.string().optional(),
  premium_monthly: z.number().positive().optional(),
  policy_type: z.enum(['third_party', 'comprehensive', 'full']).optional(),
});

router.patch('/:id', authenticate, requireRole('insurer'), validateBody(patchSchema), async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('drivers')
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
