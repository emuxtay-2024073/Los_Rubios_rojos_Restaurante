import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';
import { useAuthStore } from '../store/authStore.js';

const tableClient = axios.create({
  baseURL: ENDPOINTS.TABLE,
  headers: {
    'Content-Type': 'application/json'
  }
});

tableClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default tableClient;
