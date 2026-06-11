// client-user/src/api/userClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';

const userClient = axios.create({
  baseURL: ENDPOINTS.USER,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default userClient;
