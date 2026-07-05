import api from '../api/axios.js';

const authService = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  sendRegisterOtp: async (name, email, password) => {
    const { data } = await api.post('/auth/send-register-otp', { name, email, password });
    return data;
  },

  verifyRegisterOtp: async (email, otp) => {
    const { data } = await api.post('/auth/verify-register-otp', { email, otp });
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refreshToken: async () => {
    const { data } = await api.post('/auth/refresh-token', {});
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  verifyResetOtp: async (email, otp) => {
    const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
    return data;
  },

  resetPassword: async (resetToken, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { resetToken, newPassword });
    return data;
  },
};

export default authService;
