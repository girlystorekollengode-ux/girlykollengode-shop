import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isActionLoading } = useAuthStore();
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const mergeWishlist = useWishlistStore((state) => state.mergeWishlist);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect if already authenticated
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      toast.error(errorParam);
      // Clean up query param from URL
      const nextParams = new URLSearchParams(location.search);
      nextParams.delete('error');
      const searchStr = nextParams.toString();
      navigate(location.pathname + (searchStr ? `?${searchStr}` : ''), { replace: true });
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all credentials');
      return;
    }

    // Set flag before calling login so the root App state listener catches it
    sessionStorage.setItem('showWelcomePopup', 'true');

    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back to Girly! 💗');
      // Merge guest cart items and wishlist items to backend database
      await mergeGuestCart();
      await mergeWishlist();
      navigate(from, { replace: true });
    } else {
      sessionStorage.removeItem('showWelcomePopup');
      toast.error(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-primary-100 shadow-pink-md text-left">
        <div>
          <h2 className="text-center font-playfair text-3xl font-black text-gray-800 tracking-wide">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-xs text-gray-500 font-semibold">
            Sign in to access your wishlist, saved addresses, and checkouts.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email field */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between pl-1 mb-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-primary focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isActionLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-bold rounded-full text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-pink-sm cursor-pointer disabled:opacity-75 transition-all"
            >
              {isActionLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Sign In Account'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <div className="w-full h-px bg-[#FFCCE5]"></div>
          <span className="px-3 text-[10px] font-bold text-[#999] uppercase tracking-wider bg-white shrink-0">OR</span>
          <div className="w-full h-px bg-[#FFCCE5]"></div>
        </div>

        {/* Google Sign In Button */}
        <div>
          <button
            type="button"
            disabled={isRedirecting}
              setIsRedirecting(true);
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
              window.location.href = `${apiUrl}/auth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 px-6 py-2.5 bg-white border border-[#FFCCE5] rounded-full hover:bg-[#FFF5F9] hover:border-[#E8006F] text-[#1A1A1A] hover:shadow-pink-sm transition-all duration-200 cursor-pointer disabled:opacity-80"
          >
            {isRedirecting ? (
              <Loader2 size={18} className="animate-spin text-primary" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="font-poppins text-xs font-semibold text-[#1A1A1A]">
              {isRedirecting ? 'Redirecting...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 font-medium">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-primary hover:text-primary-dark transition-colors"
            >
              Sign up today
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
