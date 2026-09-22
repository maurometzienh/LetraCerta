import { useCallback, useEffect, useState } from 'react';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { StatsPanel } from '../components/StatsPanel';
import { useGame } from '../hooks/useGame';
import { WORD_LENGTH } from '../utils/constants';

const STATUS_MESSAGES: Record<string, string> = {
  WON: 'Parabéns, você acertou! 🎉',
  LOST: 'Não foi dessa vez. A palavra era:',
};

function Home() {
  const { game, isLoading, isSubmitting, error, submitGuess } = useGame();
  const [currentGuess, setCurrentGuess] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const isFinished = game?.status === 'WON' || game?.status === 'LOST';

  const handleKeyPress = useCallback(
    (key: string) => {
      if (isFinished || isSubmitting) return;

      if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (key === 'ENTER') {
        if (currentGuess.length !== WORD_LENGTH) {
          setFeedback(`O palpite precisa ter ${WORD_LENGTH} letras.`);
          return;
        }
        submitGuess(currentGuess)
          .then(() => setCurrentGuess(''))
          .catch(() => setFeedback('Não foi possível enviar o palpite.'));
        return;
      }

      if (/^[a-z]$/i.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, isFinished, isSubmitting, submitGuess],
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

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center text-slate-400">Carregando...</div>;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">
          Letra<span className="text-emerald-400">Certa</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">Descubra a palavra do dia em até 6 tentativas.</p>
      </div>

      {(feedback || error) && (
        <p className="rounded-md bg-slate-800 px-4 py-2 text-sm text-amber-300">{feedback ?? error}</p>
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

      <Keyboard attempts={game?.attempts ?? []} onKeyPress={handleKeyPress} disabled={isFinished || isSubmitting} />

      {isFinished && <StatsPanel />}
    </main>
  );
}

export default Home;
