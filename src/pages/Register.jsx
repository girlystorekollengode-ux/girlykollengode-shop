import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import { Mail, Lock, User, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { sendRegisterOtp, verifyRegisterOtp, isActionLoading } = useAuthStore();
  const mergeGuestCart = useCartStore((state) => state.mergeGuestCart);
  const mergeWishlist = useWishlistStore((state) => state.mergeWishlist);

  // Screen state: 1 (Registration Form), 2 (OTP Verification)
  const [screen, setScreen] = useState(1);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Screen 1 Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Screen 2 OTP State
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isShake, setIsShake] = useState(false);
  const [otpError, setOtpError] = useState(false);

  // Single ref array for OTP inputs to comply with React Hooks rules
  const inputRefs = useRef([]);
  const isVerifying = useRef(false);

  // Countdown timer for OTP resend (optimized loop)
  useEffect(() => {
    if (screen !== 2) return;
    setResendTimer(60);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen]);

  // Handle Screen 1 submission (Send OTP)
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await sendRegisterOtp(name, email, password);
    if (result.success) {
      toast.success(result.message || 'Verification OTP sent to your email!');
      setScreen(2);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError(false);
      // Wait for DOM update to focus first input
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  // Handle OTP Inputs keydown & change
  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = '';
      setOtpValues(newOtpValues);
      return;
    }

    const val = numericValue.substring(numericValue.length - 1);
    const newOtpValues = [...otpValues];
    newOtpValues[index] = val;
    setOtpValues(newOtpValues);
    setOtpError(false);

    // Auto-focus next input
    if (index < 5 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtpValues = [...otpValues];
      if (!otpValues[index] && index > 0) {
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtpValues[index] = '';
        setOtpValues(newOtpValues);
      }
      setOtpError(false);
      e.preventDefault();
    }
  };

  // Paste support
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    if (pasteData.length === 6) {
      const newOtpValues = pasteData.split('');
      setOtpValues(newOtpValues);
      setOtpError(false);
      inputRefs.current[5]?.focus();
    }
  };

  const triggerShake = () => {
    setOtpError(true);
    setIsShake(true);
    setTimeout(() => {
      setIsShake(false);
    }, 500);
  };

  // Handle OTP Verification submission
  const handleVerifyOtp = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (isVerifying.current) return;

    const otp = otpValues.join('');
    if (otp.length < 6) {
      toast.error('Please enter a 6-digit OTP');
      triggerShake();
      return;
    }

    isVerifying.current = true;
    sessionStorage.setItem('showWelcomePopup', 'true');
    const result = await verifyRegisterOtp(email, otp);

    if (result.success) {
      toast.success('Registration successful! Welcome to Girly 💗');
      await mergeGuestCart();
      await mergeWishlist();
      navigate('/');
    } else {
      sessionStorage.removeItem('showWelcomePopup');
      toast.error(result.message || 'Invalid or expired OTP');
      triggerShake();
    }
    isVerifying.current = false;
  }, [email, otpValues, verifyRegisterOtp, mergeGuestCart, mergeWishlist, navigate]);

  // Auto-submit OTP verification
  useEffect(() => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6 && screen === 2) {
      handleVerifyOtp();
    }
  }, [otpValues, screen, handleVerifyOtp]);

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const result = await sendRegisterOtp(name, email, password);
    if (result.success) {
      toast.success('New verification OTP sent to your email!');
      setResendTimer(60);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } else {
      toast.error(result.message || 'Failed to send OTP');
    }
  };

  // Format resend timer helper
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-2xl border border-[#FFCCE5] shadow-pink-md text-left">
        
        {/* Screen 1: Registration Form */}
        {screen === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-center font-playfair text-3xl font-black text-gray-800 tracking-wide">
                Create Account
              </h2>
              <p className="mt-2 text-center text-xs text-gray-500 font-semibold font-poppins">
                Join Girly and explore women's fashion in style.
              </p>
            </div>

            {/* Google Sign Up Button */}
            <div>
              <button
                type="button"
                disabled={isRedirecting}
                onClick={() => {
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
                  {isRedirecting ? 'Redirecting...' : 'Sign up with Google'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center justify-center my-4">
              <div className="w-full h-px bg-[#FFCCE5]"></div>
              <span className="px-3 text-[10px] font-bold text-[#999] uppercase tracking-wider bg-white shrink-0">OR</span>
              <div className="w-full h-px bg-[#FFCCE5]"></div>
            </div>

            <form className="space-y-5" onSubmit={handleSendOtp}>
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Anjali Menon"
                      className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="anjali@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Create password (min 6 characters)"
                      className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password"
                      required
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-bold rounded-full text-white bg-gradient-to-r from-[#E8006F] to-[#FF4D97] hover:brightness-105 transition-all shadow-pink-sm cursor-pointer disabled:opacity-75"
                >
                  {isActionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 font-medium font-poppins">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Log in instead
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Screen 2: OTP Verification */}
        {screen === 2 && (
          <div className="space-y-6">
            <button
              onClick={() => setScreen(1)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="flex flex-col items-center">
              <div className="p-3 bg-primary-50 rounded-full text-primary mb-3">
                <ShieldCheck size={28} />
              </div>
              <h2 className="text-center font-playfair text-3xl font-black text-gray-800 tracking-wide">
                Verify Email
              </h2>
              <p className="mt-2 text-center text-xs text-gray-500 font-semibold font-poppins leading-relaxed">
                We sent a 6-digit code to <span className="text-primary font-bold">{email}</span>
                <span className="block mt-1 text-[10px] text-gray-400 font-medium">
                  (If you don't see it in your inbox, please check your spam folder)
                </span>
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              {/* 6 OTP boxes container */}
              <div 
                className={`flex justify-between gap-1.5 sm:gap-2 py-2 ${isShake ? 'animate-shake' : ''}`}
                onPaste={handlePaste}
              >
                {otpValues.map((value, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center rounded-lg border font-bold text-xl sm:text-2xl focus:outline-none transition-all duration-150"
                    style={{
                      borderColor: otpError ? '#EF4444' : value ? '#E8006F' : '#FFCCE5',
                      backgroundColor: value ? '#FFF5F9' : '#FFFFFF',
                      color: otpError ? '#EF4444' : '#1A1A1A',
                      boxShadow: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#E8006F';
                      e.target.style.boxShadow = '0 0 0 3px rgba(232,0,111,0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = otpError ? '#EF4444' : value ? '#E8006F' : '#FFCCE5';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                ))}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-xs font-bold rounded-full text-white bg-gradient-to-r from-[#E8006F] to-[#FF4D97] hover:brightness-105 transition-all shadow-pink-sm cursor-pointer disabled:opacity-75"
                >
                  {isActionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 font-medium font-poppins">
                Didn't receive code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">
                    Resend OTP in <span className="text-primary font-bold">{formatTimer(resendTimer)}</span>
                  </span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer focus:outline-none"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;
