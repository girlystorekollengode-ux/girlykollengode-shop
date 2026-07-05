import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import api from '../../api/axios.js';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  Star,
  ArrowLeft,
} from 'lucide-react';
import Logo from '../ui/Logo.jsx';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartItemsCount = useCartStore((state) => state.getCartTotalCount());
  const wishlistItemsCount = useWishlistStore((state) => state.wishlistItems.length);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Live search states (Flipkart style)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [liveQuery, setLiveQuery] = useState('');
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);

  // Debounced live suggestions query
  useEffect(() => {
    if (liveQuery.trim().length < 2) {
      setLiveSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const { data } = await api.get('/products/search', { params: { q: liveQuery } });
        setLiveSuggestions(data.success ? data.products || [] : []);
      } catch (err) {
        console.error('Error fetching live suggestions:', err);
      } finally {
        setLiveLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [liveQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (liveQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(liveQuery.trim())}`);
      setLiveQuery('');
      setMobileSearchOpen(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-primary-100 shadow-pink-sm relative">
      {/* Premium Highlight Bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>
      
      {/* Live Suggestions Overlay Panel */}
      {liveQuery.trim().length >= 2 && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-primary-100 shadow-[0_10px_25px_rgba(232,0,111,0.15)] z-50 max-h-[75vh] overflow-y-auto divide-y divide-primary-50 text-left">
          {liveLoading ? (
            <div className="p-4 text-center text-xs text-gray-500 font-semibold flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Searching matching outfits...</span>
            </div>
          ) : liveSuggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-400 font-semibold">
              No matching outfits found 🌸
            </div>
          ) : (
            <div className="py-2">
              <p className="text-[9px] uppercase font-black tracking-widest text-primary px-4 py-1.5 bg-primary-50/30">
                Suggested Outfits
              </p>
              {liveSuggestions.map((prod) => (
                <Link
                  key={prod._id}
                  to={`/products/${prod._id}`}
                  onClick={() => {
                    setLiveQuery('');
                    setMobileSearchOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50/20 transition-colors group"
                >
                  <img
                    src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=100'}
                    alt={prod.name}
                    className="w-10 h-15 object-cover rounded-lg border border-primary-0 shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0 flex-grow text-left">
                    <p className="text-xs font-bold text-gray-800 truncate group-hover:text-primary transition-colors">
                      {prod.name}
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                      {prod.category?.name || 'Collection'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-primary">₹{prod.discountPrice || prod.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Mobile Search Overlay Cover */}
        {mobileSearchOpen && (
          <div className="absolute inset-0 bg-white flex items-center px-4 z-50 h-16">
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setLiveQuery('');
              }}
              className="p-2 text-gray-500 hover:text-primary mr-1"
            >
              <ArrowLeft size={20} />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-grow relative">
              <input
                type="text"
                placeholder="Search outfits..."
                className="w-full pl-3 pr-10 py-1.5 border border-primary-200 rounded-full text-xs bg-primary-50/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
                autoFocus
              />
              {liveQuery && (
                <button
                  type="button"
                  onClick={() => setLiveQuery('')}
                  className="absolute right-8 top-2 text-gray-400 hover:text-primary"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-3 top-2 text-gray-500 hover:text-primary"
              >
                <Search size={14} />
              </button>
            </form>
          </div>
        )}

        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-primary-50 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo Section */}
          <div className="flex-1 md:flex-initial flex items-center justify-start ml-2 md:ml-0">
            <Link to="/" className="flex items-center group">
              <Logo showCircle={false} showSubtitle={false} size="h-11 sm:h-13" className="group-hover:scale-105 transition-transform duration-300" />
            </Link>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-xs font-bold text-gray-600 hover:text-primary transition-colors tracking-wider uppercase"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-xs font-bold text-gray-600 hover:text-primary transition-colors tracking-wider uppercase"
            >
              Shop Collection
            </Link>
            <Link
              to="/shop?category=western-wears"
              className="text-xs font-bold text-gray-600 hover:text-primary transition-colors tracking-wider uppercase"
            >
              Western
            </Link>
            <Link
              to="/shop?category=churidar-sets"
              className="text-xs font-bold text-gray-600 hover:text-primary transition-colors tracking-wider uppercase"
            >
              Churidar
            </Link>
          </div>

          {/* Search, Cart, Profile Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Input - Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative max-w-[160px] md:max-w-[200px]">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-3 pr-7 py-1 border border-primary-200 rounded-full text-[11px] bg-primary-50/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:w-[180px] md:focus:w-[240px] transition-all duration-300"
                value={liveQuery}
                onChange={(e) => setLiveQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-2.5 text-gray-400 hover:text-primary cursor-pointer">
                <Search size={12} />
              </button>
            </form>

            {/* Mobile Only Search Icon */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex sm:hidden p-2 text-gray-600 hover:text-primary hover:bg-primary-50 rounded-full transition-all cursor-pointer"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary hover:bg-primary-50 rounded-full transition-all"
            >
              <ShoppingBag size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-extrabold text-white">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Login */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-primary-50 text-gray-600 hover:text-primary cursor-pointer transition-all focus:outline-none"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover border border-primary-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary flex items-center justify-center text-[10px] font-bold border border-primary-200 uppercase">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : <User size={12} />}
                      </div>
                    )}
                    <span className="text-[10px] sm:text-xs font-bold pl-0.5">
                      {user?.name ? user.name.split(' ')[0] : 'Account'}
                    </span>
                  </button>

                  {/* Dropdown Card */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-primary-100 rounded-2xl shadow-pink-md py-1.5 z-50 text-left">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-800 truncate">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <Settings size={14} />
                        Profile Settings
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <Package size={14} />
                        Manage Orders
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <Heart size={14} />
                        My Wishlist ({wishlistItemsCount})
                      </Link>

                      <Link
                        to="/my-reviews"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                      >
                        <Star size={14} />
                        My Reviews
                      </Link>

                      {user?.role === 'admin' && (
                        <a
                          href="http://localhost:5174/admin"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary-50 transition-colors"
                        >
                          <User size={14} />
                          Admin Console
                        </a>
                      )}

                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer border-t border-gray-100 mt-1"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-full shadow-pink-sm transition-all cursor-pointer"
                >
                  <User size={14} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-100 bg-white px-4 pt-2 pb-4 space-y-2 text-left">
          {/* Mobile search bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-3 pr-8 py-2 border border-primary-200 rounded-xl text-xs bg-primary-50/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={liveQuery}
              onChange={(e) => setLiveQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-primary">
              <Search size={16} />
            </button>
          </form>

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-3 mb-1">Catalog</p>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              to="/shop?category=western-wears"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
            >
              Western Wear
            </Link>
            <Link
              to="/shop?category=churidar-sets"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
            >
              Churidar Sets
            </Link>
          </div>

          <div className="border-t border-gray-100 my-2 pt-2 space-y-1">
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-3 mb-1">User Account</p>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  Profile Settings
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  Manage Orders
                </Link>
                <Link
                  to="/my-reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  My Reviews
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  My Wishlist ({wishlistItemsCount})
                </Link>
                {user?.role === 'admin' && (
                  <a
                    href="http://localhost:5174/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-3 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary-50 transition-colors"
                  >
                    Admin Console ⚙️
                  </a>
                )}
                <button
                  onClick={() => {
                    handleLogoutClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
