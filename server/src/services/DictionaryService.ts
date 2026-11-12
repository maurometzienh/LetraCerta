import { DictionaryCacheRepository } from '../repositories/DictionaryCacheRepository.js';
import { checkWordExists } from '../infra/dictionaryClient.js';

/**
 * O Dicionário Aberto só indexa a forma "base" das palavras (ex.: "bola",
 * "louco"), não flexões de plural/gênero (ex.: "bolas", "louca"). Gera
 * variações plausíveis da forma base pra tentar antes de considerar o
 * palpite inválido, evitando falsos negativos em palavras comuns.
 */
function buildCandidates(word: string): string[] {
  const candidates = [word];

  if (word.endsWith('s') && word.length > 3) {
    candidates.push(word.slice(0, -1)); // plural simples: bolas -> bola
  }
  if (word.endsWith('a')) {
    candidates.push(`${word.slice(0, -1)}o`); // feminino -> masculino: louca -> louco
  }
  if (word.endsWith('o')) {
    candidates.push(`${word.slice(0, -1)}a`); // masculino -> feminino: rápido -> rápida
  }

  return candidates;
}

export class DictionaryService {
  constructor(private readonly cacheRepository: DictionaryCacheRepository) {}

  /**
   * Retorna se a palavra (ou alguma variação plausível dela) existe no
   * dicionário. `null` significa "não foi possível verificar com certeza"
   * (API externa indisponível) — nesse caso o chamador deve liberar o
   * palpite em vez de bloquear o jogo por causa de uma falha de terceiros.
   */
  async isValidWord(word: string): Promise<boolean | null> {
    const normalized = word.toLowerCase();
    let sawUnknown = false;

    for (const candidate of buildCandidates(normalized)) {
      const result = await this.checkCandidate(candidate);
      if (result === true) return true;
      if (result === null) sawUnknown = true;
    }

    return sawUnknown ? null : false;
  }

  private async checkCandidate(word: string): Promise<boolean | null> {
    const cached = await this.cacheRepository.findByWord(word);
    if (cached) {
      return cached.isValid;
    }

    const result = await checkWordExists(word);
    if (result === null) {
      return null;
    }

    this.cacheRepository.create(word, result);
    await this.cacheRepository.flush();

    return result;
  }
}
