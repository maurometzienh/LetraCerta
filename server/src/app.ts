import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/authRoutes.js';
import { gameRoutes } from './routes/gameRoutes.js';
import { statsRoutes } from './routes/statsRoutes.js';
import { rankingRoutes } from './routes/rankingRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });

  app.setErrorHandler(errorHandler);

  app.get('/health', async () => ({ status: 'ok' }));

  app.register(authRoutes, { prefix: '/api' });
  app.register(gameRoutes, { prefix: '/api' });
  app.register(statsRoutes, { prefix: '/api' });
  app.register(rankingRoutes, { prefix: '/api' });

  return app;
}
