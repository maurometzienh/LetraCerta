import type { GameStatus, LetterStatus } from '../types/game';

const STATUS_CLASSES: Record<LetterStatus, string> = {
  correct: 'bg-emerald-500',
  present: 'bg-amber-400',
  absent: 'bg-slate-700',
};

interface OpponentProgressProps {
  username: string;
  progress: LetterStatus[][];
  status: GameStatus;
}

export function OpponentProgress({ username, progress, status }: OpponentProgressProps) {
  return (
    <div className="w-full max-w-[180px] rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="mb-2 truncate text-sm font-semibold text-slate-200">{username}</p>
      <div className="flex flex-col gap-1">
        {progress.length === 0 && <p className="text-xs text-slate-500">Ainda não jogou</p>}
        {progress.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1">
            {row.map((letterStatus, colIndex) => (
              <div key={colIndex} className={`h-4 w-4 rounded-sm ${STATUS_CLASSES[letterStatus]}`} />
            ))}
          </div>
        ))}
      </div>
      {status === 'WON' && <p className="mt-2 text-xs font-semibold text-emerald-400">Venceu! 🏆</p>}
      {status === 'LOST' && <p className="mt-2 text-xs font-semibold text-red-400">Perdeu</p>}
    </div>
  );
}
