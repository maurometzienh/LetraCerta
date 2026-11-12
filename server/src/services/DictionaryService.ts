import { DictionaryCacheRepository } from '../repositories/DictionaryCacheRepository.js';
import { checkWordExists } from '../infra/dictionaryClient.js';

export class DictionaryService {
  constructor(private readonly cacheRepository: DictionaryCacheRepository) {}

  /**
   * Retorna se a palavra existe no dicionário. `null` significa "não foi
   * possível verificar" (API externa indisponível) — nesse caso o chamador
   * deve liberar o palpite em vez de bloquear o jogo.
   */
  async isValidWord(word: string): Promise<boolean | null> {
    const normalized = word.toLowerCase();
    const cached = await this.cacheRepository.findByWord(normalized);
    if (cached) {
      return cached.isValid;
    }

    const result = await checkWordExists(normalized);
    if (result === null) {
      return null;
    }

    this.cacheRepository.create(normalized, result);
    await this.cacheRepository.flush();

    return result;
  }
}
