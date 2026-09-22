import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/AuthService.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { getORM } from '../infra/orm.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { User } from '../domain/entities/User.js';

declare module 'fastify' {
  interface FastifyRequest {
    currentUser?: User;
  }
}

export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de autenticação ausente.');
  }

  const token = header.slice('Bearer '.length);
  const em = getORM().em.fork();
  const authService = new AuthService(new UserRepository(em));
  const { userId } = authService.verifyToken(token);

  const user = await new UserRepository(em).findById(userId);
  if (!user) {
    throw new UnauthorizedError('Usuário não encontrado.');
  }

  request.currentUser = user;
}
