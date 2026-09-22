import type { EntityManager } from '@mikro-orm/postgresql';
import { DailyWord } from '../domain/entities/DailyWord.js';
import { Word } from '../domain/entities/Word.js';

export class DailyWordRepository {
  constructor(private readonly em: EntityManager) {}

  findByDate(date: string): Promise<DailyWord | null> {
    return this.em.findOne(DailyWord, { date }, { populate: ['word'] });
  }

  create(date: string, word: Word): DailyWord {
    const dailyWord = this.em.create(DailyWord, { date, word });
    this.em.persist(dailyWord);
    return dailyWord;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
