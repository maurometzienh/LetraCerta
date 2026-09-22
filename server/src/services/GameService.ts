import { GameRepository } from '../repositories/GameRepository.js';
import { AttemptRepository } from '../repositories/AttemptRepository.js';
import { WordRepository } from '../repositories/WordRepository.js';
import { DailyWordService } from './DailyWordService.js';
import { evaluateGuess, LetterStatus } from './WordFeedbackService.js';
import { Game, GameStatus } from '../domain/entities/Game.js';
import { User } from '../domain/entities/User.js';
import { AppError } from '../utils/errors.js';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../utils/constants.js';

export interface AttemptDTO {
  attemptNumber: number;
  guess: string;
  result: LetterStatus[];
}

export interface GameStateDTO {
  status: GameStatus;
  attempts: AttemptDTO[];
  attemptsRemaining: number;
  secretWord?: string;
}

export class GameService {
  constructor(
    private readonly gameRepository: GameRepository,
    private readonly attemptRepository: AttemptRepository,
    private readonly wordRepository: WordRepository,
    private readonly dailyWordService: DailyWordService,
  ) {}

  async getTodayState(user: User): Promise<GameStateDTO> {
    const dailyWord = await this.dailyWordService.getOrCreateToday();
    const game = await this.gameRepository.findByUserAndDailyWord(user, dailyWord);

    if (!game) {
      return {
        status: GameStatus.IN_PROGRESS,
        attempts: [],
        attemptsRemaining: MAX_ATTEMPTS,
      };
    }

    return this.toStateDTO(game, dailyWord.word.text);
  }

  async submitGuess(user: User, rawGuess: string): Promise<GameStateDTO> {
    const guess = rawGuess.trim().toLowerCase();

    if (guess.length !== WORD_LENGTH || !/^[a-zà-ú]+$/i.test(guess)) {
      throw new AppError(`O palpite deve ter ${WORD_LENGTH} letras.`, 422);
    }

    const dailyWord = await this.dailyWordService.getOrCreateToday();
    let game = await this.gameRepository.findByUserAndDailyWord(user, dailyWord);

    if (!game) {
      game = this.gameRepository.create(user, dailyWord);
      await this.gameRepository.flush();
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new AppError('O jogo de hoje já foi finalizado.', 409);
    }

    const attemptsSoFar = game.attempts.count();
    if (attemptsSoFar >= MAX_ATTEMPTS) {
      throw new AppError('Número máximo de tentativas atingido.', 409);
    }

    const secret = dailyWord.word.text;
    const result = evaluateGuess(guess, secret);
    const attemptNumber = attemptsSoFar + 1;

    this.attemptRepository.create(game, attemptNumber, guess, result);

    if (guess === secret) {
      game.status = GameStatus.WON;
      game.finishedAt = new Date();
    } else if (attemptNumber >= MAX_ATTEMPTS) {
      game.status = GameStatus.LOST;
      game.finishedAt = new Date();
    }

    await this.attemptRepository.flush();

    const refreshedGame = await this.gameRepository.findByUserAndDailyWord(user, dailyWord);
    return this.toStateDTO(refreshedGame!, secret);
  }

  private toStateDTO(game: Game, secretWord: string): GameStateDTO {
    const attempts = game.attempts
      .getItems()
      .sort((a, b) => a.attemptNumber - b.attemptNumber)
      .map((attempt) => ({
        attemptNumber: attempt.attemptNumber,
        guess: attempt.guess,
        result: attempt.result as LetterStatus[],
      }));

    const isFinished = game.status !== GameStatus.IN_PROGRESS;

    return {
      status: game.status,
      attempts,
      attemptsRemaining: MAX_ATTEMPTS - attempts.length,
      secretWord: isFinished ? secretWord : undefined,
    };
  }
}
