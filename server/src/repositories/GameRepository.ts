import type { EntityManager } from '@mikro-orm/postgresql';
import { Game, GameStatus } from '../domain/entities/Game.js';
import { User } from '../domain/entities/User.js';
import { DailyWord } from '../domain/entities/DailyWord.js';

export class GameRepository {
  constructor(private readonly em: EntityManager) {}

  findByUserAndDailyWord(user: User, dailyWord: DailyWord): Promise<Game | null> {
    return this.em.findOne(
      Game,
      { user, dailyWord },
      { populate: ['attempts'] },
    );
  }

  create(user: User, dailyWord: DailyWord): Game {
    const game = this.em.create(Game, { user, dailyWord });
    this.em.persist(game);
    return game;
  }

  findFinishedByUser(user: User): Promise<Game[]> {
    return this.em.find(
      Game,
      { user, status: { $in: [GameStatus.WON, GameStatus.LOST] } },
      { orderBy: { createdAt: 'ASC' }, populate: ['attempts'] },
    );
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
