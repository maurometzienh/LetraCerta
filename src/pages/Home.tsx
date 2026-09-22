import { useCallback, useEffect, useState } from 'react';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { StatsPanel } from '../components/StatsPanel';
import { useGame } from '../hooks/useGame';
import { useRandomGame } from '../hooks/useRandomGame';
import { WORD_LENGTH } from '../utils/constants';

const STATUS_MESSAGES: Record<string, string> = {
  WON: 'Parabéns, você acertou! 🎉',
  LOST: 'Não foi dessa vez. A palavra era:',
};

type Mode = 'daily' | 'random';

function Home() {
  const [mode, setMode] = useState<Mode>('daily');
  const daily = useGame();
  const random = useRandomGame();

  const active = mode === 'daily' ? daily : random;
  const game = active.game;
  const isFinished = game?.status === 'WON' || game?.status === 'LOST';
  const canType = Boolean(game) && !isFinished;

  const [currentGuess, setCurrentGuess] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!canType || active.isSubmitting) return;

      if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (key === 'ENTER') {
        if (currentGuess.length !== WORD_LENGTH) {
          setFeedback(`O palpite precisa ter ${WORD_LENGTH} letras.`);
          return;
        }
        active
          .submitGuess(currentGuess)
          .then(() => setCurrentGuess(''))
          .catch(() => setFeedback('Não foi possível enviar o palpite.'));
        return;
      }

      if (/^[a-z]$/i.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [active, canType, currentGuess],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') handleKeyPress('ENTER');
      else if (event.key === 'Backspace') handleKeyPress('BACKSPACE');
      else if (/^[a-z]$/i.test(event.key)) handleKeyPress(event.key);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  useEffect(() => {
    setCurrentGuess('');
    setFeedback(null);
  }, [mode]);

  if (daily.isLoading || random.isLoading) {
    return <div className="flex flex-1 items-center justify-center text-slate-400">Carregando...</div>;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Letra<span className="text-emerald-400">Certa</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {mode === 'daily'
            ? 'Descubra a palavra do dia em até 6 tentativas.'
            : 'Palavra aleatória: jogue quantas vezes quiser.'}
        </p>
      </div>

      <div className="flex gap-1 rounded-lg bg-slate-900 p-1">
        <button
          type="button"
          onClick={() => setMode('daily')}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            mode === 'daily' ? 'bg-emerald-500 text-slate-900' : 'text-slate-300 hover:text-white'
          }`}
        >
          Palavra do dia
        </button>
        <button
          type="button"
          onClick={() => setMode('random')}
          className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
            mode === 'random' ? 'bg-emerald-500 text-slate-900' : 'text-slate-300 hover:text-white'
          }`}
        >
          Palavra aleatória
        </button>
      </div>

      {(feedback || active.error) && (
        <p className="rounded-md bg-slate-800 px-4 py-2 text-sm text-amber-300">{feedback ?? active.error}</p>
      )}

      {mode === 'random' && !game && (
        <button
          type="button"
          onClick={() => random.startNew().catch(() => {})}
          disabled={random.isSubmitting}
          className="rounded-md bg-emerald-500 px-6 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          Jogar palavra aleatória
        </button>
      )}

      {game && <Board attempts={game.attempts} currentGuess={currentGuess} />}

      {isFinished && game && (
        <p className="text-center text-lg font-semibold text-slate-100">
          {STATUS_MESSAGES[game.status]}{' '}
          {game.status === 'LOST' && (
            <span className="uppercase text-emerald-400">{game.secretWord}</span>
          )}
        </p>
      )}

      {mode === 'random' && isFinished && (
        <button
          type="button"
          onClick={() => random.startNew().catch(() => {})}
          disabled={random.isSubmitting}
          className="rounded-md bg-slate-800 px-6 py-2 font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-60"
        >
          Jogar de novo com outra palavra
        </button>
      )}

      {game && (
        <Keyboard attempts={game.attempts} onKeyPress={handleKeyPress} disabled={!canType || active.isSubmitting} />
      )}

      {mode === 'daily' && isFinished && <StatsPanel />}
    </main>
  );
}

export default Home;
