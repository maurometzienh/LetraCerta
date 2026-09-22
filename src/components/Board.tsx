import type { Attempt, LetterStatus } from '../types/game';
import { WORD_LENGTH, MAX_ATTEMPTS } from '../utils/constants';

const STATUS_CLASSES: Record<LetterStatus, string> = {
  correct: 'bg-emerald-500 border-emerald-500 text-slate-900',
  present: 'bg-amber-400 border-amber-400 text-slate-900',
  absent: 'bg-slate-700 border-slate-700 text-slate-200',
};

interface BoardProps {
  attempts: Attempt[];
  currentGuess: string;
}

export function Board({ attempts, currentGuess }: BoardProps) {
  const rows = Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
    const attempt = attempts[rowIndex];
    const isCurrentRow = rowIndex === attempts.length;
    const letters = attempt
      ? attempt.guess.split('')
      : isCurrentRow
        ? currentGuess.padEnd(WORD_LENGTH, ' ').split('')
        : new Array(WORD_LENGTH).fill(' ');

    return (
      <div key={rowIndex} className="grid grid-cols-5 gap-2">
        {letters.map((letter, colIndex) => {
          const status = attempt?.result[colIndex];
          const filled = letter.trim() !== '';
          return (
            <div
              key={colIndex}
              className={`flex h-14 w-14 items-center justify-center rounded-md border-2 text-2xl font-bold uppercase transition-colors ${
                status
                  ? STATUS_CLASSES[status]
                  : filled
                    ? 'border-slate-500 text-slate-100'
                    : 'border-slate-700 text-slate-100'
              }`}
            >
              {filled ? letter : ''}
            </div>
          );
        })}
      </div>
    );
  });

  return <div className="flex flex-col gap-2">{rows}</div>;
}
