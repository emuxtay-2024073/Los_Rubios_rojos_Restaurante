// client-user/src/api/orderClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';

const orderClient = axios.create({
  baseURL: ENDPOINTS.ORDER,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default orderClient;
