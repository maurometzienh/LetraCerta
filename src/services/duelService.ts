import { apiRequest } from './api';
import type { DuelState, DuelSummary } from '../types/duel';

export function challengeFriend(username: string) {
  return apiRequest<DuelSummary>('/duels/challenge', {
    method: 'POST',
    body: { username },
    auth: true,
  });
}

export function getPendingDuels() {
  return apiRequest<DuelSummary[]>('/duels/pending', { auth: true });
}

export function getActiveDuelId() {
  return apiRequest<{ duelId: number | null }>('/duels/active', { auth: true });
}

export function respondDuel(id: number, accept: boolean) {
  return apiRequest<{ message: string }>(`/duels/${id}/respond`, {
    method: 'POST',
    body: { accept },
    auth: true,
  });
}

export function getDuelState(id: number) {
  return apiRequest<DuelState>(`/duels/${id}`, { auth: true });
}

export function submitDuelGuess(id: number, guess: string) {
  return apiRequest<DuelState>(`/duels/${id}/guess`, {
    method: 'POST',
    body: { guess },
    auth: true,
  });
}
