// client-user/src/features/menu/hooks/useMenu.js
import { useState, useEffect, useCallback } from 'react';
import menuClient from '../../../api/menuClient.js';

export default function useMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await menuClient.get('/');
      const payload = response.data.menuItems || response.data.data || response.data;
      const items = Array.isArray(payload) ? payload : [];
      setMenuItems(items.map((item) => ({
        id: item.id || item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        restaurantId:
          item.restaurant?.id ||
          item.restaurant?._id ||
          item.restaurantId ||
          item.restaurant ||
          null
      })));
    } catch (err) {
      setError(err.response?.data?.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  return {
    menuItems,
    loading,
    error,
    refresh: loadMenu
  };
}
 