// client-user/src/features/restaurants/hooks/useRestaurants.js
import { useState, useEffect, useCallback } from 'react';
import restaurantClient from '../../../api/restaurantClient.js';

export default function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await restaurantClient.get('/');
      const payload = response.data.restaurants || response.data.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
      setRestaurants(items.map((item) => ({
        id: item.id || item._id,
        name: item.name,
        description: item.description,
        address: item.address,
        image: item.image
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  return {
    restaurants,
    loading,
    error,
    refresh: loadRestaurants
  };
}
 