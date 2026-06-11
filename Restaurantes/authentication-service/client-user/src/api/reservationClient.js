// client-user/src/api/reservationClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';

const reservationClient = axios.create({
  baseURL: ENDPOINTS.RESERVATION,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default reservationClient;
