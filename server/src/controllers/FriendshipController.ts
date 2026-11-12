import type { FastifyReply, FastifyRequest } from 'fastify';
import type { EntityManager } from '@mikro-orm/postgresql';
import { FriendshipService } from '../services/FriendshipService.js';
import { FriendshipRepository } from '../repositories/FriendshipRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { getORM } from '../infra/orm.js';
import {
  friendshipIdParamSchema,
  respondFriendRequestSchema,
  sendFriendRequestSchema,
} from '../dtos/friendshipDtos.js';

export function buildFriendshipService(em: EntityManager): FriendshipService {
  return new FriendshipService(new FriendshipRepository(em), new UserRepository(em));
}

export class FriendshipController {
  async sendRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { username } = sendFriendRequestSchema.parse(request.body);
    const em = getORM().em.fork();
    const service = buildFriendshipService(em);
    await service.sendRequest(request.currentUser!, username);
    reply.status(201).send({ message: 'Pedido de amizade enviado.' });
  }

  async respond(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = friendshipIdParamSchema.parse(request.params);
    const { accept } = respondFriendRequestSchema.parse(request.body);
    const em = getORM().em.fork();
    const service = buildFriendshipService(em);
    await service.respondToRequest(request.currentUser!, id, accept);
    reply.status(200).send({ message: accept ? 'Pedido aceito.' : 'Pedido recusado.' });
  }

  async listFriends(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const service = buildFriendshipService(em);
    const friends = await service.listFriends(request.currentUser!);
    reply.status(200).send(friends);
  }

  async listPending(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const service = buildFriendshipService(em);
    const pending = await service.listIncomingPending(request.currentUser!);
    reply.status(200).send(pending);
  }
}
