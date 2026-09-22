import type { FastifyInstance } from 'fastify';
import { GameController } from '../controllers/GameController.js';
import { authenticate } from '../middlewares/authenticate.js';

const controller = new GameController();

export async function gameRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);
  app.get('/games/today', (req, reply) => controller.today(req, reply));
  app.post('/games/guess', (req, reply) => controller.guess(req, reply));
}
