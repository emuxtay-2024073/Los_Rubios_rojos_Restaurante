import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../../auth/store/useUserManagementStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const PAGE_SIZE = 8;

export const Users = () => {
  const { users, loading, error, getAllUsers, createUser, promoteUserToAdmin } = useUserManagementStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((u) => {
      const username = (u.username || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toUpperCase();
      const matchesSearch =
        !normalizedSearch ||
        username.includes(normalizedSearch) ||
        email.includes(normalizedSearch);
      const matchesRole = roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleCreate = async (payload) => {
    const res = await createUser(payload);
    if (res.success) {
      showSuccess('Usuario creado correctamente. Debe verificar su correo.');
      return true;
    }

    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  const handlePromote = async (user) => {
    if (!user.verified && !user.emailConfirmed) {
      showError('El usuario debe verificar su correo antes de ser admin');
      return;
    }

    const ok = window.confirm(`Convertir a ${user.email} en administrador?`);
    if (!ok) return;

    const res = await promoteUserToAdmin(user._id || user.id);
    if (res.success) {
      showSuccess('Solicitud enviada. El usuario debe activar admin desde su correo.');
      return;
    }

    showError(res.error || 'No se pudo promover usuario');
  };

  if (loading && users.length === 0) return <Spinner />;

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-main-blue'>Usuarios</h1>
          <p className='text-gray-500 text-sm'>Listado de usuarios registrados</p>
        </div>
        <button
          className='bg-main-blue px-4 py-2 rounded text-white hover:opacity-90 transition'
          onClick={() => setOpenCreateModal(true)}
        >
          + Agregar Usuario
        </button>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por username o email...'
            className='md:col-span-2 w-full px-3 py-2 border rounded-lg'
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN'>ADMIN</option>
            <option value='CLIENTE'>CLIENTE</option>
          </select>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 text-gray-700'>
              <tr>
                <th className='text-left px-4 py-3'>Email</th>
                <th className='text-left px-4 py-3'>Username</th>
                <th className='text-left px-4 py-3'>Rol</th>
                <th className='text-left px-4 py-3'>Estado</th>
                <th className='text-left px-4 py-3'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td className='px-4 py-6 text-center text-gray-500' colSpan={5}>
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const isVerified = Boolean(u.verified ?? u.emailConfirmed);
                  const isAdmin = u.role === 'ADMIN';

                  return (
                  <tr key={u._id || u.id || u.email} className='border-t hover:bg-gray-50'>
                    <td className='px-4 py-3 font-medium text-gray-800'>{u.email || '-'}</td>
                    <td className='px-4 py-3 text-gray-700'>@{u.username}</td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isVerified ? 'Activo' : 'Pendiente'}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      {!isAdmin && (
                        <button
                          type='button'
                          onClick={() => handlePromote(u)}
                          disabled={!isVerified || loading}
                          className='rounded-full bg-main-blue px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300'
                        >
                          Hacer admin
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
          <p className='text-xs text-gray-600'>
            Mostrando {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
            {' - '}
            {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de {filteredUsers.length}
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
            >
              Anterior
            </button>
            <span className='px-2 py-1.5 text-sm text-gray-700'>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={loading}
        error={error}
      />
    </div>
  );
};
