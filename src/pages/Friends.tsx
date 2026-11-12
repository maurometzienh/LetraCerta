import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFriends } from '../hooks/useFriends';
import { useDuelLobby } from '../hooks/useDuelLobby';
import { ApiError } from '../services/api';

export function Friends() {
  const { friends, pending, isLoading, error, sendRequest, respondRequest } = useFriends();
  const duelLobby = useDuelLobby();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challengingUsername, setChallengingUsername] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);
    try {
      await sendRequest(username.trim());
      setFormSuccess(`Pedido enviado para ${username.trim()}!`);
      setUsername('');
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao enviar pedido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRespond(requestId: number, accept: boolean) {
    try {
      await respondRequest(requestId, accept);
    } catch {
      setFormError('Erro ao responder o pedido.');
    }
  }

  async function handleChallenge(friendUsername: string) {
    setFormError(null);
    setChallengingUsername(friendUsername);
    try {
      const duelId = await duelLobby.challenge(friendUsername);
      navigate(`/duelo/${duelId}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao desafiar.');
    } finally {
      setChallengingUsername(null);
    }
  }

  async function handleRespondDuel(duelId: number, accept: boolean) {
    try {
      await duelLobby.respond(duelId, accept);
      if (accept) navigate(`/duelo/${duelId}`);
    } catch {
      setFormError('Erro ao responder o duelo.');
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Amigos</h1>

      {duelLobby.activeDuelId && (
        <div className="mb-6 flex items-center justify-between rounded-md border border-emerald-700 bg-emerald-950 px-4 py-3">
          <span className="text-sm text-emerald-300">Você tem um duelo em andamento!</span>
          <button
            type="button"
            onClick={() => navigate(`/duelo/${duelLobby.activeDuelId}`)}
            className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-emerald-400"
          >
            Continuar
          </button>
        </div>
      )}

      {duelLobby.pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-slate-200">Convites de duelo</h2>
          <ul className="flex flex-col gap-2">
            {duelLobby.pending.map((duel) => (
              <li
                key={duel.id}
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-3"
              >
                <span className="text-slate-100">{duel.opponentUsername} te desafiou!</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRespondDuel(duel.id, true)}
                    className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-emerald-400"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondDuel(duel.id, false)}
                    className="rounded-md bg-slate-700 px-3 py-1 text-sm font-medium text-slate-100 hover:bg-slate-600"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="text"
          required
          minLength={3}
          placeholder="Nome de usuário do seu amigo"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          Adicionar
        </button>
      </form>

      {(formError || error) && <p className="mb-4 text-sm text-red-400">{formError ?? error}</p>}
      {formSuccess && <p className="mb-4 text-sm text-emerald-400">{formSuccess}</p>}

      {isLoading ? (
        <p className="text-slate-400">Carregando...</p>
      ) : (
        <>
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-slate-200">Pedidos de amizade pendentes</h2>
              <ul className="flex flex-col gap-2">
                {pending.map((request) => (
                  <li
                    key={request.requestId}
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-3"
                  >
                    <span className="text-slate-100">{request.from.username}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespond(request.requestId, true)}
                        className="rounded-md bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-emerald-400"
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespond(request.requestId, false)}
                        className="rounded-md bg-slate-700 px-3 py-1 text-sm font-medium text-slate-100 hover:bg-slate-600"
                      >
                        Recusar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-200">Seus amigos</h2>
            {friends.length === 0 ? (
              <p className="text-slate-400">Você ainda não tem amigos adicionados.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {friends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-4 py-3"
                  >
                    <span className="text-slate-100">{friend.username}</span>
                    <button
                      type="button"
                      onClick={() => handleChallenge(friend.username)}
                      disabled={challengingUsername === friend.username || Boolean(duelLobby.activeDuelId)}
                      className="rounded-md bg-amber-500 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-amber-400 disabled:opacity-60"
                    >
                      Desafiar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
