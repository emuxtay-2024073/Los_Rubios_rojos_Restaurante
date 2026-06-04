import { axiosAuth } from './api.js';

export const login = async ({ email, password }) => {
  return await axiosAuth.post('/auth/login', {
    email,
    password,
  });
};

export const getAllUsers = async () => {
  const { data } = await axiosAuth.get('/auth/users');
  return data;
};

export const createUser = async (data) => {
  return await axiosAuth.post('/auth/register', data);
};

export const promoteUserToAdmin = async (id) => {
  return await axiosAuth.patch(`/auth/users/${id}/promote`);
};

export const register = async (data) => {
  return await axiosAuth.post('/auth/register', data);
};

export const verifyEmail = async (token) => {
  return await axiosAuth.post('/auth/verify-email', null, { params: { token } });
};

export const activateAdminRole = async (token) => {
  return await axiosAuth.post('/auth/activate-admin', null, { params: { token } });
};

export const resendVerification = async (email) => {
  return await axiosAuth.post('/auth/resend-verification', { email });
};
