// client-user/src/api/restaurantClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';

const restaurantClient = axios.create({
  baseURL: ENDPOINTS.RESTAURANT,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default restaurantClient;
