// client-user/src/shared/constants/endpoints.js
const ENDPOINTS = {
  AUTH: process.env.EXPO_PUBLIC_AUTH_URL || 'http://localhost:5023/api/v1/auth',
  RESTAURANT: process.env.EXPO_PUBLIC_RESTAURANT_URL || 'http://localhost:3000/api/restaurants',
  MENU: process.env.EXPO_PUBLIC_MENU_URL || 'http://localhost:3000/api/menu',
  RESERVATION: process.env.EXPO_PUBLIC_RESERVATION_URL || 'http://localhost:3000/api/reservations',
  ORDER: process.env.EXPO_PUBLIC_ORDER_URL || 'http://localhost:3000/api/orders',
  USER: process.env.EXPO_PUBLIC_USER_URL || 'http://localhost:3000/api/users'
};

export default ENDPOINTS;
