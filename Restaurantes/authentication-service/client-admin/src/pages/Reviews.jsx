import { useEffect, useState } from 'react';
import { getRestaurants, getReviewsForRestaurant } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError } from '../shared/utils/toast.js';

export const Reviews = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
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

      <div className='grid gap-5'>
        {reviews.length === 0 ? (
          <div className='rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm'>
            No hay reseñas registradas.
          </div>
        ) : (
          reviews.map((review) => (
            <article key={review._id} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
              <div className='flex items-center justify-between gap-4'>
                <div>
                  <h2 className='text-xl font-semibold text-slate-900'>Calificación: {review.rating ?? 'N/A'}</h2>
                  <p className='mt-2 text-sm text-gray-500'>ID reseña: {review._id.slice(-6)}</p>
                </div>
              </div>
              <p className='mt-4 text-sm text-slate-600'>{review.comment || 'Sin comentario'}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
