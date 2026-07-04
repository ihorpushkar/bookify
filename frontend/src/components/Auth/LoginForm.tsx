import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../utils/errors';
import { showError, showSuccess } from '../../utils/toast';
import { buttonPrimaryClass, formClass, inputClass, labelClass } from '../../utils/formStyles';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, refreshToken } = response.data.data;
      setTokens(token, refreshToken);
      const user = await authAPI.getMe();
      setUser(user);
      showSuccess('Welcome back!');
      navigate(user.role === 'PROVIDER' ? '/dashboard' : '/services');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
          disabled={loading}
        />
      </div>
      <button type="submit" disabled={loading} className={`${buttonPrimaryClass} w-full`}>
        {loading ? 'Logging in…' : 'Login'}
      </button>
      <p className="text-center text-sm text-slate-400">
        No account? <Link to="/register" className="text-indigo-400 hover:underline">Sign up</Link>
      </p>
    </form>
  );
}
