import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { forgotPassword } from '../../../shared/apis/auth.js';
import toast from 'react-hot-toast';

export const ForgotPassword = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      setMessage('');
      const { data } = await forgotPassword(email);
      const successMessage =
        data?.message || data?.Message || 'Solicitud enviada. Revisa tu correo para continuar.';
      setMessage(successMessage);
      toast.success(successMessage);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'No se pudo enviar la solicitud de recuperación.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
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
            required: 'Este campo es obligatorio',
          })}
        />
        {errors.email && <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>}
      </div>

      {message && <p className='text-center text-sm text-gray-700'>{message}</p>}

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm'
      >
        {loading ? 'Enviando...' : 'Enviar recuperación'}
      </button>

      <p className='text-center text-sm'>
        ¿Recordaste tu contraseña?
        <button
          type='button'
          onClick={onSwitch}
          className='text-main-blue hover:underline hover:cursor-pointer'
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};
