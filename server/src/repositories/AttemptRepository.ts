import type { EntityManager } from '@mikro-orm/postgresql';
import { Attempt } from '../domain/entities/Attempt.js';
import { Game } from '../domain/entities/Game.js';

export class AttemptRepository {
  constructor(private readonly em: EntityManager) {}

  create(game: Game, attemptNumber: number, guess: string, result: string[]): Attempt {
    const attempt = this.em.create(Attempt, { game, attemptNumber, guess, result });
    this.em.persist(attempt);
    return attempt;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
