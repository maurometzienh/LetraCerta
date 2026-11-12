import type { GameState, GameStatus, LetterStatus } from './game';

export type DuelStatus = 'PENDING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface DuelSummary {
  id: number;
  opponentUsername: string;
  createdAt: string;
}

export interface DuelState {
  id: number;
  status: DuelStatus;
  opponentUsername: string;
  winnerUsername?: string;
  myGame: GameState;
  /** Progresso do oponente: só os emojis de cada tentativa, nunca as palavras dele. */
  opponentProgress: LetterStatus[][];
  opponentStatus: GameStatus;
}
