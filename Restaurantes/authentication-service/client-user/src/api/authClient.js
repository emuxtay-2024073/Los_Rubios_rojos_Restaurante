// client-user/src/api/authClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore, getStoredRefreshToken, saveRefreshToken } from '../store/authStore.js';

const authInstance = axios.create({
  baseURL: ENDPOINTS.AUTH,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (error) {
      reject(error);
      return;
    }
    originalRequest.headers.Authorization = `Bearer ${token}`;
    resolve(authInstance(originalRequest));
  });
  failedQueue = [];
};

const isAuthRoute = (url) => {
  if (!url) return false;
  const normalized = url.toLowerCase();
  return [
    '/login',
    '/register',
    '/verify-email',
    '/forgot-password',
    '/reset-password'
  ].some((route) => normalized.includes(route));
};

const isRefreshRoute = (url) => {
  if (!url) return false;
  return url.toLowerCase().includes('/refresh-token');
};

authInstance.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers && !isAuthRoute(config.url) && !isRefreshRoute(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retry ||
      !error.response ||
      error.response.status !== 401 ||
      isAuthRoute(originalRequest.url) ||
      isRefreshRoute(originalRequest.url)
    ) {
      if (error.response?.status === 401 && isRefreshRoute(originalRequest?.url)) {
        await useAuthStore.getState().logout();
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    return new Promise(async (resolve, reject) => {
      try {
        const refreshToken = await getStoredRefreshToken();
        if (!refreshToken) {
          await useAuthStore.getState().logout();
          reject(error);
          return;
        }

        const response = await authInstance.post('/refresh-token', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = response.data;

        if (accessToken) {
          useAuthStore.getState().setAccessToken(accessToken);
        }
        if (newRefreshToken) {
          await saveRefreshToken(newRefreshToken);
        }
        if (user) {
          useAuthStore.getState().updateUser(user);
        }

        processQueue(null, accessToken);
        resolve(authInstance(originalRequest));
      } catch (refreshError) {
        await useAuthStore.getState().logout();
        processQueue(refreshError, null);
        reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    });
  }
);

export default authInstance;
