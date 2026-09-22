import { useCallback, useEffect, useState } from 'react';
import * as gameService from '../services/gameService';
import { ApiError } from '../services/api';
import type { GameState } from '../types/game';

export function useRandomGame() {
  const [game, setGame] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const state = await gameService.getRandomGame();
      setGame(state);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar o jogo.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startNew = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const state = await gameService.startRandomGame();
      setGame(state);
      return state;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao iniciar nova partida.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const submitGuess = useCallback(async (guess: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const state = await gameService.submitRandomGuess(guess);
      setGame(state);
      return state;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao enviar palpite.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { game, isLoading, isSubmitting, error, startNew, submitGuess };
}
