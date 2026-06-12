// client-user/src/features/reservations/hooks/useReservations.js
import { useState, useEffect, useCallback } from 'react';
import reservationClient from '../../../api/reservationClient.js';
import restaurantClient from '../../../api/restaurantClient.js';

export default function useReservations(restaurantId) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = restaurantId
        ? await restaurantClient.get(`/${restaurantId}/reservations`)
        : await reservationClient.get('/me');
      const payload = response.data.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
      setReservations(items.map((item) => ({
        id: item.id || item._id,
        restaurant: item.restaurant,
        reservationDate: item.reservationDate || item.date,
        time: item.time,
        people: item.cantidadPersonas || item.people,
        status: item.status,
        raw: item
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const createReservation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reservationClient.post('/', payload);
      const data = response.data.data || response.data;
      await loadReservations();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReservations]);

  const cancelReservation = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reservationClient.put(`/${id}/cancel`);
      const data = response.data.data || response.data;
      await loadReservations();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadReservations]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  return {
    reservations,
    loading,
    error,
    refresh: loadReservations,
    createReservation,
    cancelReservation
  };
}
