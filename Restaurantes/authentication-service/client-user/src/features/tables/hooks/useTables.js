import { useState, useEffect, useCallback } from 'react';
import tableClient from '../../../api/tableClient.js';

export default function useTables(restaurantId) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await tableClient.get('/', {
        params: restaurantId ? { restaurant: restaurantId } : {}
      });
      const payload = response.data.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
      setTables(items.map((item) => ({
        id: item.id || item._id,
        number: item.number,
        capacity: item.capacity,
        status: item.status,
        restaurant: item.restaurant,
        raw: item
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  const createTable = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tableClient.post('/', payload);
      const data = response.data.data || response.data;
      await loadTables();
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la mesa');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadTables]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return {
    tables,
    loading,
    error,
    refresh: loadTables,
    createTable
  };
}
