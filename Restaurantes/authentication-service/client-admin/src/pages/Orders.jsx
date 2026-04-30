import { useEffect, useMemo, useState } from 'react';
import { getOrders, getRestaurants, updateOrderStatus } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';

const formatDate = (value) => new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
const statusOptions = ['pendiente', 'preparacion', 'entregado'];

export const Orders = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      const items = Array.isArray(data) ? data : [];
      setRestaurants(items);
      if (items[0]?._id) {
        setSelectedRestaurantId(items[0]._id);
      }
      if (items.length === 0) {
        setOrders([]);
      }
    } catch (error) {
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showError('No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase();

    return orders.filter((order) => {
      const restaurantId = order.table?.restaurant?._id ?? order.table?.restaurant;
      const matchesRestaurant = !selectedRestaurantId || String(restaurantId) === selectedRestaurantId;
      const matchesSearch =
        order._id?.toLowerCase().includes(query) ||
        order.table?.number?.toString().includes(query) ||
        order.items?.some((item) => item.menuItem?.name?.toLowerCase().includes(query));

      return matchesRestaurant && matchesSearch;
    });
  }, [orders, selectedRestaurantId, search]);

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order._id === updated._id ? updated : order)));
      showSuccess('Estado de la orden actualizado');
    } catch (error) {
      showError('No se pudo actualizar el estado de la orden');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
        <div>
          <p className='text-sm text-gray-500'>Órdenes del restaurante</p>
          <h1 className='text-3xl font-bold text-main-blue'>Órdenes</h1>
        </div>
        <select
          value={selectedRestaurantId}
          onChange={(event) => setSelectedRestaurantId(event.target.value)}
          className='rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-main-blue focus:outline-none'
        >
          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </div>

      <div className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm text-gray-500'>Órdenes registradas</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{filteredOrders.length}</p>
          </div>
          <input
            type='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar orden, mesa o platillo'
            className='w-full max-w-xs rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
          />
        </div>

        <div className='mt-6 overflow-x-auto'>
          <table className='min-w-full border-collapse text-left'>
            <thead className='bg-slate-50 text-sm text-slate-600'>
              <tr>
                <th className='px-5 py-4'>Orden</th>
                <th className='px-5 py-4'>Mesa</th>
                <th className='px-5 py-4'>Total</th>
                <th className='px-5 py-4'>Fecha</th>
                <th className='px-5 py-4'>Estado</th>
                <th className='px-5 py-4'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className='border-t border-gray-100 hover:bg-slate-50'>
                  <td className='px-5 py-4'>{order._id.slice(-6)}</td>
                  <td className='px-5 py-4'>{order.table?.number ?? 'N/A'}</td>
                  <td className='px-5 py-4'>Q {order.total?.toFixed(2) ?? '0.00'}</td>
                  <td className='px-5 py-4'>{formatDate(order.createdAt)}</td>
                  <td className='px-5 py-4'>
                    <span className='rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
                      {order.status}
                    </span>
                  </td>
                  <td className='px-5 py-4'>
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className='rounded-3xl border border-gray-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-5 py-8 text-center text-sm text-gray-500'>
                    No hay órdenes registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className='grid gap-5 md:grid-cols-2'>
        {filteredOrders.map((order) => (
          <article key={`details-${order._id}`} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Orden</p>
                <h2 className='text-xl font-semibold text-slate-900'>#{order._id.slice(-6)}</h2>
              </div>
              <span className='text-sm text-slate-600'>Mesa {order.table?.number ?? 'N/A'}</span>
            </div>
            <div className='mt-4 space-y-2 text-sm text-slate-700'>
              {order.items?.map((item, index) => (
                <div key={`${order._id}-${index}`} className='rounded-2xl bg-slate-50 p-3'>
                  <p className='font-medium'>{item.menuItem?.name ?? 'Item'}</p>
                  <p>Cantidad: {item.quantity}</p>
                  <p>Precio unitario: Q {item.price?.toFixed(2) ?? '0.00'}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
