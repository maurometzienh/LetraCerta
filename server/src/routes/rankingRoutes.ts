import type { FastifyInstance } from 'fastify';
import { RankingController } from '../controllers/RankingController.js';

const controller = new RankingController();

export async function rankingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/ranking', (req, reply) => controller.top(req, reply));
}
