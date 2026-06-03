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
  openingTime: '',
  closingTime: '',
  image: null,
};

const parseHours = (openingHours = '') => {
  const [openingTime = '', closingTime = ''] = openingHours.split('-').map((value) => value.trim());
  return { openingTime, closingTime };
};

const isImageFileValid = (file) => !file || (file.type?.startsWith('image/') && file.size <= 5 * 1024 * 1024);

export const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  const [form, setForm] = useState(emptyRestaurant);
  const [errors, setErrors] = useState({});

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      setRestaurants(Array.isArray(data) ? data : data?.restaurants ?? []);
    } catch (error) {
      console.error(error);
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
      restaurants.filter((restaurant) => {
        const query = search.toLowerCase();
        return (
          restaurant.name?.toLowerCase().includes(query) ||
          restaurant.city?.toLowerCase().includes(query) ||
          restaurant.address?.toLowerCase().includes(query)
        );
      }),
    [restaurants, search],
  );

  const validate = () => {
    const nextErrors = {};
    const capacity = Number(form.capacity);

    if (!form.name.trim()) nextErrors.name = 'El nombre es obligatorio.';
    if (!form.address.trim()) nextErrors.address = 'La direccion es obligatoria.';
    if (!form.city.trim()) nextErrors.city = 'La ciudad es obligatoria.';
    if (!form.phone.trim()) nextErrors.phone = 'El telefono es obligatorio.';
    if (!form.email.trim()) nextErrors.email = 'El correo es obligatorio.';
    if (!form.manager.trim()) nextErrors.manager = 'El encargado es obligatorio.';
    if (!form.capacity || Number.isNaN(capacity) || capacity < 1) nextErrors.capacity = 'Capacidad minima: 1.';
    if (!form.openingTime) nextErrors.openingTime = 'La hora de apertura es obligatoria.';
    if (!form.closingTime) nextErrors.closingTime = 'La hora de cierre es obligatoria.';
    if (form.openingTime && form.closingTime && form.openingTime >= form.closingTime) {
      nextErrors.closingTime = 'La hora de cierre debe ser posterior a la apertura.';
    }
    if (!activeRestaurant && !form.image) nextErrors.image = 'La imagen es obligatoria.';
    if (form.image instanceof File && !isImageFileValid(form.image)) {
      nextErrors.image = 'La imagen debe ser valida y pesar maximo 5 MB.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleOpenModal = (restaurant = null) => {
    const hours = parseHours(restaurant?.openingHours);
    setActiveRestaurant(restaurant);
    setErrors({});
    setForm(
      restaurant
        ? {
            name: restaurant.name || '',
            address: restaurant.address || '',
            phone: restaurant.phone || '',
            email: restaurant.email || '',
            city: restaurant.city || '',
            manager: restaurant.manager || '',
            capacity: restaurant.capacity ?? '',
            openingTime: hours.openingTime,
            closingTime: hours.closingTime,
            image: restaurant.image || null,
          }
        : emptyRestaurant,
    );
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      showError('Revisa los campos del restaurante');
      return;
    }

    try {
      const payloadData = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: form.city.trim(),
        manager: form.manager.trim(),
        capacity: Number(form.capacity),
        openingHours: `${form.openingTime} - ${form.closingTime}`,
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
      await loadRestaurants();
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || 'No se pudo guardar el restaurante');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Desactivar este restaurante?')) return;
    try {
      await deleteRestaurant(id);
      showSuccess('Restaurante desactivado');
      await loadRestaurants();
    } catch (error) {
      console.error(error);
      showError('No se pudo desactivar el restaurante');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-sm text-gray-500'>Gestion operativa</p>
          <h1 className='text-3xl font-bold text-main-blue'>Restaurantes</h1>
        </div>
        <button
          type='button'
          onClick={() => handleOpenModal(null)}
          className='rounded-full bg-main-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
        >
          + Nuevo restaurante
        </button>
      </div>

      <input
        type='search'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder='Buscar restaurante, ciudad o direccion'
        className='w-full max-w-lg rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-main-blue focus:outline-none'
      />

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {filteredRestaurants.map((restaurant) => (
          <article key={restaurant._id} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
            {restaurant.image && (
              <img
                src={resolveCloudinaryImageUrl(restaurant.image)}
                alt={restaurant.name}
                className='mb-4 h-48 w-full rounded-3xl object-cover'
                onError={(event) => {
                  event.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            )}
            <h2 className='text-xl font-semibold text-slate-900'>{restaurant.name}</h2>
            <p className='mt-2 text-sm text-gray-500'>{restaurant.city || 'N/A'}</p>
            <p className='mt-4 text-sm text-slate-600'>{restaurant.address || 'Sin direccion'}</p>
            <div className='mt-2 text-sm text-slate-600'>
              <p><strong>Telefono:</strong> {restaurant.phone || 'N/A'}</p>
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
                Desactivar
              </button>
            </div>
          </article>
        ))}
      </div>

      {modalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4'>
          <div className='max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Formulario</p>
                <h2 className='text-2xl font-semibold text-slate-900'>
                  {activeRestaurant ? 'Editar restaurante' : 'Nueva ubicacion'}
                </h2>
              </div>
              <button
                type='button'
                onClick={() => setModalOpen(false)}
                className='rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmit} className='mt-6 grid gap-4 sm:grid-cols-2'>
              {[
                ['name', 'Nombre', 'text'],
                ['city', 'Ciudad', 'text'],
                ['address', 'Direccion', 'text'],
                ['manager', 'Encargado', 'text'],
                ['phone', 'Telefono', 'text'],
                ['email', 'Correo electronico', 'email'],
                ['capacity', 'Capacidad', 'number'],
              ].map(([key, label, type]) => (
                <label key={key} className='block'>
                  <span className='text-sm font-medium text-slate-700'>{label}</span>
                  <input
                    type={type}
                    required
                    min={key === 'capacity' ? '1' : undefined}
                    value={form[key] ?? ''}
                    onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                  />
                  {errors[key] && <p className='mt-1 text-xs text-red-600'>{errors[key]}</p>}
                </label>
              ))}

              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Hora de apertura</span>
                <input
                  type='time'
                  required
                  value={form.openingTime}
                  onChange={(event) => setForm({ ...form, openingTime: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
                {errors.openingTime && <p className='mt-1 text-xs text-red-600'>{errors.openingTime}</p>}
              </label>

              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Hora de cierre</span>
                <input
                  type='time'
                  required
                  value={form.closingTime}
                  onChange={(event) => setForm({ ...form, closingTime: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
                {errors.closingTime && <p className='mt-1 text-xs text-red-600'>{errors.closingTime}</p>}
              </label>

              <label className='block sm:col-span-2'>
                <span className='text-sm font-medium text-slate-700'>Imagen del restaurante</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setForm({ ...form, image: event.target.files?.[0] ?? null })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
                {errors.image && <p className='mt-1 text-xs text-red-600'>{errors.image}</p>}
                {form.image && (
                  <div className='mt-3 space-y-2'>
                    <img
                      src={form.image instanceof File ? URL.createObjectURL(form.image) : resolveCloudinaryImageUrl(form.image)}
                      alt='Vista previa del restaurante'
                      className='h-40 w-full rounded-2xl object-cover'
                    />
                    <p className='text-xs text-slate-500'>
                      {typeof form.image === 'string' ? 'Imagen actual guardada' : form.image.name}
                    </p>
                  </div>
                )}
                {formErrors.image && <p className='mt-1 text-xs text-red-600'>{formErrors.image}</p>}
              </label>

              <div className='flex justify-end gap-3 pt-2 sm:col-span-2'>
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
