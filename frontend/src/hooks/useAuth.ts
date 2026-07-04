import { useEffect } from 'react';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { token, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      authAPI
        .getMe()
        .then(setUser)
        .catch(() => logout());
    }
  }, [token, user, setUser, logout]);

  return {
    token,
    user,
    isAuthenticated: !!token,
    logout,
  };
}
