import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Board } from '../components/Board';
import { Keyboard } from '../components/Keyboard';
import { OpponentProgress } from '../components/OpponentProgress';
import { useDuel } from '../hooks/useDuel';
import { WORD_LENGTH } from '../utils/constants';

function Duel() {
  const { id } = useParams<{ id: string }>();
  const duelId = id ? Number(id) : null;
  const { duel, isLoading, isSubmitting, error, submitGuess } = useDuel(duelId);
  const [currentGuess, setCurrentGuess] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const game = duel?.myGame;
  const isFinished = game?.status === 'WON' || game?.status === 'LOST';
  const canType = duel?.status === 'IN_PROGRESS' && Boolean(game) && !isFinished;

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!canType || isSubmitting) return;

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
          .catch(() => {});
        return;
      }

      if (/^[a-z]$/i.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [canType, isSubmitting, currentGuess, submitGuess],
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

  if (!duelId) {
    return <p className="flex-1 p-8 text-center text-slate-400">Duelo inválido.</p>;
  }

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center text-slate-400">Carregando...</div>;
  }

  if (!duel) {
    return <p className="flex-1 p-8 text-center text-red-400">{error ?? 'Duelo não encontrado.'}</p>;
  }

  const iWon = duel.winnerUsername && duel.winnerUsername !== duel.opponentUsername;
  const opponentWon = duel.winnerUsername === duel.opponentUsername;

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-100">Duelo contra {duel.opponentUsername}</h1>
        {duel.status === 'PENDING' && (
          <p className="mt-1 text-sm text-amber-300">
            Aguardando {duel.opponentUsername} aceitar o desafio...
          </p>
        )}
      </div>

      {(feedback || error) && (
        <p className="rounded-md bg-slate-800 px-4 py-2 text-sm text-amber-300">{feedback ?? error}</p>
      )}

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
        <div className="flex flex-col items-center gap-4">
          {game && <Board attempts={game.attempts} currentGuess={currentGuess} />}
          {game && (
            <Keyboard attempts={game.attempts} onKeyPress={handleKeyPress} disabled={!canType || isSubmitting} />
          )}
        </div>

        <OpponentProgress
          username={duel.opponentUsername}
          progress={duel.opponentProgress}
          status={duel.opponentStatus}
        />
      </div>

      {duel.status === 'FINISHED' && (
        <p className="text-center text-lg font-semibold text-slate-100">
          {iWon && 'Você venceu o duelo! 🎉'}
          {opponentWon && `${duel.opponentUsername} venceu o duelo!`}
          {!duel.winnerUsername && 'Empate — ninguém acertou a tempo.'}
        </p>
      )}

      <Link to="/amigos" className="text-sm text-emerald-400 hover:underline">
        Voltar pra lista de amigos
      </Link>
    </main>
  );
}

export default Duel;
