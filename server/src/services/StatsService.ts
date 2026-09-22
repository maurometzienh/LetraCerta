import { GameRepository } from '../repositories/GameRepository.js';
import { User } from '../domain/entities/User.js';
import { GameStatus } from '../domain/entities/Game.js';
import { MAX_ATTEMPTS } from '../utils/constants.js';

export interface StatsDTO {
  gamesPlayed: number;
  wins: number;
  winRatePercent: number;
  currentStreak: number;
  maxStreak: number;
  attemptsDistribution: Record<number, number>;
}

export class StatsService {
  constructor(private readonly gameRepository: GameRepository) {}

  async getStatsForUser(user: User): Promise<StatsDTO> {
    const games = await this.gameRepository.findFinishedByUser(user);

    const attemptsDistribution: Record<number, number> = {};
    for (let i = 1; i <= MAX_ATTEMPTS; i++) attemptsDistribution[i] = 0;

    let wins = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    for (const game of games) {
      if (game.status === GameStatus.WON) {
        wins += 1;
        currentStreak += 1;
        maxStreak = Math.max(maxStreak, currentStreak);
        const attemptsUsed = game.attempts.count();
        if (attemptsDistribution[attemptsUsed] !== undefined) {
          attemptsDistribution[attemptsUsed] += 1;
        }
      } else {
        currentStreak = 0;
      }
    }

    const gamesPlayed = games.length;
    const winRatePercent = gamesPlayed === 0 ? 0 : Math.round((wins / gamesPlayed) * 100);

    return { gamesPlayed, wins, winRatePercent, currentStreak, maxStreak, attemptsDistribution };
  }
}
