import type { FastifyInstance } from 'fastify';
import { FriendshipController } from '../controllers/FriendshipController.js';
import { authenticate } from '../middlewares/authenticate.js';

const controller = new FriendshipController();

export async function friendshipRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', authenticate);
  app.get('/friends', (req, reply) => controller.listFriends(req, reply));
  app.get('/friends/requests', (req, reply) => controller.listPending(req, reply));
  app.post('/friends/requests', (req, reply) => controller.sendRequest(req, reply));
  app.post('/friends/requests/:id/respond', (req, reply) => controller.respond(req, reply));
}
