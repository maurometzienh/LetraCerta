import type { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middlewares/authenticate.js';

const controller = new AuthController();

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/auth/register', (req, reply) => controller.register(req, reply));
  app.post('/auth/login', (req, reply) => controller.login(req, reply));
  app.get('/auth/me', { preHandler: authenticate }, (req, reply) => controller.me(req, reply));
}
