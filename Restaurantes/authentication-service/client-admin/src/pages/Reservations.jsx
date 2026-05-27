import { useEffect, useMemo, useState } from 'react';
import { getReservationsForRestaurant, getRestaurants } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError } from '../shared/utils/toast.js';

const formatDate = (value) => new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

export const Reservations = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [reservations, setReservations] = useState([]);
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
        setReservations([]);
      }
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async (restaurantId) => {
    if (!restaurantId) {
      setReservations([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getReservationsForRestaurant(restaurantId);
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar las reservaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadReservations(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) =>
        reservation.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        reservation.table?.number?.toString().includes(search) ||
        reservation.customerEmail?.toLowerCase().includes(search.toLowerCase()),
      ),
    [reservations, search],
  );

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
        <div>
          <p className='text-sm text-gray-500'>Reservaciones del restaurante</p>
          <h1 className='text-3xl font-bold text-main-blue'>Reservaciones</h1>
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
            <p className='text-sm text-gray-500'>Total reservaciones</p>
            <p className='mt-2 text-3xl font-semibold text-slate-900'>{reservations.length}</p>
          </div>
          <input
            type='search'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar cliente, mesa o correo'
            className='w-full max-w-xs rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
          />
        </div>

        <div className='mt-6 overflow-x-auto'>
          <table className='min-w-full border-collapse text-left'>
            <thead className='bg-slate-50 text-sm text-slate-600'>
              <tr>
                <th className='px-5 py-4'>Cliente</th>
                <th className='px-5 py-4'>Contacto</th>
                <th className='px-5 py-4'>Mesa</th>
                <th className='px-5 py-4'>Fecha</th>
                <th className='px-5 py-4'>Invitados</th>
                <th className='px-5 py-4'>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation._id} className='border-t border-gray-100 hover:bg-slate-50'>
                  <td className='px-5 py-4'>{reservation.customerName}</td>
                  <td className='px-5 py-4'>
                    <p>{reservation.customerEmail || 'Sin correo'}</p>
                    <p className='text-xs text-gray-500'>{reservation.customerPhone || 'Sin telefono'}</p>
                  </td>
                  <td className='px-5 py-4'>{reservation.table?.number ?? reservation.table}</td>
                  <td className='px-5 py-4'>{formatDate(reservation.reservationDate)}</td>
                  <td className='px-5 py-4'>{reservation.numberOfGuests ?? '—'}</td>
                  <td className='px-5 py-4'>
                    <span className='rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700'>
                      {reservation.status ?? 'Confirmada'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan='6' className='px-5 py-8 text-center text-sm text-gray-500'>
                    No hay reservaciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
