import type { EntityManager } from '@mikro-orm/postgresql';
import { Game, GameMode, GameStatus } from '../domain/entities/Game.js';
import { User } from '../domain/entities/User.js';
import { DailyWord } from '../domain/entities/DailyWord.js';
import { Word } from '../domain/entities/Word.js';

export class GameRepository {
  constructor(private readonly em: EntityManager) {}

  findById(id: number): Promise<Game | null> {
    return this.em.findOne(Game, { id }, { populate: ['attempts', 'word'] });
  }

  findByUserAndDailyWord(user: User, dailyWord: DailyWord): Promise<Game | null> {
    return this.em.findOne(
      Game,
      { user, dailyWord },
      { populate: ['attempts', 'word'] },
    );
  }

  findLatestByUserAndMode(user: User, mode: GameMode): Promise<Game | null> {
    return this.em.findOne(
      Game,
      { user, mode },
      { populate: ['attempts', 'word'], orderBy: { createdAt: 'DESC' } },
    );
  }

  createDaily(user: User, dailyWord: DailyWord): Game {
    const game = this.em.create(Game, {
      user,
      mode: GameMode.DAILY,
      dailyWord,
      word: dailyWord.word,
    });
    this.em.persist(game);
    return game;
  }

  createRandom(user: User, word: Word): Game {
    const game = this.em.create(Game, { user, mode: GameMode.RANDOM, word });
    this.em.persist(game);
    return game;
  }

  findFinishedByUser(user: User): Promise<Game[]> {
    return this.em.find(
      Game,
      { user, mode: GameMode.DAILY, status: { $in: [GameStatus.WON, GameStatus.LOST] } },
      { orderBy: { createdAt: 'ASC' }, populate: ['attempts'] },
    );
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
