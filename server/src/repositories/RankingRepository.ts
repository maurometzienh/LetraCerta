import type { EntityManager } from '@mikro-orm/postgresql';

export interface RankingRow {
  user_id: number;
  username: string;
  wins: number;
  games_played: number;
}

export class RankingRepository {
  constructor(private readonly em: EntityManager) {}

  async findTopPlayers(limit = 20): Promise<RankingRow[]> {
    const rows = await this.em.getConnection().execute(
      `SELECT u.id as user_id, u.username as username,
              COUNT(*) FILTER (WHERE g.status = 'WON') as wins,
              COUNT(*) as games_played
       FROM games g
       JOIN users u ON u.id = g.user_id
       WHERE g.status IN ('WON', 'LOST') AND g.mode = 'DAILY'
       GROUP BY u.id, u.username
       ORDER BY wins DESC, games_played ASC
       LIMIT ?`,
      [limit],
    );
    return rows as RankingRow[];
  }
}
