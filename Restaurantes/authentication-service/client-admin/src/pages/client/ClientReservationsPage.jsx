import { useEffect, useMemo, useState } from 'react';
import { ClientButton } from '../../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../../shared/components/ui/ClientModal.jsx';
import { createReservation, getRestaurants, getTablesForRestaurant } from '../../services/adminApi.js';
import { showError, showSuccess } from '../../shared/utils/toast.js';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  restaurant: '',
  date: '',
  time: '',
  guests: '2',
  notes: '',
};

export const ClientReservationsPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [restaurants, setRestaurants] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignedTable, setAssignedTable] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const reservationDate = useMemo(() => {
    if (!form.date || !form.time) return null;
    const dateTime = new Date(`${form.date}T${form.time}`);
    return Number.isNaN(dateTime.getTime()) ? null : dateTime;
  }, [form.date, form.time]);

  const isReservationDateValid = useMemo(() => {
    return reservationDate !== null && reservationDate > new Date();
  }, [reservationDate]);

  const canSubmit = useMemo(
    () =>
      form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.restaurant &&
      form.date &&
      form.time &&
      form.guests &&
      isReservationDateValid,
    [form, isReservationDateValid],
  );

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const items = await getRestaurants();
      setRestaurants(Array.isArray(items) ? items : []);
      if (Array.isArray(items) && items.length > 0) {
        setForm((prev) => ({ ...prev, restaurant: items[0]._id }));
      }
    } catch (error) {
      showError('No se pudieron cargar los restaurantes');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTables = async (restaurantId, guests) => {
    if (!restaurantId) {
      setAvailableTables([]);
      return;
    }

    try {
      setLoading(true);
      const tables = await getTablesForRestaurant(restaurantId);
      const available = Array.isArray(tables) ? tables : [];
      const filtered = available
        .filter((table) => table.status === 'disponible' && table.capacity >= Number(guests))
        .sort((a, b) => a.capacity - b.capacity || a.number - b.number);
      setAvailableTables(filtered);
    } catch (error) {
      showError('No se pudieron cargar las mesas disponibles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (form.restaurant) {
      loadAvailableTables(form.restaurant, form.guests);
    }
  }, [form.restaurant, form.guests]);

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!form.email.trim()) errors.email = 'El correo electrónico es obligatorio.';
    if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!form.restaurant) errors.restaurant = 'Selecciona un restaurante.';
    if (!form.date) errors.date = 'Selecciona una fecha.';
    if (!form.time) errors.time = 'Selecciona una hora.';
    if (form.date && form.time && reservationDate === null) {
      errors.date = 'Fecha u hora inválida.';
    }
    if (form.date && form.time && reservationDate !== null && reservationDate <= new Date()) {
      errors.date = 'La fecha y hora deben ser futuras.';
    }
    if (!form.guests || Number(form.guests) < 1) {
      errors.guests = 'El número de invitados debe ser al menos 1.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      showError('Revisa los campos del formulario antes de enviar.');
      return;
    }

    if (!availableTables.length) {
      showError('No hay mesas disponibles para el restaurante y el número de personas seleccionado.');
      return;
    }

    const table = availableTables[0];
    const payload = {
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      reservationDate: `${form.date}T${form.time}`,
      numberOfGuests: Number(form.guests),
      restaurant: form.restaurant,
      table: table._id,
      notes: form.notes,
    };

    try {
      setLoading(true);
      await createReservation(form.restaurant, payload);
      setAssignedTable(table.number);
      setSubmitted(true);
      showSuccess('Reservación creada correctamente');
      setForm({ ...emptyForm, restaurant: form.restaurant });
      setFormErrors({});
      loadAvailableTables(form.restaurant, form.guests);
    } catch (error) {
      const apiMessage = error?.response?.data?.message || error?.message || 'No se pudo crear la reservación';
      showError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Reservas</p>
        <h1 className='mt-1 text-3xl font-black text-gray-900'>Reserva tu mesa</h1>
        <p className='mt-2 text-gray-700'>
          Selecciona fecha, hora, restaurante y número de personas. La reserva se envía directamente al backend.
        </p>

        <form onSubmit={onSubmit} className='mt-8 grid gap-5 sm:grid-cols-2'>
          <div>
            <ClientInput label='Nombre completo' value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            {formErrors.name && <p className='mt-2 text-sm text-rose-600'>{formErrors.name}</p>}
          </div>
          <div>
            <ClientInput label='Correo electrónico' type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            {formErrors.email && <p className='mt-2 text-sm text-rose-600'>{formErrors.email}</p>}
          </div>
          <div>
            <ClientInput label='Teléfono' value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            {formErrors.phone && <p className='mt-2 text-sm text-rose-600'>{formErrors.phone}</p>}
          </div>

          <label className='block space-y-1.5'>
            <span className='text-sm font-medium text-gray-900'>Restaurante</span>
            <select
              value={form.restaurant}
              onChange={(event) => setForm({ ...form, restaurant: event.target.value })}
              className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
            >
              <option value=''>Selecciona restaurante</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant._id} value={restaurant._id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            {formErrors.restaurant && <p className='mt-2 text-sm text-rose-600'>{formErrors.restaurant}</p>}
          </label>

          <div>
            <ClientInput label='Fecha' type='date' value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
            {formErrors.date && <p className='mt-2 text-sm text-rose-600'>{formErrors.date}</p>}
          </div>
          <div>
            <ClientInput label='Hora' type='time' value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
            {formErrors.time && <p className='mt-2 text-sm text-rose-600'>{formErrors.time}</p>}
          </div>
          <div>
            <ClientInput label='Invitados' type='number' min='1' max='20' value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} />
            {formErrors.guests && <p className='mt-2 text-sm text-rose-600'>{formErrors.guests}</p>}
          </div>

          <label className='block space-y-1.5 sm:col-span-2'>
            <span className='text-sm font-medium text-gray-900'>Notas</span>
            <textarea
              rows='4'
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className='w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-main-blue focus:ring-2 focus:ring-main-blue/20'
              placeholder='Preferencia de mesa, celebraciones, alergias o solicitudes especiales'
            />
          </label>

          <div className='sm:col-span-2'>
            <ClientButton type='submit' disabled={!canSubmit || loading} className='w-full disabled:cursor-not-allowed disabled:opacity-60'>
              {loading ? 'Enviando...' : 'Reservar ahora'}
            </ClientButton>
          </div>
        </form>

        {restaurants.length > 0 && !availableTables.length && form.restaurant && (
          <div className='mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>
            No hay mesas disponibles para {form.guests} personas en el restaurante seleccionado.
          </div>
        )}
      </section>

      <section className='space-y-5 rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <div>
          <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Vista previa</p>
          <h2 className='mt-1 text-2xl font-bold text-gray-900'>Confirmación visual</h2>
        </div>
        <article className='rounded-3xl bg-[linear-gradient(135deg,rgba(216,48,48,0.95),rgba(222,153,78,0.92))] p-6 text-white shadow-lg'>
          <p className='text-sm uppercase tracking-[0.25em] text-white/80'>Reserva estimada</p>
          <h3 className='mt-2 text-2xl font-bold'>{form.name || 'Tu nombre aquí'}</h3>
          <p className='mt-4 text-white/90'>{form.email || 'correo@ejemplo.com'}</p>
          <p className='mt-1 text-white/90'>{form.phone || 'Teléfono'}</p>
          <p className='mt-4 text-sm text-white/85'>
            {form.restaurant
              ? restaurants.find((restaurant) => restaurant._id === form.restaurant)?.name
              : 'Selecciona restaurante'}
          </p>
          <p className='mt-2 text-sm text-white/85'>
            {form.date || 'Fecha'} · {form.time || 'Hora'} · {form.guests || '2'} invitados
          </p>
          {availableTables.length > 0 && (
            <p className='mt-2 text-sm text-white/85'>Mesa sugerida: {availableTables[0].number}</p>
          )}
        </article>
      </section>

      <ClientModal
        open={submitted}
        title='Reservación creada'
        onClose={() => setSubmitted(false)}
      >
        <p className='text-gray-700'>Tu reservación quedó registrada correctamente.</p>
        {assignedTable && (
          <p className='mt-3 text-gray-700'>Mesa asignada: {assignedTable}</p>
        )}
        <div className='mt-6 flex justify-end'>
          <ClientButton onClick={() => setSubmitted(false)}>Entendido</ClientButton>
        </div>
      </ClientModal>
    </div>
  );
};
