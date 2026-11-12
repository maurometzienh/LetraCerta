import type { GameState, LetterStatus } from '../types/game';
import { MAX_ATTEMPTS } from './constants';

const EMOJI: Record<LetterStatus, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬜',
};

/** Monta o resumo estilo Wordle (placar + grade de emojis) pra compartilhar. */
export function buildShareText(game: GameState, modeLabel: string): string {
  const scoreLine = game.status === 'WON' ? `${game.attempts.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;

  const grid = game.attempts
    .map((attempt) => attempt.result.map((status) => EMOJI[status]).join(''))
    .join('\n');

  return `LetraCerta — ${modeLabel}\n${scoreLine}\n\n${grid}`;
}
