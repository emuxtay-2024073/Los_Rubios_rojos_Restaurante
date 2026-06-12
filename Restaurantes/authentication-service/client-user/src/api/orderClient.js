// client-user/src/api/orderClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const orderClient = axios.create({
  baseURL: ENDPOINTS.ORDER,
  headers: {
    'Content-Type': 'application/json'
  }
});

orderClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default orderClient;
