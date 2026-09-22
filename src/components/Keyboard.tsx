import type { Attempt, LetterStatus } from '../types/game';

const ROWS = ['q w e r t y u i o p', 'a s d f g h j k l', 'z x c v b n m'].map((row) =>
  row.split(' '),
);

const STATUS_PRIORITY: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };

const STATUS_CLASSES: Record<LetterStatus | 'unused', string> = {
  correct: 'bg-emerald-500 text-slate-900',
  present: 'bg-amber-400 text-slate-900',
  absent: 'bg-slate-800 text-slate-500',
  unused: 'bg-slate-600 text-slate-100 hover:bg-slate-500',
};

function buildLetterStatusMap(attempts: Attempt[]): Record<string, LetterStatus> {
  const map: Record<string, LetterStatus> = {};
  for (const attempt of attempts) {
    attempt.guess.split('').forEach((letter, index) => {
      const status = attempt.result[index];
      const current = map[letter];
      if (!current || STATUS_PRIORITY[status] > STATUS_PRIORITY[current]) {
        map[letter] = status;
      }
    });
  }
  return map;
}

interface KeyboardProps {
  attempts: Attempt[];
  onKeyPress: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ attempts, onKeyPress, disabled }: KeyboardProps) {
  const statusMap = buildLetterStatusMap(attempts);

  return (
    <div className="flex flex-col items-center gap-2">
      {ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5">
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKeyPress('ENTER')}
              className="rounded-md bg-slate-600 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-500 disabled:opacity-50"
            >
              Enviar
            </button>
          )}
          {row.map((key) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onKeyPress(key)}
              className={`h-11 min-w-9 rounded-md px-2 text-sm font-semibold uppercase disabled:opacity-50 ${
                STATUS_CLASSES[statusMap[key] ?? 'unused']
              }`}
            >
              {key}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onKeyPress('BACKSPACE')}
              className="rounded-md bg-slate-600 px-3 text-xs font-semibold text-slate-100 hover:bg-slate-500 disabled:opacity-50"
            >
              ⌫
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
