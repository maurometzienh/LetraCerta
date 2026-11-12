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
    <nav className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4">
      <Link to="/" className="text-lg font-bold tracking-tight text-emerald-400 sm:text-xl">
        LetraCerta
      </Link>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm sm:gap-x-4">
        <Link to="/" className="text-slate-300 hover:text-white">
          Jogar
        </Link>
        <Link to="/ranking" className="text-slate-300 hover:text-white">
          Ranking
        </Link>
        {user ? (
          <>
            <Link to="/amigos" className="text-slate-300 hover:text-white">
              Amigos
            </Link>
            <span className="hidden max-w-[140px] truncate text-slate-500 sm:inline">
              Olá, {user.username}
            </span>
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
