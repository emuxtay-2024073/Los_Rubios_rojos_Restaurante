import { useState } from 'react';
import { ClientButton } from '../../shared/components/ui/ClientButton.jsx';
import { ClientInput } from '../../shared/components/ui/ClientInput.jsx';

export const ClientOrdersPage = () => {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [requested, setRequested] = useState(false);

  return (
    <div className='grid gap-8 lg:grid-cols-[0.95fr_1.05fr]'>
      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Órdenes</p>
        <h1 className='mt-1 text-3xl font-black text-gray-900'>Consulta tu pedido</h1>
        <p className='mt-2 text-gray-700'>
          Esta pantalla deja el flujo listo para rastreo de órdenes. Puedes conectar la API real
          después sin rediseñar la navegación.
        </p>

        <div className='mt-8 space-y-5'>
          <ClientInput label='Código de orden' value={orderCode} onChange={(event) => setOrderCode(event.target.value)} placeholder='ORD-12345' />
          <ClientInput label='Teléfono' value={phone} onChange={(event) => setPhone(event.target.value)} placeholder='(502) 0000-0000' />
          <ClientButton
            className='w-full'
            onClick={() => setRequested(true)}
            disabled={!orderCode || !phone}
          >
            Consultar estado
          </ClientButton>
        </div>
      </section>

      <section className='rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-xl sm:p-8'>
        <p className='text-sm font-semibold uppercase tracking-[0.25em] text-main-blue'>Seguimiento</p>
        <h2 className='mt-1 text-2xl font-bold text-gray-900'>Diseño base listo</h2>
        <div className='mt-6 space-y-4'>
          {[
            { title: 'Pendiente', description: 'La orden fue registrada y está esperando preparación.' },
            { title: 'En preparación', description: 'El restaurante ya trabaja tu pedido.' },
            { title: 'Entregado', description: 'La orden fue completada correctamente.' },
          ].map((step) => (
            <article key={step.title} className='rounded-3xl border border-gray-200 bg-card p-5'>
              <h3 className='font-bold text-gray-900'>{step.title}</h3>
              <p className='mt-2 text-sm text-gray-700'>{step.description}</p>
            </article>
          ))}
        </div>
        {requested && (
          <div className='mt-6 rounded-3xl border border-main-blue/20 bg-surface-soft p-4 text-sm font-medium text-gray-800'>
            Consulta enviada. Cuando se conecte la API, aquí se mostrará el seguimiento real de la orden.
          </div>
        )}
      </section>
    </div>
  );
};