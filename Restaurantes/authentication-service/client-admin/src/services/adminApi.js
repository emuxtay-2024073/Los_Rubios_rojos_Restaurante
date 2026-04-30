import { axiosAdmin } from '../shared/apis/api.js';

const normalizeResponse = (data, key) => {
  if (Array.isArray(data)) return data;
  if (data?.[key]) return data[key];
  return [];
};

const formDataConfig = (payload) => {
  if (payload instanceof FormData) {
    return { headers: { 'Content-Type': undefined } };
  }
  return {};
};

export const getRestaurants = async () => {
  const { data } = await axiosAdmin.get('/restaurants');
  return normalizeResponse(data, 'restaurants');
};

export const createRestaurant = async (payload) => {
  const { data } = await axiosAdmin.post('/restaurants', payload, formDataConfig(payload));
  return data;
};

export const updateRestaurant = async (id, payload) => {
  const { data } = await axiosAdmin.put(`/restaurants/${id}`, payload, formDataConfig(payload));
  return data;
};

export const deleteRestaurant = async (id) => {
  const { data } = await axiosAdmin.delete(`/restaurants/${id}`);
  return data;
};

export const getTablesForRestaurant = async (restaurantId) => {
  const { data } = await axiosAdmin.get(`/restaurants/${restaurantId}/tables`);
  return normalizeResponse(data, 'tables');
};

export const createTableForRestaurant = async (restaurantId, payload) => {
  const { data } = await axiosAdmin.post(`/restaurants/${restaurantId}/tables`, payload);
  return data;
};

export const updateTableForRestaurant = async (restaurantId, tableId, payload) => {
  const { data } = await axiosAdmin.put(`/restaurants/${restaurantId}/tables/${tableId}`, payload);
  return data;
};

export const deleteTableForRestaurant = async (restaurantId, tableId) => {
  const { data } = await axiosAdmin.delete(`/restaurants/${restaurantId}/tables/${tableId}`);
  return data;
};

export const getMenuItems = async () => {
  const { data } = await axiosAdmin.get('/menu-items');
  return normalizeResponse(data, 'menuItems');
};

export const getMenuItemsByRestaurant = async (restaurantId) => {
  const { data } = await axiosAdmin.get(`/menu-items/restaurant/${restaurantId}`);
  return normalizeResponse(data, 'menuItems');
};

export const createMenuItemForRestaurant = async (restaurantId, payload) => {
  const finalPayload = payload instanceof FormData ? payload : { ...payload, restaurant: restaurantId };
  if (finalPayload instanceof FormData) {
    finalPayload.append('restaurant', restaurantId);
  }
  const { data } = await axiosAdmin.post('/menu-items', finalPayload, formDataConfig(finalPayload));
  return data;
};

export const updateMenuItem = async (id, payload) => {
  const { data } = await axiosAdmin.put(`/menu-items/${id}`, payload, formDataConfig(payload));
  return data;
};

export const deleteMenuItem = async (id) => {
  const { data } = await axiosAdmin.delete(`/menu-items/${id}`);
  return data;
};

export const getOrders = async () => {
  const { data } = await axiosAdmin.get('/orders');
  return normalizeResponse(data, 'orders');
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await axiosAdmin.put(`/orders/${id}/status`, { status });
  return data;
};

export const getReviewsForRestaurant = async (restaurantId) => {
  const { data } = await axiosAdmin.get(`/restaurants/${restaurantId}/reviews`);
  return normalizeResponse(data, 'reviews');
};

export const getReservationsForRestaurant = async (restaurantId) => {
  const { data } = await axiosAdmin.get(`/restaurants/${restaurantId}/reservations`);
  return normalizeResponse(data, 'reservations');
};
