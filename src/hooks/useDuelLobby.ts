import { useCallback, useEffect, useState } from 'react';
import * as duelService from '../services/duelService';
import { ApiError } from '../services/api';
import type { DuelSummary } from '../types/duel';

export function useDuelLobby() {
  const [pending, setPending] = useState<DuelSummary[]>([]);
  const [activeDuelId, setActiveDuelId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pendingList, active] = await Promise.all([
        duelService.getPendingDuels(),
        duelService.getActiveDuelId(),
      ]);
      setPending(pendingList);
      setActiveDuelId(active.duelId);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar duelos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const challenge = useCallback(async (username: string) => {
    const duel = await duelService.challengeFriend(username);
    return duel.id;
  }, []);

  const respond = useCallback(
    async (duelId: number, accept: boolean) => {
      await duelService.respondDuel(duelId, accept);
      await reload();
    },
    [reload],
  );

  return { pending, activeDuelId, isLoading, error, challenge, respond, reload };
}
