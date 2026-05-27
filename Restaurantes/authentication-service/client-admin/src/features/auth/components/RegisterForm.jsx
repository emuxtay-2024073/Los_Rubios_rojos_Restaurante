import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onLogin }) => {
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: 'CLIENTE' } });

  const password = watch('password', '');
  const selectedRole = watch('role', 'CLIENTE');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      return;
    }

    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: selectedRole === 'ADMIN' ? 'ADMIN' : 'CLIENTE',
      secretKey: data.secretKey || '',
    };

    setVerificationUrl('');

    const res = await registerUser(payload);
    if (res.success) {
      const link = res.data?.verificationUrl || '';
      const message =
        res.data?.message ||
        'Registrado exitosamente. Revisa tu correo para verificar tu cuenta.';

      setSuccessMessage(message);
      setVerificationUrl(link);

      if (link) {
        toast.success('Cuenta creada. Usa el enlace de verificacion mostrado.', { duration: 4000 });
        return;
      }

      toast.success('Revisa tu correo para verificar tu cuenta.', { duration: 3000 });
      setTimeout(() => onLogin(), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='username' className='block text-sm font-medium text-gray-900 mb-1.5'>
          Nombre de usuario
        </label>
        <input
          type='text'
          id='username'
          placeholder='usuario123'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue focus:border-main-blue'
          {...register('username', {
            required: 'El nombre de usuario es obligatorio',
          })}
        />
        {errors.username && <p className='text-red-600 text-xs mt-1'>{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-900 mb-1.5'>
          Email
        </label>
        <input
          type='email'
          id='email'
          placeholder='correo@example.com'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue focus:border-main-blue'
          {...register('email', {
            required: 'El correo es obligatorio',
          })}
        />
        {errors.email && <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-900 mb-1.5'>
          Contraseña
        </label>
        <input
          type='password'
          id='password'
          placeholder='* * * * * * *'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue focus:border-main-blue'
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
          })}
        />
        {errors.password && <p className='text-red-600 text-xs mt-1'>{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-900 mb-1.5'>
          Confirmar contraseña
        </label>
        <input
          type='password'
          id='confirmPassword'
          placeholder='* * * * * * *'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue focus:border-main-blue'
          {...register('confirmPassword', {
            required: 'Debes confirmar la contraseña',
            validate: (value) => value === password || 'Las contraseñas no coinciden',
          })}
        />
        {errors.confirmPassword && <p className='text-red-600 text-xs mt-1'>{errors.confirmPassword.message}</p>}
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        <label className='flex items-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3'>
          <input
            type='radio'
            value='CLIENTE'
            {...register('role')}
            className='h-4 w-4 text-main-blue'
            defaultChecked
          />
          <span className='text-sm font-medium text-gray-900'>Cliente</span>
        </label>
        <label className='flex items-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 px-4 py-3'>
          <input
            type='radio'
            value='ADMIN'
            {...register('role')}
            className='h-4 w-4 text-main-blue'
          />
          <span className='text-sm font-medium text-gray-900'>Administrador</span>
        </label>
      </div>

      {selectedRole === 'ADMIN' && (
        <div>
          <label htmlFor='secretKey' className='block text-sm font-medium text-gray-900 mb-1.5'>
            Clave secreta de administrador
          </label>
          <input
            type='text'
            id='secretKey'
            placeholder='CLAVE_ADMIN'
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-blue focus:border-main-blue'
            {...register('secretKey', {
              required: 'La clave secreta es obligatoria para el registro de administrador',
            })}
          />
          {errors.secretKey && <p className='text-red-600 text-xs mt-1'>{errors.secretKey.message}</p>}
        </div>
      )}

      {error && <p className='text-red-600 text-sm text-center'>{error}</p>}
      {errors.confirmPassword && <p className='text-red-600 text-xs mt-1'>{errors.confirmPassword.message}</p>}
      {successMessage && <p className='text-green-600 text-sm text-center'>{successMessage}</p>}
      {verificationUrl && (
        <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-900'>
          <p className='font-semibold'>El correo no llego o esta en desarrollo.</p>
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
        className='w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'
      >
        {loading ? 'Registrando...' : 'Crear cuenta'}
      </button>

      <p className='text-center text-sm'>
        ¿Ya tienes una cuenta?{' '}
        <button type='button' onClick={onLogin} className='text-main-blue hover:underline'>
          Inicia sesión
        </button>
      </p>
    </form>
  );
};
