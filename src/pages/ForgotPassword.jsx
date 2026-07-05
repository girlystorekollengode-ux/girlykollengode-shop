import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { Mail, Lock, ShieldCheck, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword, isActionLoading } = useAuthStore();

  // Screen state: 1 (Email Input), 2 (OTP Verification), 3 (New Password)
  const [screen, setScreen] = useState(1);

  // Data fields
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend Timer & Error states
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

  // Handle Screen 1: Send Reset OTP Code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      toast.success(result.message || 'Reset OTP sent to your email!');
      setScreen(2);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError(false);
      // Focus first box
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    } else {
      toast.error(result.message || 'Failed to send OTP');
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

  // Handle Screen 2: Verify Reset OTP
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
    const result = await verifyResetOtp(email, otp);
    if (result.success && result.resetToken) {
      toast.success('OTP verified successfully!');
      setResetToken(result.resetToken);
      setScreen(3);
    } else {
      toast.error(result.message || 'Invalid or expired OTP');
      triggerShake();
    }
    isVerifying.current = false;
  }, [email, otpValues, verifyResetOtp]);

  // Auto-submit OTP verification
  useEffect(() => {
    const fullOtp = otpValues.join('');
    if (fullOtp.length === 6 && screen === 2) {
      handleVerifyOtp();
    }
  }, [otpValues, screen, handleVerifyOtp]);

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    const result = await forgotPassword(email);
    if (result.success) {
      toast.success('New reset OTP sent to your email!');
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

  // Handle Screen 3: Submit New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const result = await resetPassword(resetToken, newPassword);
    if (result.success) {
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      toast.error(result.message || 'Password reset failed. Please request a new OTP.');
      setScreen(1); // Go back to first step on hard failure
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
        
        {/* Screen 1: Email Input */}
        {screen === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-center font-playfair text-3xl font-black text-gray-800 tracking-wide">
                Forgot Password
              </h2>
              <p className="mt-2 text-center text-xs text-gray-500 font-semibold font-poppins leading-relaxed">
                Enter your registered email address to receive a recovery OTP code.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleRequestOtp}>
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
                    className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                    'Send Reset Code'
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 font-medium font-poppins">
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Sign back in
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
                Verify OTP
              </h2>
              <p className="mt-2 text-center text-xs text-gray-500 font-semibold font-poppins leading-relaxed">
                We sent a 6-digit recovery code to <span className="text-primary font-bold">{email}</span>
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

        {/* Screen 3: New Password Input */}
        {screen === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-center font-playfair text-3xl font-black text-gray-800 tracking-wide">
                New Password
              </h2>
              <p className="mt-2 text-center text-xs text-gray-500 font-semibold font-poppins leading-relaxed">
                Set a strong, new password for your Girly account.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-10 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-transparent font-poppins"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
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
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
