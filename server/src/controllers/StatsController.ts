import type { FastifyReply, FastifyRequest } from 'fastify';
import { StatsService } from '../services/StatsService.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { getORM } from '../infra/orm.js';

export class StatsController {
  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const statsService = new StatsService(new GameRepository(em));
    const stats = await statsService.getStatsForUser(request.currentUser!);
    reply.status(200).send(stats);
  }
}
