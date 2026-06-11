// client-user/src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refreshToken';

const loadRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    return;
  }
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      login: async (accessToken, user, refreshToken) => {
        await saveRefreshToken(refreshToken);
        set({ token: accessToken, user, isAuthenticated: true });
      },
      logout: async () => {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set({ token: null, user: null, isAuthenticated: false });
      },
      setAccessToken: (accessToken) => {
        set({ token: accessToken });
      },
      updateUser: (user) => {
        set({ user });
      }
    }),
    {
      name: 'client-user-auth',
      onRehydrateStorage: () => (state) => {
        useAuthStore.setState({ _hasHydrated: true });
      },
      version: 2,
      migrate: (persistedState) => {
        return { ...persistedState, _hasHydrated: false };
      }
    }
  )
);

export const getStoredRefreshToken = async () => {
  return await loadRefreshToken();
};
 