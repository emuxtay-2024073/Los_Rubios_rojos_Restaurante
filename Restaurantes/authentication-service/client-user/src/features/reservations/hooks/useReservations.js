// client-user/src/features/reservations/hooks/useReservations.js
import { useState, useEffect, useCallback } from 'react';
import reservationClient from '../../../api/reservationClient.js';
 
export default function useReservations(restaurantId) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
 
  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
 
    try {
      // El backend expone GET /api/reservations (todas) — usamos esa
      // Si hay restaurantId filtramos en cliente porque no hay endpoint /me
      const response = await reservationClient.get('/');
      const payload = response.data?.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
 
      const filtered = restaurantId
        ? items.filter((item) => {
            const rid = item.restaurant?._id || item.restaurant;
            return String(rid) === String(restaurantId);
          })
        : items;
 
      setReservations(filtered.map((item) => ({
        id: item._id || item.id,
        restaurant: item.restaurant,
        reservationDate: item.reservationDate
          ? new Date(item.reservationDate).toLocaleDateString('es-GT')
          : item.date || '—',
        time: item.time || (item.reservationDate
          ? new Date(item.reservationDate).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })
          : '—'),
        people: item.numberOfGuests || item.cantidadPersonas || item.people || '—',
        status: item.status || 'Pendiente',
        raw: item
      })));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al cargar reservaciones';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);
 
  const createReservation = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      // POST /api/reservations → backend ruta directa
      const response = await reservationClient.post('/', payload);
      const data = response.data?.data || response.data;
      await loadReservations();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al crear reservación';
      setError(msg);
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
      const data = response.data?.data || response.data;
      await loadReservations();
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al cancelar';
      setError(msg);
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
 