import { GameRepository } from '../repositories/GameRepository.js';
import { AttemptRepository } from '../repositories/AttemptRepository.js';
import { WordRepository } from '../repositories/WordRepository.js';
import { DailyWordService } from './DailyWordService.js';
import { evaluateGuess, LetterStatus } from './WordFeedbackService.js';
import { Game, GameMode, GameStatus } from '../domain/entities/Game.js';
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

    return this.toStateDTO(game);
  }

  async submitGuess(user: User, rawGuess: string): Promise<GameStateDTO> {
    const guess = this.normalizeGuess(rawGuess);
    const dailyWord = await this.dailyWordService.getOrCreateToday();
    let game = await this.gameRepository.findByUserAndDailyWord(user, dailyWord);

    if (!game) {
      game = this.gameRepository.createDaily(user, dailyWord);
      await this.gameRepository.flush();
    }

    return this.processGuess(game, guess);
  }

  /** Estado da partida avulsa (modo aleatório) mais recente do usuário, se houver. */
  async getRandomState(user: User): Promise<GameStateDTO | null> {
    const game = await this.gameRepository.findLatestByUserAndMode(user, GameMode.RANDOM);
    if (!game) return null;
    return this.toStateDTO(game);
  }

  /** Sorteia uma palavra qualquer e inicia uma nova partida avulsa, sem afetar a palavra do dia. */
  async startRandomGame(user: User): Promise<GameStateDTO> {
    const word = await this.wordRepository.findRandomAny();
    if (!word) {
      throw new AppError('Nenhuma palavra cadastrada no banco de dados.', 500);
    }

    const game = this.gameRepository.createRandom(user, word);
    await this.gameRepository.flush();
    return this.toStateDTO(game);
  }

  async submitRandomGuess(user: User, rawGuess: string): Promise<GameStateDTO> {
    const guess = this.normalizeGuess(rawGuess);
    const game = await this.gameRepository.findLatestByUserAndMode(user, GameMode.RANDOM);

    if (!game) {
      throw new AppError('Nenhuma partida aleatória em andamento. Inicie uma nova.', 404);
    }

    return this.processGuess(game, guess);
  }

  private normalizeGuess(rawGuess: string): string {
    const guess = rawGuess.trim().toLowerCase();
    if (guess.length !== WORD_LENGTH || !/^[a-zà-ú]+$/i.test(guess)) {
      throw new AppError(`O palpite deve ter ${WORD_LENGTH} letras.`, 422);
    }
    return guess;
  }

  private async processGuess(game: Game, guess: string): Promise<GameStateDTO> {
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new AppError('Esta partida já foi finalizada.', 409);
    }

    const attemptsSoFar = game.attempts.count();
    if (attemptsSoFar >= MAX_ATTEMPTS) {
      throw new AppError('Número máximo de tentativas atingido.', 409);
    }

    const secret = game.word!.text;
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

    const refreshedGame = await this.gameRepository.findById(game.id);
    return this.toStateDTO(refreshedGame!);
  }

  private toStateDTO(game: Game): GameStateDTO {
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
      secretWord: isFinished ? game.word?.text : undefined,
    };
  }
}
