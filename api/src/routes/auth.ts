import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { supabase } from '../supabase.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const userId = authData.user.id;

  const { data: driver } = await supabase
    .from('drivers')
    .select('*')
    .eq('app_user_id', userId)
    .maybeSingle();

  const role = driver ? 'driver' : 'insurer';
  const token = jwt.sign(
    { sub: userId, role, driverId: driver?.id ?? undefined },
    secret,
    { expiresIn: '8h' }
  );

  res.json({ token, driver: driver ?? null });
});

export default router;
