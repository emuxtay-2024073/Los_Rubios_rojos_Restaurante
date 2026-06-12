// client-user/src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
// AsyncStorage funciona en Expo Go y en development builds.
// expo-secure-store solo funciona en development/production builds nativos,
// por eso causaba el warning y el store no se persistía.
 
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
 
      login: async (accessToken, user, refreshToken) => {
        // refreshToken también se guarda en el JSON persistido
        set({ token: accessToken, user, isAuthenticated: true, refreshToken: refreshToken || null });
      },
 
      logout: async () => {
        set({ token: null, user: null, isAuthenticated: false, refreshToken: null });
      },
 
      setAccessToken: (accessToken) => {
        set({ token: accessToken });
      },
 
      updateUser: (user) => {
        set({ user });
      },
 
      getRefreshToken: () => get().refreshToken || null,
    }),
    {
      name: 'client-user-auth',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        useAuthStore.setState({ _hasHydrated: true });
      },
      version: 4, // versión nueva para limpiar el storage viejo de SecureStore
      migrate: (persistedState) => {
        return { ...persistedState, _hasHydrated: false };
      },
    }
  )
);
 
// Compatibilidad: funciones que antes usaban SecureStore directamente
export const saveRefreshToken = async (token) => {
  useAuthStore.getState().setAccessToken !== undefined; // no-op, ya está en el store
};
 
export const getStoredRefreshToken = async () => {
  return useAuthStore.getState().getRefreshToken();
};
 