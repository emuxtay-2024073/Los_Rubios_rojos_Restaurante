import { useEffect, useState } from 'react';
import { getRestaurants, getMenuItems, getTablesForRestaurant, getReservationsForRestaurant } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';

const formatDate = (value) => new Date(value).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });

export const Dashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const restaurantsData = await getRestaurants();
        const restaurantsList = Array.isArray(restaurantsData)
          ? restaurantsData
          : restaurantsData?.restaurants || [];
        setRestaurants(restaurantsList);

        const menuItemsData = await getMenuItems();
        const menuItemsList = Array.isArray(menuItemsData)
          ? menuItemsData
          : menuItemsData?.menuItems || [];
        setMenuItems(menuItemsList);

        if (restaurantsList.length > 0) {
          const restaurantId = restaurantsList[0]._id;
          const [tablesData, reservationsData] = await Promise.all([
            getTablesForRestaurant(restaurantId),
            getReservationsForRestaurant(restaurantId),
          ]);
          setTables(Array.isArray(tablesData) ? tablesData : []);
          setReservations(Array.isArray(reservationsData) ? reservationsData : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-end gap-4'>
        <div>
          <p className='text-sm text-gray-500'>Panel de administración</p>
          <h1 className='text-3xl font-bold text-main-blue'>Resumen general</h1>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Restaurantes registrados</p>
          <p className='mt-5 text-4xl font-semibold text-slate-900'>{restaurants.length}</p>
        </article>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Platos y bebidas</p>
          <p className='mt-5 text-4xl font-semibold text-slate-900'>{menuItems.length}</p>
        </article>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Mesas registradas</p>
          <p className='mt-5 text-4xl font-semibold text-slate-900'>{tables.length}</p>
        </article>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Reservaciones recientes</p>
          <p className='mt-5 text-4xl font-semibold text-slate-900'>{reservations.length}</p>
        </article>
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        <section className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <h2 className='text-xl font-semibold text-slate-900'>Restaurantes activos</h2>
            <span className='text-sm text-gray-500'>{restaurants.length} locales</span>
          </div>
          <div className='mt-6 space-y-4'>
            {restaurants.slice(0, 4).map((restaurant) => (
              <article key={restaurant._id} className='rounded-3xl border border-slate-100 p-4'>
                <h3 className='font-semibold text-slate-900'>{restaurant.name}</h3>
                <p className='text-sm text-gray-500'>{restaurant.address}</p>
                <div className='mt-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600'>
                  <span className='rounded-full bg-slate-100 px-3 py-1'>{restaurant.city}</span>
                  <span className='rounded-full bg-slate-100 px-3 py-1'>{restaurant.phone}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between gap-4'>
            <h2 className='text-xl font-semibold text-slate-900'>Últimas reservaciones</h2>
            <span className='text-sm text-gray-500'>Por restaurante</span>
          </div>
          <div className='mt-6 space-y-4'>
            {reservations.slice(0, 4).map((reservation) => (
              <article key={reservation._id} className='rounded-3xl border border-slate-100 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='font-semibold text-slate-900'>{reservation.customerName}</p>
                  <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700'>
                    {reservation.status ?? 'Confirmada'}
                  </span>
                </div>
                <p className='mt-1 text-sm text-gray-500'>{formatDate(reservation.reservationDate)}</p>
                <p className='mt-2 text-sm text-gray-600'>Mesa: {reservation.table?.number ?? reservation.table}</p>
              </article>
            ))}
            {reservations.length === 0 && <p className='text-sm text-gray-500'>No hay reservaciones disponibles.</p>}
          </div>
        </section>
      </div>
    </div>
  );
};
