import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Settings,
  Package,
  LogOut,
  Loader2,
  ChevronRight,
  Star,
  Heart,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, logout } = useAuthStore();
  const wishlistItemsCount = useWishlistStore((state) => state.wishlistItems.length);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Protection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    const res = await updateProfile({ name, phone });
    setIsSaving(false);

    if (res.success) {
      toast.success('Profile settings updated successfully! 💖');
      setIsEditing(false);
    } else {
      toast.error(res.message || 'Failed to update profile settings');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 text-left">
      
      {/* 1. Flipkart-style Top Banner / Welcome Card */}
      <div className="bg-gradient-to-r from-primary-50 via-primary-50/70 to-primary-100/30 rounded-3xl border border-primary-50 p-6 shadow-pink-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center font-playfair font-black text-2xl shadow-pink-md shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'G'}
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[10px] text-primary uppercase font-black tracking-widest block">Hello, Beautiful! 🌸</span>
          <h2 className="text-lg font-black text-gray-800 truncate">{user?.name}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 font-semibold">
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-gray-400" />
              {user?.email}
            </span>
            {user?.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-gray-400" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Quick Dashboard Actions Grid (Flipkart-style) */}
      <div className="bg-white rounded-3xl border border-primary-50 p-4 shadow-pink-sm divide-y divide-primary-50/50">
        
        {/* My Orders */}
        <Link
          to="/orders"
          className="flex items-center gap-3.5 py-4 px-2 hover:bg-primary-50/20 transition-all rounded-2xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
            <Package size={20} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-xs font-bold text-gray-800">My Orders</h4>
            <p className="text-[10px] text-gray-400 font-semibold truncate">Track, view history, or buy outfits again</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* My Wishlist */}
        <Link
          to="/wishlist"
          className="flex items-center gap-3.5 py-4 px-2 hover:bg-primary-50/20 transition-all rounded-2xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
            <Heart size={20} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-xs font-bold text-gray-800">My Wishlist</h4>
            <p className="text-[10px] text-gray-400 font-semibold truncate">
              Your saved collection of favorite outfits ({wishlistItemsCount})
            </p>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* My Reviews */}
        <Link
          to="/my-reviews"
          className="flex items-center gap-3.5 py-4 px-2 hover:bg-primary-50/20 transition-all rounded-2xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
            <Star size={20} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-xs font-bold text-gray-800">My Reviews</h4>
            <p className="text-[10px] text-gray-400 font-semibold truncate">Check ratings and reviews you wrote</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Delivery Addresses */}
        <Link
          to="/addresses"
          className="flex items-center gap-3.5 py-4 px-2 hover:bg-primary-50/20 transition-all rounded-2xl group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
            <MapPin size={20} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="text-xs font-bold text-gray-800">Delivery Addresses</h4>
            <p className="text-[10px] text-gray-400 font-semibold truncate">Manage saved home/office addresses</p>
          </div>
          <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Admin Console Shortcut */}
        {user?.role === 'admin' && (
          <a
            href="http://localhost:5174/admin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 py-4 px-2 hover:bg-primary-50/20 transition-all rounded-2xl group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h4 className="text-xs font-bold text-green-700">Admin Console</h4>
              <p className="text-[10px] text-green-500 font-semibold truncate">Manage shop catalog, orders, and coupons</p>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        )}
      </div>

      {/* 3. Account Profile Settings Card (Inline collapsible form) */}
      <div className="bg-white rounded-3xl border border-primary-50 p-6 shadow-pink-sm space-y-4">
        <div className="flex items-center justify-between border-b border-primary-50 pb-3">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Account Details</h3>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary text-[10px] font-bold rounded-full transition-colors cursor-pointer"
          >
            <Edit2 size={10} />
            <span>{isEditing ? 'Cancel' : 'Edit Details'}</span>
          </button>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold pt-1">
            <div className="bg-primary-50/20 p-4 rounded-2xl border border-primary-50">
              <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Full Name</span>
              <span className="text-gray-800 font-bold">{user?.name}</span>
            </div>
            <div className="bg-primary-50/20 p-4 rounded-2xl border border-primary-50">
              <span className="text-[9px] text-gray-400 uppercase font-bold block mb-1">Phone Number</span>
              <span className="text-gray-800 font-bold">{user?.phone || 'Not provided'}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Your Phone Number"
                    className="w-full pl-10 pr-3 py-2.5 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer disabled:opacity-75 transition-all"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. Log Out Action Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-3xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        <LogOut size={16} />
        <span>Log Out Account</span>
      </button>

    </div>
  );
};

export default Profile;
