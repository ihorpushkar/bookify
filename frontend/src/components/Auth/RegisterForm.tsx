import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { getErrorMessage } from '../../utils/errors';
import { showError, showSuccess } from '../../utils/toast';
import { buttonPrimaryClass, formClass, inputClass, labelClass } from '../../utils/formStyles';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'PROVIDER'>('CLIENT');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.register({ email, password, name, role });
      const { token, refreshToken } = response.data.data;
      setTokens(token, refreshToken);
      const user = await authAPI.getMe();
      setUser(user);
      showSuccess('Account created!');
      navigate(role === 'PROVIDER' ? '/dashboard' : '/services');
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div>
        <label htmlFor="name" className={labelClass}>Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          required
          disabled={loading}
        />
      </div>
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
          minLength={8}
          maxLength={128}
          required
          disabled={loading}
        />
      </div>
      <fieldset>
        <legend className={labelClass}>I am a</legend>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="role"
              value="CLIENT"
              checked={role === 'CLIENT'}
              onChange={() => setRole('CLIENT')}
              disabled={loading}
            />
            Client
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="radio"
              name="role"
              value="PROVIDER"
              checked={role === 'PROVIDER'}
              onChange={() => setRole('PROVIDER')}
              disabled={loading}
            />
            Provider
          </label>
        </div>
      </fieldset>
      <button type="submit" disabled={loading} className={`${buttonPrimaryClass} w-full`}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>
      <p className="text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:underline">Login</Link>
      </p>
    </form>
  );
}
