// client-user/src/api/restaurantClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adjuntar el token JWT en cada petición protegida
restaurantClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default restaurantClient;
