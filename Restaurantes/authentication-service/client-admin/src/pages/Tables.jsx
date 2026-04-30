import { useEffect, useMemo, useState } from 'react';
import {
  createTableForRestaurant,
  deleteTableForRestaurant,
  getRestaurants,
  getTablesForRestaurant,
  updateTableForRestaurant,
} from '../services/adminApi.js';
import { Spinner } from '../features/auth/components/Spinner.jsx';
import { showError, showSuccess } from '../shared/utils/toast.js';

export const Tables = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ number: '', capacity: '' });
  const [activeTable, setActiveTable] = useState(null);

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
        setTables([]);
      }
    } catch (error) {
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (restaurantId) => {
    if (!restaurantId) {
      setTables([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getTablesForRestaurant(restaurantId);
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      showError('No se pudieron cargar las mesas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurantId) {
      loadTables(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const filteredTables = useMemo(
    () => [...tables].sort((a, b) => a.number - b.number),
    [tables],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedRestaurantId) return;

    try {
      const payload = {
        number: Number(form.number),
        capacity: Number(form.capacity),
      };

      if (activeTable) {
        await updateTableForRestaurant(selectedRestaurantId, activeTable._id, payload);
        showSuccess('Mesa actualizada');
      } else {
        await createTableForRestaurant(selectedRestaurantId, payload);
        showSuccess('Mesa creada');
      }

      setActiveTable(null);
      setForm({ number: '', capacity: '' });
      loadTables(selectedRestaurantId);
    } catch (error) {
      showError('No se pudo guardar la mesa');
    }
  };

  const handleEdit = (table) => {
    setActiveTable(table);
    setForm({ number: table.number, capacity: table.capacity });
  };

  const handleDelete = async (table) => {
    const confirmed = window.confirm('¿Eliminar esta mesa?');
    if (!confirmed) return;

    try {
      await deleteTableForRestaurant(selectedRestaurantId, table._id);
      showSuccess('Mesa eliminada');
      loadTables(selectedRestaurantId);
    } catch (error) {
      showError('No se pudo eliminar la mesa');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:justify-between md:items-end'>
        <div>
          <p className='text-sm text-gray-500'>Operación de mesas</p>
          <h1 className='text-3xl font-bold text-main-blue'>Mesas</h1>
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

      <form onSubmit={handleSubmit} className='grid gap-4 sm:grid-cols-3'>
        <input
          type='number'
          placeholder='Número de mesa'
          value={form.number}
          onChange={(event) => setForm({ ...form, number: event.target.value })}
          className='rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
        />
        <input
          type='number'
          placeholder='Capacidad'
          value={form.capacity}
          onChange={(event) => setForm({ ...form, capacity: event.target.value })}
          className='rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-main-blue focus:outline-none'
        />
        <button className='rounded-3xl bg-main-blue px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90'>
          {activeTable ? 'Actualizar mesa' : 'Agregar mesa'}
        </button>
      </form>

      <div className='overflow-x-auto rounded-3xl border border-gray-200 bg-white shadow-sm'>
        <table className='min-w-full border-collapse text-left'>
          <thead className='bg-slate-50 text-sm text-slate-600'>
            <tr>
              <th className='px-5 py-4'>#</th>
              <th className='px-5 py-4'>Capacidad</th>
              <th className='px-5 py-4'>Estado</th>
              <th className='px-5 py-4'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTables.map((table) => (
              <tr key={table._id} className='border-t border-gray-100 hover:bg-slate-50'>
                <td className='px-5 py-4'>{table.number}</td>
                <td className='px-5 py-4'>{table.capacity}</td>
                <td className='px-5 py-4'>
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${table.status === 'disponible' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {table.status || 'desconocido'}
                  </span>
                </td>
                <td className='px-5 py-4'>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={() => handleEdit(table)}
                      className='rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200'
                    >
                      Editar
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(table)}
                      className='rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700'
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTables.length === 0 && (
              <tr>
                <td colSpan='4' className='px-5 py-8 text-center text-sm text-gray-500'>
                  No hay mesas registradas para este restaurante.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
