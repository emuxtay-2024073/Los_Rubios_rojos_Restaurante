// client-user/src/api/menuClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const menuClient = axios.create({
  baseURL: ENDPOINTS.MENU,
  headers: {
    'Content-Type': 'application/json'
  }
});

menuClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default menuClient;
