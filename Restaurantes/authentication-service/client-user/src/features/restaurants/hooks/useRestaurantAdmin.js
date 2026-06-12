// client-user/src/features/restaurants/hooks/useRestaurantAdmin.js
import { useState } from 'react';
import restaurantClient from '../../../api/restaurantClient.js';

/**
 * Hook con operaciones CRUD de restaurante para usuarios ADMIN / SUPERADMIN.
 * Todas las mutaciones devuelven { success, data?, error? }.
 */
export default function useRestaurantAdmin() {
  const [loading, setLoading] = useState(false);

  const handleRequest = async (fn) => {
    setLoading(true);
    try {
      const response = await fn();
      return { success: true, data: response.data };
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Error inesperado';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear restaurante.
   * @param {object} fields - { name, address, description?, phone?, email?, city?, manager?, capacity?, openingHours? }
   */
  const createRestaurant = (fields) =>
    handleRequest(() => restaurantClient.post('/', fields));

  /**
   * Actualizar restaurante.
   * @param {string} id
   * @param {object} fields
   */
  const updateRestaurant = (id, fields) =>
    handleRequest(() => restaurantClient.put(`/${id}`, fields));

  /**
   * Deshabilitar (eliminar lógicamente) un restaurante.
   * El backend usa DELETE /:id — adapta según tu lógica real.
   * @param {string} id
   */
  const disableRestaurant = (id) =>
    handleRequest(() => restaurantClient.delete(`/${id}`));

  return { createRestaurant, updateRestaurant, disableRestaurant, loading };
}
