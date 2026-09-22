import { WordRepository } from '../repositories/WordRepository.js';
import { DailyWordRepository } from '../repositories/DailyWordRepository.js';
import { DailyWord } from '../domain/entities/DailyWord.js';
import { AppError } from '../utils/errors.js';

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export class DailyWordService {
  constructor(
    private readonly wordRepository: WordRepository,
    private readonly dailyWordRepository: DailyWordRepository,
  ) {}

  async getOrCreateToday(): Promise<DailyWord> {
    const date = todayISODate();
    const existing = await this.dailyWordRepository.findByDate(date);
    if (existing) {
      return existing;
    }

    let word = await this.wordRepository.findRandomUnused();
    if (!word) {
      // acabaram as palavras não usadas: reaproveita o banco inteiro
      word = await this.wordRepository.findRandomAny();
    }
    if (!word) {
      throw new AppError('Nenhuma palavra cadastrada no banco de dados.', 500);
    }

    word.used = true;
    const dailyWord = this.dailyWordRepository.create(date, word);
    await this.dailyWordRepository.flush();

    return dailyWord;
  }
}
