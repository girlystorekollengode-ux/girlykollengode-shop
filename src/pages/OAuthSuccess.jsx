import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore.js';
import { Sparkles } from 'lucide-react';
import Logo from '../components/ui/Logo.jsx';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const error = searchParams.get('error');
    const token = searchParams.get('token');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const role = searchParams.get('role');
    const id = searchParams.get('id');
    const avatar = searchParams.get('avatar');
    const isNew = searchParams.get('isNew');

    if (error) {
      toast.error(error || 'Google authentication failed');
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (token) {
      // 1. Build user object
      const user = {
        _id: id,
        name,
        email,
        role,
        avatar: avatar ? decodeURIComponent(avatar) : null,
      };

      // 2. Set auth details in Zustand store & localStorage
      setAuth(token, user);

      // 3. Show welcoming toast
      if (isNew === 'true') {
        toast.success('Welcome to Girly! 💗');
      } else {
        toast.success(`Welcome back, ${name}! 💗`);
      }

      // 4. Clean up url parameters
      window.history.replaceState({}, document.title, window.location.pathname);

      // 5. Redirect to home page
      const timer = setTimeout(() => {
        navigate('/');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // No token and no error, redirect to login
      navigate('/login');
    }
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#FFF5F9] via-white to-[#FFE6F2] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-primary-100 shadow-pink-md animate-fade-in">
        {/* Girly Logo */}
        <div className="flex justify-center transform hover:scale-105 transition-transform duration-300">
          <Logo />
        </div>

        {/* Loading Spinner Container */}
        <div className="relative py-4 flex justify-center">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-primary animate-pulse" size={20} />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="font-playfair text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
            Signing you in...
          </h2>
          <p className="font-dancing text-md text-primary font-bold">
            Preparing your personal boutique experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;
