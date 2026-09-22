import { useEffect, useState } from 'react';
import * as gameService from '../services/gameService';
import type { RankingEntry } from '../types/game';

export function useRanking() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gameService
      .getRanking()
      .then(setRanking)
      .finally(() => setIsLoading(false));
  }, []);

  return { ranking, isLoading };
}
