// client-user/src/features/profile/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import userClient from '../../../api/userClient.js';
import { useAuthStore } from '../../../store/authStore.js';

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userClient.get('/profile');
      const payload = response.data.data || response.data;
      setProfile(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await userClient.put('/profile', payload);
      const data = response.data.data || response.data;
      setProfile(data);
      updateUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refresh: loadProfile,
    updateProfile
  };
}
