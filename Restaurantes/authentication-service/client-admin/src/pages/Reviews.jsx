import { useEffect, useMemo, useState } from 'react';
import { getRestaurants, getReviewsForRestaurant } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError } from '../shared/utils/toast.js';

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
};

export const Reviews = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [reviews, setReviews] = useState([]);
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
        setReviews([]);
      }
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (restaurantId) => {
    if (!restaurantId) {
      setReviews([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getReviewsForRestaurant(restaurantId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadReviews(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const query = search.toLowerCase();
        return (
          review.comment?.toLowerCase().includes(query) ||
          review.customerName?.toLowerCase().includes(query) ||
          review.customerEmail?.toLowerCase().includes(query)
        );
      }),
    [reviews, search],
  );

  const averageRating = useMemo(() => {
    if (!reviews.length) return '0.0';
    const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-sm text-gray-500'>Reseñas por restaurante</p>
          <h1 className='text-3xl font-bold text-main-blue'>Reseñas</h1>
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

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Total reseñas</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{reviews.length}</p>
        </article>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Promedio</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{averageRating}/5</p>
        </article>
        <input
          type='search'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Buscar cliente o comentario'
          className='rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-main-blue focus:outline-none'
        />
      </div>

      <div className='grid gap-5'>
        {filteredReviews.length === 0 ? (
          <div className='rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm'>
            No hay reseñas registradas.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <article key={review._id} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                <div>
                  <h2 className='text-xl font-semibold text-slate-900'>
                    Calificacion: {review.rating ?? 'N/A'}/5
                  </h2>
                  <p className='mt-2 text-sm text-gray-500'>
                    {review.customerName || 'Cliente'} {review.customerEmail ? `- ${review.customerEmail}` : ''}
                  </p>
                  <p className='mt-1 text-xs text-gray-500'>{formatDate(review.createdAt)}</p>
                </div>
                <span className='rounded-full bg-surface-soft px-3 py-1 text-sm font-semibold text-main-blue'>
                  ID {review._id.slice(-6)}
                </span>
              </div>
              <p className='mt-4 text-sm leading-6 text-slate-600'>{review.comment || 'Sin comentario'}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
