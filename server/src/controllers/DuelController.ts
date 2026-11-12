import type { FastifyReply, FastifyRequest } from 'fastify';
import type { EntityManager } from '@mikro-orm/postgresql';
import { DuelService } from '../services/DuelService.js';
import { DuelRepository } from '../repositories/DuelRepository.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { WordRepository } from '../repositories/WordRepository.js';
import { buildFriendshipService } from './FriendshipController.js';
import { buildGameService } from './GameController.js';
import { getORM } from '../infra/orm.js';
import { challengeDuelSchema, duelGuessSchema, duelIdParamSchema, respondDuelSchema } from '../dtos/duelDtos.js';

function buildDuelService(em: EntityManager): DuelService {
  return new DuelService(
    new DuelRepository(em),
    new GameRepository(em),
    new UserRepository(em),
    new WordRepository(em),
    buildFriendshipService(em),
    buildGameService(em),
  );
}

export class DuelController {
  async challenge(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { username } = challengeDuelSchema.parse(request.body);
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    const duel = await service.challenge(request.currentUser!, username);
    reply.status(201).send(duel);
  }

  async listPending(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    const duels = await service.listPendingInvites(request.currentUser!);
    reply.status(200).send(duels);
  }

  async active(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    const duelId = await service.getActiveDuelId(request.currentUser!);
    reply.status(200).send({ duelId });
  }

  async respond(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = duelIdParamSchema.parse(request.params);
    const { accept } = respondDuelSchema.parse(request.body);
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    await service.respondToInvite(request.currentUser!, id, accept);
    reply.status(200).send({ message: accept ? 'Duelo aceito.' : 'Duelo recusado.' });
  }

  async state(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = duelIdParamSchema.parse(request.params);
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    const state = await service.getState(request.currentUser!, id);
    reply.status(200).send(state);
  }

  async guess(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = duelIdParamSchema.parse(request.params);
    const { guess } = duelGuessSchema.parse(request.body);
    const em = getORM().em.fork();
    const service = buildDuelService(em);
    const state = await service.submitGuess(request.currentUser!, id, guess);
    reply.status(200).send(state);
  }
}
