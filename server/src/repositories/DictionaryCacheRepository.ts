import type { EntityManager } from '@mikro-orm/postgresql';
import { DictionaryCache } from '../domain/entities/DictionaryCache.js';

export class DictionaryCacheRepository {
  constructor(private readonly em: EntityManager) {}

  findByWord(word: string): Promise<DictionaryCache | null> {
    return this.em.findOne(DictionaryCache, { word });
  }

  create(word: string, isValid: boolean): DictionaryCache {
    const entry = this.em.create(DictionaryCache, { word, isValid });
    this.em.persist(entry);
    return entry;
  }

  async flush(): Promise<void> {
    await this.em.flush();
  }
}
