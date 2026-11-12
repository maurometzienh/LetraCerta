import { DuelRepository } from '../repositories/DuelRepository.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { WordRepository } from '../repositories/WordRepository.js';
import { FriendshipService } from './FriendshipService.js';
import { GameService, GameStateDTO } from './GameService.js';
import { Duel, DuelStatus } from '../domain/entities/Duel.js';
import { GameStatus } from '../domain/entities/Game.js';
import { User } from '../domain/entities/User.js';
import { LetterStatus } from './WordFeedbackService.js';
import { AppError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

export interface DuelSummaryDTO {
  id: number;
  opponentUsername: string;
  createdAt: Date;
}

export interface DuelStateDTO {
  id: number;
  status: DuelStatus;
  opponentUsername: string;
  winnerUsername?: string;
  myGame: GameStateDTO;
  /** Progresso do oponente: só os emojis de cada tentativa, nunca as palavras. */
  opponentProgress: LetterStatus[][];
  opponentStatus: GameStatus;
}

export class DuelService {
  constructor(
    private readonly duelRepository: DuelRepository,
    private readonly gameRepository: GameRepository,
    private readonly userRepository: UserRepository,
    private readonly wordRepository: WordRepository,
    private readonly friendshipService: FriendshipService,
    private readonly gameService: GameService,
  ) {}

  async challenge(challenger: User, opponentUsername: string): Promise<DuelSummaryDTO> {
    const opponent = await this.userRepository.findByUsername(opponentUsername);
    if (!opponent) {
      throw new NotFoundError('Usuário não encontrado.');
    }
    if (opponent.id === challenger.id) {
      throw new AppError('Você não pode desafiar a si mesmo.', 422);
    }

    await this.friendshipService.assertAreFriends(challenger, opponent);

    const existingActive =
      (await this.duelRepository.findActiveForUser(challenger)) ??
      (await this.duelRepository.findActiveForUser(opponent));
    if (existingActive) {
      throw new AppError('Já existe um duelo em andamento entre vocês (ou com outra pessoa).', 409);
    }

    const word = await this.wordRepository.findRandomAny();
    if (!word) {
      throw new AppError('Nenhuma palavra cadastrada no banco de dados.', 500);
    }

    const duel = this.duelRepository.create(challenger, opponent, word);
    await this.duelRepository.flush();

    this.gameRepository.createDuel(challenger, duel);
    this.gameRepository.createDuel(opponent, duel);
    await this.gameRepository.flush();

    return { id: duel.id, opponentUsername: opponent.username, createdAt: duel.createdAt };
  }

  async listPendingInvites(user: User): Promise<DuelSummaryDTO[]> {
    const duels = await this.duelRepository.findPendingInvitesForUser(user);
    return duels.map((duel) => ({
      id: duel.id,
      opponentUsername: duel.challenger.username,
      createdAt: duel.createdAt,
    }));
  }

  async getActiveDuelId(user: User): Promise<number | null> {
    const duel = await this.duelRepository.findActiveForUser(user);
    return duel?.id ?? null;
  }

  async respondToInvite(user: User, duelId: number, accept: boolean): Promise<void> {
    const duel = await this.duelRepository.findById(duelId);
    if (!duel) {
      throw new NotFoundError('Duelo não encontrado.');
    }
    if (duel.opponent.id !== user.id) {
      throw new UnauthorizedError('Esse convite não é seu.');
    }
    if (duel.status !== DuelStatus.PENDING) {
      throw new AppError('Esse convite já foi respondido.', 409);
    }

    duel.status = accept ? DuelStatus.IN_PROGRESS : DuelStatus.CANCELLED;
    if (!accept) {
      duel.finishedAt = new Date();
    }
    await this.duelRepository.flush();
  }

  async getState(user: User, duelId: number): Promise<DuelStateDTO> {
    const duel = await this.duelRepository.findById(duelId);
    if (!duel) {
      throw new NotFoundError('Duelo não encontrado.');
    }

    const { me, opponentUser } = this.identifyParticipants(duel, user);
    const [myGame, opponentGame] = await Promise.all([
      this.gameRepository.findByDuelAndUser(duel, me),
      this.gameRepository.findByDuelAndUser(duel, opponentUser),
    ]);

    return {
      id: duel.id,
      status: duel.status,
      opponentUsername: opponentUser.username,
      winnerUsername: duel.winner?.username,
      myGame: myGame ? this.gameService.toStateDTO(myGame) : { status: GameStatus.IN_PROGRESS, attempts: [], attemptsRemaining: 6 },
      opponentProgress: (opponentGame?.attempts.getItems() ?? [])
        .sort((a, b) => a.attemptNumber - b.attemptNumber)
        .map((attempt) => attempt.result as LetterStatus[]),
      opponentStatus: opponentGame?.status ?? GameStatus.IN_PROGRESS,
    };
  }

  async submitGuess(user: User, duelId: number, rawGuess: string): Promise<DuelStateDTO> {
    const duel = await this.duelRepository.findById(duelId);
    if (!duel) {
      throw new NotFoundError('Duelo não encontrado.');
    }
    if (duel.status !== DuelStatus.IN_PROGRESS) {
      throw new AppError('Esse duelo ainda não começou ou já terminou.', 409);
    }

    const { me } = this.identifyParticipants(duel, user);
    const myGame = await this.gameRepository.findByDuelAndUser(duel, me);
    if (!myGame) {
      throw new NotFoundError('Partida do duelo não encontrada.');
    }

    await this.gameService.submitGuessForGame(myGame, rawGuess);
    await this.finalizeDuelIfNeeded(duel);

    return this.getState(user, duelId);
  }

  private identifyParticipants(duel: Duel, user: User): { me: User; opponentUser: User } {
    if (duel.challenger.id === user.id) {
      return { me: duel.challenger, opponentUser: duel.opponent };
    }
    if (duel.opponent.id === user.id) {
      return { me: duel.opponent, opponentUser: duel.challenger };
    }
    throw new UnauthorizedError('Você não participa desse duelo.');
  }

  /** Termina o duelo quando alguém vence a corrida, ou quando os dois esgotam as tentativas. */
  private async finalizeDuelIfNeeded(duel: Duel): Promise<void> {
    const [challengerGame, opponentGame] = await Promise.all([
      this.gameRepository.findByDuelAndUser(duel, duel.challenger),
      this.gameRepository.findByDuelAndUser(duel, duel.opponent),
    ]);
    if (!challengerGame || !opponentGame) return;

    const winnerGame = [challengerGame, opponentGame].find((game) => game.status === GameStatus.WON);

    if (winnerGame) {
      const loserGame = winnerGame === challengerGame ? opponentGame : challengerGame;
      if (loserGame.status === GameStatus.IN_PROGRESS) {
        loserGame.status = GameStatus.LOST;
        loserGame.finishedAt = new Date();
        await this.gameRepository.flush();
      }

      duel.status = DuelStatus.FINISHED;
      duel.winner = winnerGame === challengerGame ? duel.challenger : duel.opponent;
      duel.finishedAt = new Date();
      await this.duelRepository.flush();
      return;
    }

    const bothFinished =
      challengerGame.status !== GameStatus.IN_PROGRESS && opponentGame.status !== GameStatus.IN_PROGRESS;
    if (bothFinished) {
      duel.status = DuelStatus.FINISHED;
      duel.finishedAt = new Date();
      await this.duelRepository.flush();
    }
  }
}
