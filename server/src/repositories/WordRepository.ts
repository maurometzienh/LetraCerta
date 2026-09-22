import type { EntityManager } from '@mikro-orm/postgresql';
import { Word } from '../domain/entities/Word.js';

export class WordRepository {
  constructor(private readonly em: EntityManager) {}

  countAll(): Promise<number> {
    return this.em.count(Word, {});
  }

  findRandomUnused(): Promise<Word | null> {
    return this.em.getConnection().execute(
      'SELECT id FROM words WHERE used = false ORDER BY random() LIMIT 1',
    ).then(async (rows) => {
      if (!rows.length) return null;
      return this.em.findOne(Word, { id: rows[0].id });
    });
  }

  findRandomAny(): Promise<Word | null> {
    return this.em.getConnection().execute(
      'SELECT id FROM words ORDER BY random() LIMIT 1',
    ).then(async (rows) => {
      if (!rows.length) return null;
      return this.em.findOne(Word, { id: rows[0].id });
    });
  }

  create(text: string): Word {
    const word = this.em.create(Word, { text: text.toLowerCase() });
    this.em.persist(word);
    return word;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
