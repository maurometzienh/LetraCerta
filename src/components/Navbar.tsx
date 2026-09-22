import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
      <Link to="/" className="text-xl font-bold tracking-tight text-emerald-400">
        LetraCerta
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/" className="text-slate-300 hover:text-white">
          Jogar
        </Link>
        <Link to="/ranking" className="text-slate-300 hover:text-white">
          Ranking
        </Link>
        {user ? (
          <>
            <span className="text-slate-500">Olá, {user.username}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="rounded-md bg-emerald-500 px-3 py-1.5 font-medium text-slate-900 hover:bg-emerald-400"
          >
            Entrar
          </Link>
        )}
      </div>
    </nav>
  );
}
