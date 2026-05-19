import { useMemo, useState } from 'react';
import { ClientButton } from '../../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../../shared/components/ui/ClientInput.jsx';
import { ClientModal } from '../../shared/components/ui/ClientModal.jsx';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: '2',
  notes: '',
};

export const ClientReservationsPage = () => {
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(
    () => form.name && form.email && form.phone && form.date && form.time,
    [form],
  );

  const onSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <div className='grid gap-8 lg:grid-cols-[1.1fr_0.9fr]'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Reservas</p>
        <h1 className='mt-1 text-3xl font-black text-gray-900'>Reserva tu mesa</h1>
        <p className='mt-2 text-gray-700'>
          Formulario responsive con la misma base visual del login. La integración final con la API
          se puede conectar después sin tocar el layout.
        </p>

        <form onSubmit={onSubmit} className='mt-8 grid gap-5 sm:grid-cols-2'>
          <ClientInput label='Nombre completo' value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <ClientInput label='Correo electrónico' type='email' value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <ClientInput label='Teléfono' value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <ClientInput label='Invitados' type='number' min='1' max='20' value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} />
          <ClientInput label='Fecha' type='date' value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          <ClientInput label='Hora' type='time' value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
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
            <ClientButton type='submit' disabled={!canSubmit} className='w-full disabled:cursor-not-allowed disabled:opacity-60'>
              Enviar solicitud
            </ClientButton>
          </div>
        </form>
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
            {form.date || 'Fecha'} · {form.time || 'Hora'} · {form.guests || '2'} invitados
          </p>
        </article>
      </section>

      <ClientModal
        open={submitted}
        title='Solicitud enviada'
        onClose={() => {
          setSubmitted(false);
          setForm(emptyForm);
        }}
      >
        <p className='text-gray-700'>Tu formulario quedó listo. El equipo puede conectar aquí la creación real de reservas.</p>
        <div className='mt-6 flex justify-end'>
          <ClientButton onClick={() => setSubmitted(false)}>Entendido</ClientButton>
        </div>
      </ClientModal>
    </div>
  );
};