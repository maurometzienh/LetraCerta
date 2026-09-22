export type LetterStatus = 'correct' | 'present' | 'absent';

export type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export interface Attempt {
  attemptNumber: number;
  guess: string;
  result: LetterStatus[];
}

export interface GameState {
  status: GameStatus;
  attempts: Attempt[];
  attemptsRemaining: number;
  secretWord?: string;
}

export interface Stats {
  gamesPlayed: number;
  wins: number;
  winRatePercent: number;
  currentStreak: number;
  maxStreak: number;
  attemptsDistribution: Record<number, number>;
}

export interface RankingEntry {
  position: number;
  username: string;
  wins: number;
  gamesPlayed: number;
  winRatePercent: number;
}
