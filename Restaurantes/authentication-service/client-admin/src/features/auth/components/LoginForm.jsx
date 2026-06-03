import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const [verificationUrl, setVerificationUrl] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setVerificationUrl('');
    const res = await login(data);

    if (res.success) {
      const role = res.role || user?.role || 'CLIENTE';
      const isAdmin = role?.toUpperCase()?.includes('ADMIN');
      navigate(isAdmin ? '/dashboard' : '/cliente');
      toast.success(`Bienvenido ${isAdmin ? 'administrador' : 'cliente'}!`, { duration: 3000 });
      return;
    }

    if (res.verificationUrl) {
      setVerificationUrl(res.verificationUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='email' className='mb-1.5 block text-sm font-medium text-gray-900'>
          Email
        </label>
        <input
          type='email'
          id='email'
          placeholder='correo@example.com'
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-main-blue focus:outline-none focus:ring-2 focus:ring-main-blue'
          {...register('email', {
            required: 'Este campo es obligatorio',
          })}
        />
        {errors.email && <p className='mt-1 text-xs text-red-600'>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor='password' className='mb-1.5 block text-sm font-medium text-gray-900'>
          Contrasena
        </label>
        <input
          type='password'
          id='password'
          placeholder='* * * * * * *'
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-main-blue focus:outline-none focus:ring-2 focus:ring-main-blue'
          {...register('password', {
            required: 'Este campo es obligatorio',
          })}
        />
        {errors.password && <p className='mt-1 text-xs text-red-600'>{errors.password.message}</p>}
      </div>

      {error && <p className='text-center text-sm text-red-600'>{error}</p>}

      {verificationUrl && (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900'>
          <p className='font-semibold'>Tu cuenta todavia no esta verificada.</p>
          <a
            href={verificationUrl}
            className='mt-2 inline-flex items-center justify-center rounded-full bg-main-blue px-4 py-2 text-sm font-semibold text-white hover:opacity-90'
          >
            Verificar mi cuenta
          </a>
        </div>
      )}

      <button
        type='submit'
        disabled={loading}
        className='w-full rounded-lg bg-main-blue px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70'
      >
        {loading ? 'Iniciando...' : 'Iniciar sesion'}
      </button>

      <p className='text-center text-sm'>
        <button
          type='button'
          onClick={onForgot}
          className='text-main-blue hover:cursor-pointer hover:underline'
        >
          Olvidaste tu contrasena?
        </button>
      </p>
      <p className='text-center text-sm'>
        No tienes cuenta?{' '}
        <button
          type='button'
          onClick={onRegister}
          className='text-main-blue hover:cursor-pointer hover:underline'
        >
          Registrate
        </button>
      </p>
    </form>
  );
};
