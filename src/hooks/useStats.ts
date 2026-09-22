import { useEffect, useState } from 'react';
import * as gameService from '../services/gameService';
import type { Stats } from '../types/game';

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gameService
      .getMyStats()
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading };
}
