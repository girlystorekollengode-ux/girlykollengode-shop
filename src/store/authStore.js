import { create } from 'zustand';
import api, { setAccessToken, registerAuthErrorCallback } from '../api/axios.js';
import authService from '../services/authService.js';
import { useCartStore } from './cartStore.js';
import { useWishlistStore } from './wishlistStore.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isActionLoading: false,
  loginStatus: 'idle', // idle | loading | success | error
  accessToken: null,

  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAccessToken(token);
    set({ accessToken: token, user, isAuthenticated: true });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    
    // Check localStorage first (e.g. after Google login redirect)
    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          set({ user: res.data.user, accessToken: token, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        setAccessToken(null);
      }
    }

    try {
      // Call refresh token endpoint (which reads httpOnly cookie) to get in-memory access token
      const data = await authService.refreshToken();
      if (data.success && data.accessToken) {
        // Set the in-memory access token in Axios
        setAccessToken(data.accessToken);

        // Fetch user profile info
        const meData = await authService.getMe();
        if (meData.success) {
          set({ user: meData.user, accessToken: data.accessToken, isAuthenticated: true });
        } else {
          get().clearAuth();
        }
      } else {
        get().clearAuth();
      }
    } catch (error) {
      console.warn('CheckAuth: No active session found (continuing as guest)');
      get().clearAuth();
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isActionLoading: true, loginStatus: 'loading' });
    try {
      const data = await authService.login(email, password);
      if (data.success && data.accessToken) {
        // Store access token in memory & localStorage
        get().setAuth(data.accessToken, data.user);
        set({ loginStatus: 'success' });
        return { success: true };
      }
      set({ loginStatus: 'error' });
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      set({ loginStatus: 'error' });
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  sendRegisterOtp: async (name, email, password) => {
    set({ isActionLoading: true });
    try {
      const data = await authService.sendRegisterOtp(name, email, password);
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send registration OTP',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  verifyRegisterOtp: async (email, otp) => {
    set({ isActionLoading: true });
    try {
      const data = await authService.verifyRegisterOtp(email, otp);
      if (data.success && data.accessToken) {
        // Store access token in memory & localStorage
        get().setAuth(data.accessToken, data.user);
        return { success: true };
      }
      return data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  register: async (name, email, password) => {
    return await get().sendRegisterOtp(name, email, password);
  },

  verifyOtp: async (email, otp) => {
    return await get().verifyRegisterOtp(email, otp);
  },

  forgotPassword: async (email) => {
    set({ isActionLoading: true });
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset code',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  verifyResetOtp: async (email, otp) => {
    set({ isActionLoading: true });
    try {
      return await authService.verifyResetOtp(email, otp);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  resetPassword: async (resetToken, newPassword) => {
    set({ isActionLoading: true });
    try {
      return await authService.resetPassword(resetToken, newPassword);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed',
      };
    } finally {
      set({ isActionLoading: false });
    }
  },

  logout: async () => {
    set({ isActionLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API request failed:', error);
    } finally {
      get().clearAuth();
      set({ isActionLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const data = await authService.getMe();
      if (data.success) {
        set({ user: data.user, isAuthenticated: true });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('refreshUser failed:', error);
      return { success: false };
    }
  },

  clearAuth: () => {
    // Clear access token in memory
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    
    // Clear store states
    set({ user: null, isAuthenticated: false, loginStatus: 'idle', accessToken: null });
    
    // Clear cart/wishlist client states
    useCartStore.setState({ cartItems: [] });
    useWishlistStore.setState({ wishlistItems: [] });
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.put('/users/profile', profileData);
      if (data.success) {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false, message: 'Profile update failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
      };
    }
  },

  // Address CRUD
  addAddress: async (addressData) => {
    try {
      const { data } = await api.post('/users/addresses', addressData);
      if (data.success) {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add address',
      };
    }
  },

  updateAddress: async (addressId, addressData) => {
    try {
      const { data } = await api.put(`/users/addresses/${addressId}`, addressData);
      if (data.success) {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update address',
      };
    }
  },

  deleteAddress: async (addressId) => {
    try {
      const { data } = await api.delete(`/users/addresses/${addressId}`);
      if (data.success) {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete address',
      };
    }
  },

  setDefaultAddress: async (addressId) => {
    try {
      const { data } = await api.put(`/users/addresses/${addressId}/default`);
      if (data.success) {
        set({ user: data.data });
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to set default address',
      };
    }
  },
}));

// Register error callback to handle 401 logouts
registerAuthErrorCallback(() => {
  useAuthStore.getState().clearAuth();
});
