import { useRanking } from '../hooks/useRanking';

export function Ranking() {
  const { ranking, isLoading } = useRanking();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Ranking</h1>

      {isLoading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : ranking.length === 0 ? (
        <p className="text-slate-400">Ninguém completou uma partida ainda. Seja o primeiro!</p>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-slate-800 text-left text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Jogador</th>
              <th className="px-4 py-3">Vitórias</th>
              <th className="px-4 py-3">Partidas</th>
              <th className="px-4 py-3">% de vitórias</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry) => (
              <tr key={entry.position} className="border-t border-slate-800 text-slate-200">
                <td className="px-4 py-3">{entry.position}</td>
                <td className="px-4 py-3 font-medium">{entry.username}</td>
                <td className="px-4 py-3">{entry.wins}</td>
                <td className="px-4 py-3">{entry.gamesPlayed}</td>
                <td className="px-4 py-3">{entry.winRatePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
