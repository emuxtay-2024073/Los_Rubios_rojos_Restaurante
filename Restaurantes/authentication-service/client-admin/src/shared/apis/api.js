import axios from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const addAuthHeaders = (clientName) => (config) => {
  config._axiosClient = clientName;
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
};

axiosAuth.interceptors.request.use(addAuthHeaders('auth'));
axiosAdmin.interceptors.request.use(addAuthHeaders('admin'));

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
}

const publicAuthEndpoints = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
];

const handleRefreshToken = async (error) => {
  const original = error.config;

  if (!original || original._retry) {
    return Promise.reject(error);
  }

  const requestUrl = original.url || '';
  const isPublicAuthEndpoint = publicAuthEndpoints.some((endpoint) => requestUrl.includes(endpoint));

  if (isPublicAuthEndpoint) {
    return Promise.reject(error);
  }

  const status = error.response?.status;
  const errorCode = error.response?.data?.error;
  const shouldRefresh = status === 401 || (status === 403 && errorCode === 'TOKEN_EXPIRED');

  if (!shouldRefresh) {
    return Promise.reject(error);
  }

  const retryClient = original._axiosClient === 'admin' ? axiosAdmin : axiosAuth;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return retryClient(original);
      })
      .catch((err) => Promise.reject(err));
  }

  original._retry = true;
  isRefreshing = true;

  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    useAuthStore.getState().logout();
    isRefreshing = false;
    return Promise.reject(error);
  }

  try {
    const response = await axiosAuth.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, expiresIn, userDetails } = response.data;

    useAuthStore.setState({
      token: accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresIn,
      user: userDetails || useAuthStore.getState().user,
      isAuthenticated: true,
    });

    processQueue(null, accessToken);
    original.headers.Authorization = `Bearer ${accessToken}`;
    return retryClient(original);
  } catch (err) {
    processQueue(err, null);
    useAuthStore.getState().logout();
    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAuth, axiosAdmin };
export default { axiosAuth, axiosAdmin };
