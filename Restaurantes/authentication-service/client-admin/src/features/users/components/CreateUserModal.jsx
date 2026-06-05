import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading, error }) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const submit = async (values) => {
    const ok = await onCreate({
      username: values.username,
      email: values.email,
      password: values.password,
    });

    if (ok) {
      reset({ role: 'CLIENTE' });
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden'>
        <div
          className='p-5 sm:p-6 text-white sticky top-0 z-10'
          style={{
            background: 'linear-gradient(90deg, var(--main-blue, #1f4e97) 0%, #1956a3 100%)',
          }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>Nuevo Usuario</h2>
          <p className='text-xs sm:text-sm opacity-80'>
            Completa la informacion para registrar un nuevo usuario
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} className='p-5 sm:p-6 space-y-5 overflow-y-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                Nombre de Usuario
              </label>
              <input
                {...register('username', {
                  required: 'El nombre de usuario es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Debe tener al menos 3 caracteres',
                  },
                })}
                type='text'
                className='w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-gray-100 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition'
              />
              {errors.username && <p className='text-red-600 text-xs'>{errors.username.message}</p>}
            </div>

          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-1'>Email</label>
            <input
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Formato de email invalido',
                },
              })}
              type='email'
              className='w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-gray-100 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition'
            />
            {errors.email && <p className='text-red-600 text-xs'>{errors.email.message}</p>}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Contrasena</label>
              <input
                {...register('password', {
                  required: 'La contrasena es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'Debe tener al menos 8 caracteres',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                    message: 'Debe incluir mayusculas, minusculas y numeros',
                  },
                })}
                type='password'
                className='w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-gray-100 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition'
              />
              {errors.password && <p className='text-red-600 text-xs'>{errors.password.message}</p>}
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>
                Confirmar contrasena
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Debe confirmar su contrasena',
                  validate: {
                    matchesPassword: (value) =>
                      value === getValues('password') || 'Las contrasenas no coinciden',
                  },
                })}
                type='password'
                className='w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-gray-100 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition'
              />
              {errors.confirmPassword && (
                <p className='text-red-600 text-xs'>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>


          {error && <p className='text-red-600 text-sm text-center'>{error}</p>}

          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-400/80'>
            <button
              type='button'
              onClick={() => {
                reset();
                onClose();
              }}
              className='w-full sm:w-auto px-5 py-2 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium transition shadow disabled:opacity-60'
              style={{
                background: 'linear-gradient(90deg, var(--main-blue, #1f4e97) 0%, #1956a3 100%)',
                border: 'none',
              }}
            >
              {loading ? <Spinner small /> : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
