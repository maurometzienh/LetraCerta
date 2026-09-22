import type { FastifyInstance } from 'fastify';
import { StatsController } from '../controllers/StatsController.js';
import { authenticate } from '../middlewares/authenticate.js';

const controller = new StatsController();

export async function statsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/stats/me', { preHandler: authenticate }, (req, reply) => controller.me(req, reply));
}
