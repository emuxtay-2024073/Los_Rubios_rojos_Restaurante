// client-user/src/features/auth/hooks/useAuth.js
import { useState, useCallback } from 'react';
import authClient from '../../../api/authClient.js';
import { useAuthStore } from '../../../store/authStore.js';

export default function useAuth() {
  const login = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.post('/login', payload);
      const { accessToken, refreshToken, user } = response.data;

      await login(accessToken, user, refreshToken);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Error al iniciar sesión';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const handleRegister = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.post('/register', payload);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Error al registrar usuario';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleForgotPassword = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authClient.post('/forgot-password', payload);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Error al enviar correo';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutStore();
  }, [logoutStore]);

  return {
    handleLogin,
    handleRegister,
    handleForgotPassword,
    logout,
    loading,
    error
  };
}
