// client-user/src/features/auth/hooks/useAuth.js
import { useState, useCallback } from 'react';
import authClient from '../../../api/authClient.js';
import { useAuthStore } from '../../../store/authStore.js';
 
/**
 * Decodifica el payload de un JWT sin verificar firma
 * (la verificación real la hace el backend en cada request).
 */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
 
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
 
      // El backend devuelve { token } (no accessToken/refreshToken/user)
      // Aceptamos ambas formas para compatibilidad futura
      const token = response.data.token || response.data.accessToken;
      const refreshToken = response.data.refreshToken || null;
 
      // Extraemos el usuario del payload del JWT
      const decoded = decodeJwtPayload(token);
      console.log('TOKEN DECODED:', JSON.stringify(decoded));
      const user = decoded
        ? {
            id: decoded.id || decoded.sub,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,   // "ADMIN" | "CLIENTE"
            verified: decoded.verified
          }
        : response.data.user || null;
      console.log('USER A GUARDAR:', JSON.stringify(user));
 
      await login(token, user, refreshToken);
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || 'Error al iniciar sesión';
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
      const message =
        err?.response?.data?.message || err.message || 'Error al registrar usuario';
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
      const message =
        err?.response?.data?.message || err.message || 'Error al enviar correo';
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
 