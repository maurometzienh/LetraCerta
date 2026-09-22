import { RankingRepository } from '../repositories/RankingRepository.js';

export interface RankingEntryDTO {
  position: number;
  username: string;
  wins: number;
  gamesPlayed: number;
  winRatePercent: number;
}

export class RankingService {
  constructor(private readonly rankingRepository: RankingRepository) {}

  async getTopPlayers(limit = 20): Promise<RankingEntryDTO[]> {
    const rows = await this.rankingRepository.findTopPlayers(limit);

    return rows.map((row, index) => ({
      position: index + 1,
      username: row.username,
      wins: Number(row.wins),
      gamesPlayed: Number(row.games_played),
      winRatePercent:
        Number(row.games_played) === 0
          ? 0
          : Math.round((Number(row.wins) / Number(row.games_played)) * 100),
    }));
  }
}
