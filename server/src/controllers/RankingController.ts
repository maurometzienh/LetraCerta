import type { FastifyReply, FastifyRequest } from 'fastify';
import { RankingService } from '../services/RankingService.js';
import { RankingRepository } from '../repositories/RankingRepository.js';
import { getORM } from '../infra/orm.js';

export class RankingController {
  async top(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const rankingService = new RankingService(new RankingRepository(em));
    const ranking = await rankingService.getTopPlayers();
    reply.status(200).send(ranking);
  }
}
