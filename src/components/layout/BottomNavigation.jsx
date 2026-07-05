import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, Heart, User } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore.js';

const BottomNavigation = () => {
  const location = useLocation();
  const wishlistItemsCount = useWishlistStore((state) => state.wishlistItems.length);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-primary-100 rounded-t-2xl shadow-[0_-4px_20px_rgba(232,0,111,0.12)]">
      {/* Custom top-border line with center curve/dip mock using CSS border-radius */}
      <div className="flex justify-around items-center h-16 px-2 relative">
        
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
            isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-primary-300'
          }`}
        >
          <Home size={20} className={isActive('/') ? 'scale-110' : ''} />
          <span className="text-[9px] font-bold mt-1 tracking-wider">Home</span>
        </Link>

        {/* 2. All Collections */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
            isActive('/shop') ? 'text-primary' : 'text-gray-400 hover:text-primary-300'
          }`}
        >
          <LayoutGrid size={20} className={isActive('/shop') ? 'scale-110' : ''} />
          <span className="text-[9px] font-bold mt-1 tracking-wider">All</span>
        </Link>

        {/* 3. Search (Bigger Floating Button with cutout border effect) */}
        <div className="relative w-14 h-14 -mt-6 flex items-center justify-center">
          {/* White overlap cutout shape */}
          <div className="absolute inset-0 bg-white rounded-full border-t border-primary-100 shadow-[0_-3px_6px_rgba(232,0,111,0.05)] scale-110 z-[-1]" />
          <Link
            to="/search"
            className="w-12 h-12 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-pink-md border-2 border-white transition-all active:scale-90 cursor-pointer"
          >
            <Search size={22} className="stroke-[2.5]" />
          </Link>
        </div>

        {/* 4. Wishlist */}
        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center w-12 h-12 relative transition-all ${
            isActive('/wishlist') ? 'text-primary' : 'text-gray-400 hover:text-primary-300'
          }`}
        >
          <Heart size={20} className={isActive('/wishlist') ? 'scale-110' : ''} />
          {wishlistItemsCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[8px] font-extrabold text-white border border-white">
              {wishlistItemsCount}
            </span>
          )}
          <span className="text-[9px] font-bold mt-1 tracking-wider">Wishlist</span>
        </Link>

        {/* 5. Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center w-12 h-12 transition-all ${
            isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-primary-300'
          }`}
        >
          <User size={20} className={isActive('/profile') ? 'scale-110' : ''} />
          <span className="text-[9px] font-bold mt-1 tracking-wider">Profile</span>
        </Link>

      </div>
    </div>
  );
};

export default BottomNavigation;
