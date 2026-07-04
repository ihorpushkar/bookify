import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';

export function Header() {
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/services" className="text-lg font-semibold text-indigo-400">
          Bookify
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/services" className="text-slate-300 hover:text-white">
            Services
          </Link>

          {isAuthenticated && user?.role === 'CLIENT' && (
            <Link to="/my-bookings" className="text-slate-300 hover:text-white">
              My Bookings
            </Link>
          )}

          {isAuthenticated && user?.role === 'PROVIDER' && (
            <Link to="/dashboard" className="text-slate-300 hover:text-white">
              Dashboard
            </Link>
          )}

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-500"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:border-slate-500"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
