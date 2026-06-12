// client-user/src/api/userClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const userClient = axios.create({
  baseURL: ENDPOINTS.USER,
  headers: {
    'Content-Type': 'application/json'
  }
});

userClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default userClient;
