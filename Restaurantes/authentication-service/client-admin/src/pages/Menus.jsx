import { useEffect, useMemo, useState } from 'react';
import {
  createMenuItemForRestaurant,
  deleteMenuItem,
  getMenuItems,
  getMenuItemsByRestaurant,
  getRestaurants,
  updateMenuItem,
} from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';
import { resolveCloudinaryImageUrl } from '../shared/utils/formatters.js';

const emptyMenu = {
  name: '',
  description: '',
  category: '',
  price: '',
  image: null,
};

export const Menus = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyMenu);
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [menuModalOpen, setMenuModalOpen] = useState(false);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await getRestaurants();
      const items = Array.isArray(data) ? data : [];
      setRestaurants(items);
      if (items[0]?._id) {
        setSelectedRestaurantId(items[0]._id);
      }
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async (restaurantId) => {
    try {
      setLoading(true);
      if (restaurantId) {
        const data = await getMenuItemsByRestaurant(restaurantId);
        setMenuItems(Array.isArray(data) ? data : []);
      } else {
        const data = await getMenuItems();
        setMenuItems(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
      showError('No se pudieron cargar los menús');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadMenuItems(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const categories = useMemo(
    () => ['Todos', ...new Set(menuItems.map((item) => item.category || 'General'))],
    [menuItems],
  );

  const filteredMenu = useMemo(
    () =>
      menuItems.filter((item) =>
        category === 'Todos' || (item.category || 'General') === category,
      ),
    [category, menuItems],
  );

  const openMenuItemForm = (item = null) => {
    setActiveMenuItem(item);
    setForm(
      item
        ? {
            name: item.name || '',
            description: item.description || '',
            category: item.category || '',
            price: item.price ?? '',
            image: item.image || null,
          }
        : emptyMenu,
    );
    setMenuModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRestaurantId) return;

    try {
      const payloadData = {
        ...form,
        price: Number(form.price) || 0,
      };

      let payload = payloadData;
      if (form.image instanceof File) {
        payload = new FormData();
        Object.entries(payloadData).forEach(([key, value]) => {
          if (key !== 'image' || value instanceof File) {
            payload.append(key, value);
          }
        });
      }

      if (activeMenuItem) {
        await updateMenuItem(activeMenuItem._id, payload);
        showSuccess('Menú actualizado');
      } else {
        await createMenuItemForRestaurant(selectedRestaurantId, payload);
        showSuccess('Menú creado');
      }

      setActiveMenuItem(null);
      setForm(emptyMenu);
      setMenuModalOpen(false);
      loadMenuItems(selectedRestaurantId);
    } catch (error) {
      console.error(error);
      showError(error.response?.data?.message || 'No se pudo guardar el elemento de menú');
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm('¿Eliminar este platillo?');
    if (!confirmed) return;

    try {
      await deleteMenuItem(item._id);
      showSuccess('Platillo eliminado');
      loadMenuItems(selectedRestaurantId);
    } catch (error) {
      console.error(error);
      showError('No se pudo eliminar el platillo');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
        <div>
          <p className='text-sm text-gray-500'>Catálogo de platos</p>
          <h1 className='text-3xl font-bold text-main-blue'>Menús</h1>
        </div>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
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
          <button
            type='button'
            onClick={() => openMenuItemForm(null)}
            className='rounded-full bg-main-blue px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90'
          >
            + Nuevo platillo
          </button>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Platos totales</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{menuItems.length}</p>
        </article>
        <article className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
          <p className='text-sm text-gray-500'>Categoría actual</p>
          <p className='mt-2 text-3xl font-semibold text-slate-900'>{category}</p>
        </article>
      </div>

      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='rounded-3xl border border-gray-200 bg-white p-4 text-sm text-slate-700 shadow-sm'>
          <p className='font-semibold'>Filtros disponibles</p>
          <p className='mt-2 text-slate-900'>{categories.length} categorías</p>
        </div>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className='rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-main-blue focus:outline-none'
        >
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {filteredMenu.map((item) => (
          <article key={item._id} className='rounded-3xl border border-gray-200 bg-white p-6 shadow-sm'>
            {item.restaurant?.image && (
              <div className='mb-3 flex items-center gap-2'>
                <img
                  src={resolveCloudinaryImageUrl(item.restaurant.image)}
                  alt={item.restaurant.name}
                  className='h-8 w-8 rounded-full object-cover'
                  onError={(event) => {
                    event.currentTarget.src = '/placeholder-image.svg';
                  }}
                />
                <span className='text-xs font-medium text-slate-600'>{item.restaurant.name}</span>
              </div>
            )}
            {item.image && (
              <img
                src={resolveCloudinaryImageUrl(item.image)}
                alt={item.name}
                className='mb-4 h-40 w-full rounded-3xl object-cover'
                onError={(event) => {
                  event.currentTarget.src = '/placeholder-image.svg';
                }}
              />
            )}
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-semibold text-slate-900'>{item.name}</h2>
                <p className='mt-2 text-sm text-gray-500'>{item.category || 'General'}</p>
              </div>
              <span className='text-lg font-semibold text-slate-900'>Q {Number(item.price).toFixed(2)}</span>
            </div>
            <p className='mt-4 text-sm text-slate-600'>{item.description || 'Sin descripción'}</p>
            <div className='mt-5 flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => openMenuItemForm(item)}
                className='rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200'
              >
                Editar
              </button>
              <button
                type='button'
                onClick={() => handleDelete(item)}
                className='rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700'
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
        {filteredMenu.length === 0 && (
          <div className='rounded-3xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm'>
            No hay elementos de menú registrados.
          </div>
        )}
      </div>

      {menuModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
          <div className='w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Formulario de platillo</p>
                <h2 className='text-2xl font-semibold text-slate-900'>
                  {activeMenuItem ? 'Editar platillo' : 'Nuevo platillo'}
                </h2>
              </div>
              <button
                type='button'
                onClick={() => {
                  setActiveMenuItem(null);
                  setForm(emptyMenu);
                  setMenuModalOpen(false);
                }}
                className='rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100'
              >
                Cerrar
              </button>
            </div>
            <form onSubmit={handleSubmit} className='mt-6 grid gap-4 sm:grid-cols-2'>
              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Nombre</span>
                <input
                  type='text'
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
              </label>
              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Categoría</span>
                <input
                  type='text'
                  value={form.category}
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
              </label>
              <label className='block sm:col-span-2'>
                <span className='text-sm font-medium text-slate-700'>Descripción</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                  rows='4'
                />
              </label>
              <label className='block'>
                <span className='text-sm font-medium text-slate-700'>Precio</span>
                <input
                  type='number'
                  step='0.01'
                  required
                  min='0'
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
              </label>
              <label className='block sm:col-span-2'>
                <span className='text-sm font-medium text-slate-700'>Imagen del platillo</span>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(event) => setForm({ ...form, image: event.target.files?.[0] ?? null })}
                  className='mt-2 w-full rounded-3xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
                />
                {form.image && (
                  <div className='mt-3 space-y-2'>
                    <img
                      src={
                        form.image instanceof File
                          ? URL.createObjectURL(form.image)
                          : resolveCloudinaryImageUrl(form.image)
                      }
                      alt='Vista previa del platillo'
                      className='h-40 w-full rounded-2xl object-cover'
                      onError={(event) => {
                        event.currentTarget.src = '/placeholder-image.svg';
                      }}
                    />
                    <p className='text-xs text-slate-500'>
                      {typeof form.image === 'string' ? 'Imagen actual guardada' : form.image.name}
                    </p>
                  </div>
                )}
              </label>
              <div className='sm:col-span-2 flex justify-end gap-3 pt-2'>
                <button
                  type='button'
                  onClick={() => {
                  setActiveMenuItem(null);
                  setForm(emptyMenu);
                  setMenuModalOpen(false);
                }}
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
