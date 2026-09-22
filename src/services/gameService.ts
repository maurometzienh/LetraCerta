import { apiRequest } from './api';
import type { GameState, RankingEntry, Stats } from '../types/game';

export function getTodayGame() {
  return apiRequest<GameState>('/games/today', { auth: true });
}

export function submitGuess(guess: string) {
  return apiRequest<GameState>('/games/guess', {
    method: 'POST',
    body: { guess },
    auth: true,
  });
}

export function getMyStats() {
  return apiRequest<Stats>('/stats/me', { auth: true });
}

export function getRanking() {
  return apiRequest<RankingEntry[]>('/ranking');
}
