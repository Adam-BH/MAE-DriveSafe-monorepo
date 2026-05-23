import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './routes/auth.js';
import driversRouter from './routes/drivers.js';
import sessionsRouter from './routes/sessions.js';
import eventsRouter from './routes/events.js';
import scoresRouter from './routes/scores.js';
import claimsRouter from './routes/claims.js';
import alertsRouter from './routes/alerts.js';
import analyticsRouter from './routes/analytics.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.use('/auth', authRouter);
app.use('/drivers', driversRouter);
app.use('/sessions', sessionsRouter);
app.use('/sessions', eventsRouter);
app.use('/', scoresRouter);
app.use('/claims', claimsRouter);
app.use('/alerts', alertsRouter);
app.use('/analytics', analyticsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`DriveGuard API running on http://localhost:${PORT}`);
});

export default app;
