// client-user/src/features/orders/hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import orderClient from '../../../api/orderClient.js';

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderClient.get('/me');
      const payload = response.data.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
      setOrders(items.map((item) => ({
        id: item.id || item._id,
        total: item.total,
        status: item.status,
        createdAt: item.createdAt,
        items: item.items || [],
        raw: item
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await orderClient.post('/', payload);
      const data = response.data.data || response.data;
      await loadOrders();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    loading,
    error,
    refresh: loadOrders,
    createOrder
  };
}
