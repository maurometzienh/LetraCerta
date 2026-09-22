import { useStats } from '../hooks/useStats';

export function StatsPanel() {
  const { stats, isLoading } = useStats();

  if (isLoading || !stats) return null;

  return (
    <div className="grid w-full max-w-sm grid-cols-4 gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4 text-center text-slate-100">
      <div>
        <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
        <p className="text-xs text-slate-400">Partidas</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{stats.winRatePercent}%</p>
        <p className="text-xs text-slate-400">Vitórias</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{stats.currentStreak}</p>
        <p className="text-xs text-slate-400">Sequência</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{stats.maxStreak}</p>
        <p className="text-xs text-slate-400">Melhor seq.</p>
      </div>
    </div>
  );
}
