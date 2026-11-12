import { useCallback, useEffect, useRef, useState } from 'react';
import * as duelService from '../services/duelService';
import { ApiError } from '../services/api';
import type { DuelState } from '../types/duel';

const POLL_INTERVAL_MS = 3000;

export function useDuel(duelId: number | null) {
  const [duel, setDuel] = useState<DuelState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<string | undefined>(undefined);

  const load = useCallback(async () => {
    if (duelId === null) {
      setDuel(null);
      setIsLoading(false);
      return;
    }
    try {
      const state = await duelService.getDuelState(duelId);
      setDuel(state);
      statusRef.current = state.status;
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar o duelo.');
    } finally {
      setIsLoading(false);
    }
  }, [duelId]);

  useEffect(() => {
    setIsLoading(true);
    load();
  }, [load]);

  // Poll periódico enquanto o duelo estiver em andamento, pra ver o progresso do adversário "ao vivo".
  useEffect(() => {
    if (duelId === null) return undefined;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    function schedule() {
      if (cancelled) return;
      if (statusRef.current === 'FINISHED' || statusRef.current === 'CANCELLED') return;
      timeoutId = setTimeout(async () => {
        await load();
        schedule();
      }, POLL_INTERVAL_MS);
    }

    schedule();
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [duelId, load]);

  const submitGuess = useCallback(
    async (guess: string) => {
      if (duelId === null) return;
      setIsSubmitting(true);
      setError(null);
      try {
        const state = await duelService.submitDuelGuess(duelId, guess);
        setDuel(state);
        statusRef.current = state.status;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Erro ao enviar palpite.');
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [duelId],
  );

  return { duel, isLoading, isSubmitting, error, submitGuess, reload: load };
}
