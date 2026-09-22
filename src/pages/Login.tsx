import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';
import { ApiError } from '../services/api';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao entrar.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6"
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-100">Entrar</h1>

        <label className="mb-3 block text-sm text-slate-300">
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        <label className="mb-4 block text-sm text-slate-300">
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none"
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-emerald-500 py-2 font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-400">
          Não tem conta?{' '}
          <Link to="/registro" className="text-emerald-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  );
}
