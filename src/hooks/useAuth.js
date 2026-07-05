import { useAuthStore } from '../store/authStore.js';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const loginStatus = useAuthStore((state) => state.loginStatus);
  
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    user,
    isAuthenticated,
    isLoading,
    loginStatus,
    login,
    register,
    verifyOtp,
    logout,
    checkAuth,
    refreshUser,
    clearAuth,
  };
};

export default useAuth;
