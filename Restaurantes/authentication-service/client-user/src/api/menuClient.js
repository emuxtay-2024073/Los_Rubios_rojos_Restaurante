// client-user/src/api/menuClient.js
import axios from 'axios';
import ENDPOINTS from '../shared/constants/endpoints.js';

const menuClient = axios.create({
  baseURL: ENDPOINTS.MENU,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default menuClient;
