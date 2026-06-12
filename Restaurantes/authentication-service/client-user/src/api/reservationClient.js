// client-user/src/api/reservationClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const reservationClient = axios.create({
  baseURL: ENDPOINTS.RESERVATION,
  headers: {
    'Content-Type': 'application/json'
  }
});

reservationClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default reservationClient;
