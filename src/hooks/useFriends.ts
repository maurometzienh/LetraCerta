import { useCallback, useEffect, useState } from 'react';
import * as friendsService from '../services/friendsService';
import { ApiError } from '../services/api';
import type { Friend, PendingRequest } from '../types/friends';

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [friendsList, pendingList] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getPendingRequests(),
      ]);
      setFriends(friendsList);
      setPending(pendingList);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar amigos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const sendRequest = useCallback(
    async (username: string) => {
      await friendsService.sendFriendRequest(username);
      await reload();
    },
    [reload],
  );

  const respondRequest = useCallback(
    async (requestId: number, accept: boolean) => {
      await friendsService.respondFriendRequest(requestId, accept);
      await reload();
    },
    [reload],
  );

  return { friends, pending, isLoading, error, sendRequest, respondRequest, reload };
}
