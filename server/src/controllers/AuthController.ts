import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { getORM } from '../infra/orm.js';
import { loginSchema, registerSchema } from '../dtos/authDtos.js';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { username, email, password } = registerSchema.parse(request.body);
    const em = getORM().em.fork();
    const authService = new AuthService(new UserRepository(em));

    const result = await authService.register(username, email, password);
    reply.status(201).send(result);
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { email, password } = loginSchema.parse(request.body);
    const em = getORM().em.fork();
    const authService = new AuthService(new UserRepository(em));

    const result = await authService.login(email, password);
    reply.status(200).send(result);
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = request.currentUser!;
    reply.status(200).send({ id: user.id, username: user.username, email: user.email });
  }
}
