import type { FastifyReply, FastifyRequest } from 'fastify';
import type { EntityManager } from '@mikro-orm/postgresql';
import { GameService } from '../services/GameService.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { AttemptRepository } from '../repositories/AttemptRepository.js';
import { WordRepository } from '../repositories/WordRepository.js';
import { DailyWordRepository } from '../repositories/DailyWordRepository.js';
import { DailyWordService } from '../services/DailyWordService.js';
import { getORM } from '../infra/orm.js';
import { guessSchema } from '../dtos/gameDtos.js';

function buildGameService(em: EntityManager) {
  const wordRepository = new WordRepository(em);
  const dailyWordRepository = new DailyWordRepository(em);
  const dailyWordService = new DailyWordService(wordRepository, dailyWordRepository);
  const gameRepository = new GameRepository(em);
  const attemptRepository = new AttemptRepository(em);
  return new GameService(gameRepository, attemptRepository, wordRepository, dailyWordService);
}

export class GameController {
  async today(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const em = getORM().em.fork();
    const gameService = buildGameService(em);
    const state = await gameService.getTodayState(request.currentUser!);
    reply.status(200).send(state);
  }

  async guess(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { guess } = guessSchema.parse(request.body);
    const em = getORM().em.fork();
    const gameService = buildGameService(em);
    const state = await gameService.submitGuess(request.currentUser!, guess);
    reply.status(200).send(state);
  }
}
