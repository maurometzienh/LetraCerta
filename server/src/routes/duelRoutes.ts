import type { FastifyInstance } from 'fastify';
import { DuelController } from '../controllers/DuelController.js';
import { authenticate } from '../middlewares/authenticate.js';

const controller = new DuelController();

export async function duelRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);
  app.post('/duels/challenge', (req, reply) => controller.challenge(req, reply));
  app.get('/duels/pending', (req, reply) => controller.listPending(req, reply));
  app.get('/duels/active', (req, reply) => controller.active(req, reply));
  app.post('/duels/:id/respond', (req, reply) => controller.respond(req, reply));
  app.get('/duels/:id', (req, reply) => controller.state(req, reply));
  app.post('/duels/:id/guess', (req, reply) => controller.guess(req, reply));
}
