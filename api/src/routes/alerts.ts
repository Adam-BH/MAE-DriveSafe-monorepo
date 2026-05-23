import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabase';
import { authenticate, requireRole } from '../middleware/auth';
import { validateQuery } from '../middleware/validate';

const router = Router();

const listQuerySchema = z.object({
  driver_id: z.string().uuid().optional(),
  severity: z.enum(['critical', 'warning', 'info', 'positive']).optional(),
  resolved: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get('/', authenticate, requireRole('insurer'), validateQuery(listQuerySchema), async (req, res) => {
  const { driver_id, severity, resolved, page, limit } = req.query as z.infer<typeof listQuerySchema>;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('alerts')
    .select('*, drivers(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (driver_id) query = query.eq('driver_id', driver_id);
  if (severity) query = query.eq('severity', severity);
  if (resolved !== undefined) query = query.eq('resolved', resolved);

  const { data, error, count } = await query;
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

router.post('/:id/resolve', authenticate, requireRole('insurer'), async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
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
