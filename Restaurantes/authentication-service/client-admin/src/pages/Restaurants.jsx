import { useEffect, useMemo, useState } from 'react';
import { createRestaurant, deleteRestaurant, getRestaurants, updateRestaurant } from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';
import { resolveCloudinaryImageUrl } from '../shared/utils/formatters.js';

const emptyRestaurant = {
  name: '',
  address: '',
  phone: '',
  email: '',
  city: '',
  manager: '',
  capacity: '',
  openingHours: '',
  image: null,
};

export const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [form, setForm] = useState(emptyRestaurant);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(Array.isArray(data) ? data : data?.restaurants ?? []);
    } catch (error) {
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.city?.toLowerCase().includes(search.toLowerCase()) ||
        restaurant.address?.toLowerCase().includes(search.toLowerCase()),
      ),
    [restaurants, search],
  );

  const handleOpenModal = (restaurant = null) => {
    setActiveRestaurant(restaurant);
    setForm(
      restaurant
        ? {
            ...restaurant,
            capacity: restaurant.capacity ?? '',
            openingHours: restaurant.openingHours ?? '',
            image: restaurant.image || null,
          }
        : emptyRestaurant,
    );
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payloadData = {
        name: form.name,
        address: form.address,
        phone: form.phone,
        email: form.email,
        city: form.city,
        manager: form.manager,
        capacity: Number(form.capacity) || 0,
        openingHours: form.openingHours,
      };

      let payload = payloadData;
      if (form.image instanceof File) {
        payload = new FormData();
        Object.entries(payloadData).forEach(([key, value]) => payload.append(key, value));
        payload.append('image', form.image);
      }

      if (activeRestaurant) {
        await updateRestaurant(activeRestaurant._id, payload);
        showSuccess('Restaurante actualizado');
      } else {
        await createRestaurant(payload);
        showSuccess('Restaurante creado');
      }
      setModalOpen(false);
      loadRestaurants();
    } catch (error) {
      showError('No se pudo guardar el restaurante');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Eliminar este restaurante?');
    if (!confirmed) return;
    try {
      await deleteRestaurant(id);
      showSuccess('Restaurante eliminado');
      loadRestaurants();
    } catch (error) {
      showError('No se pudo eliminar el restaurante');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
        <div>
          <p className='text-sm text-gray-500'>Gestión operativa</p>
          <h1 className='text-3xl font-bold text-main-blue'>Restaurantes</h1>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className='rounded-full bg-main-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
        >
          + Nuevo restaurante
        </button>
      </div>

      <div className='flex flex-col gap-4 md:flex-row md:items-center'>
        <input
          type='search'
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder='Buscar restaurante, ciudad o dirección'
          className='w-full max-w-lg rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-main-blue focus:outline-none'
        />
      </div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {filteredRestaurants.map((restaurant) => (
          <article key={restaurant._id} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
            {restaurant.image && (
              <img
                src={resolveCloudinaryImageUrl(restaurant.image)}
                alt={restaurant.name}
                className='mb-4 h-48 w-full rounded-3xl object-cover'
              />
            )}
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900'>{restaurant.name}</h2>
                <p className='mt-2 text-sm text-gray-500'>{restaurant.city || 'N/A'}</p>
              </div>
            </div>
            <p className='mt-4 text-sm text-slate-600'>{restaurant.address || 'Sin dirección'}</p>
            <div className='mt-2 text-sm text-slate-600'>
              <p><strong>Teléfono:</strong> {restaurant.phone || 'N/A'}</p>
              <p><strong>Capacidad:</strong> {restaurant.capacity ?? 'N/A'} personas</p>
              {restaurant.openingHours && <p><strong>Horario:</strong> {restaurant.openingHours}</p>}
            </div>
            <div className='mt-5 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => handleOpenModal(restaurant)}
                className='rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200'
              >
                Editar
              </button>
              <button
                type='button'
                onClick={() => handleDelete(restaurant._id)}
                className='rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700'
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {filteredRestaurants.length === 0 && (
          <div className='rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm col-span-full'>
            No se encontró ningún restaurante.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Formulario</p>
                <h2 className='text-2xl font-semibold text-slate-900'>
                  {activeRestaurant ? 'Editar restaurante' : 'Nueva ubicación'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className='rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={handleSubmit} className='mt-6 grid gap-4 sm:grid-cols-2'>
              {[
                { key: 'name', label: 'Nombre', type: 'text' },
                { key: 'city', label: 'Ciudad', type: 'text' },
                { key: 'address', label: 'Dirección', type: 'text' },
                { key: 'manager', label: 'Encargado', type: 'text' },
                { key: 'phone', label: 'Teléfono', type: 'text' },
                { key: 'email', label: 'Correo electrónico', type: 'email' },
                { key: 'capacity', label: 'Capacidad', type: 'number' },
                { key: 'openingHours', label: 'Horario de atención', type: 'text' },
              ].map(({ key, label, type }) => (
                <label key={key} className='block'>
                  <span className='text-sm font-medium text-slate-700'>{label}</span>
                  <input
                    type={type}
                    value={form[key] ?? ''}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                  />
                </label>
              ))}
              <label className='block sm:col-span-2'>
                <span className='text-sm font-medium text-slate-700'>Imagen del restaurante</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setForm({ ...form, image: event.target.files?.[0] ?? null })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
                {form.image && (
                  <p className='mt-2 text-xs text-slate-500'>
                    {typeof form.image === 'string' ? 'Imagen actual guardada' : form.image.name}
                  </p>
                )}
              </label>
              <div className='sm:col-span-2 flex justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => setModalOpen(false)}
                  className='rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100'
                >
                  Cancelar
                </button>
                <button type='submit' className='rounded-full bg-main-blue px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90'>
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
