import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore.js';
import { useCartStore } from './store/cartStore.js';
import { useWishlistStore } from './store/wishlistStore.js';
import { Sparkles, ShoppingBag, ArrowRight, X } from 'lucide-react';

// Layout Elements
import Navbar from './components/layout/Navbar.jsx';
import BottomNavigation from './components/layout/BottomNavigation.jsx';
import Footer from './components/layout/Footer.jsx';
import Spinner from './components/ui/Spinner.jsx';
import ScrollToTop from './components/ui/ScrollToTop.jsx';
import Logo from './components/ui/Logo.jsx';

// Route Wrappers
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import GuestRoute from './routes/GuestRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import SearchResults from './pages/SearchResults.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Profile from './pages/Profile.jsx';
import AddressManager from './pages/AddressManager.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import MyReviews from './pages/MyReviews.jsx';
import TermsConditions from './pages/TermsConditions.jsx';
import OAuthSuccess from './pages/OAuthSuccess.jsx';

function App() {
  const { checkAuth, isAuthenticated, isLoading, user } = useAuthStore();
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const [showPopup, setShowPopup] = useState(false);

  // 1. Trigger session check on startup
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Fetch cart/wishlist items once auth check is settled
  useEffect(() => {
    if (!isLoading) {
      fetchCart(isAuthenticated);
      fetchWishlist(isAuthenticated);
    }
  }, [isAuthenticated, isLoading, fetchCart, fetchWishlist]);

  // 3. Welcome popup on login
  useEffect(() => {
    if (!isLoading && isAuthenticated && sessionStorage.getItem('showWelcomePopup') === 'true') {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        sessionStorage.removeItem('showWelcomePopup');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  const handleClosePopup = () => {
    setShowPopup(false);
    sessionStorage.removeItem('showWelcomePopup');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFF5F9]">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-xs font-semibold text-primary font-dancing text-xl">Loading Girly Fashion...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <AppContent
        showPopup={showPopup}
        handleClosePopup={handleClosePopup}
        user={user}
      />
    </Router>
  );
}

function AppContent({ showPopup, handleClosePopup, user }) {
  const location = useLocation();
  const isOAuthSuccessPage = location.pathname === '/oauth-success';
  const isProductPage = location.pathname.startsWith('/products/');
  const hideFooter = ['/login', '/forgot-password', '/oauth-success'].includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF5F9] font-poppins relative">
      {/* Toast alerts */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'white',
            color: '#1A1A1A',
            border: '1px solid #FFCCE5',
            fontSize: '12px',
            fontWeight: '600',
            borderRadius: '9999px',
          },
        }}
      />

      {/* Global Navigation Header - Hidden on Product Detail Page */}
      {!isProductPage && !isOAuthSuccessPage && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-grow max-w-7xl w-full mx-auto px-0 sm:px-4 ${hideFooter ? 'pb-24 md:pb-0' : 'pb-0'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPassword />
              </GuestRoute>
            }
          />
          
          {/* Shopping & Catalog Cart */}
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          {/* Protected Checkout & User Profiles */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-success"
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedRoute>
                <AddressManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrderHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reviews"
            element={
              <ProtectedRoute>
                <MyReviews />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Bottom Navigation on Mobile */}
      <BottomNavigation />

      {/* Footer */}
      {!hideFooter && <Footer />}

      {/* Welcome message popup modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-9999 animate-fade-in">
          <div className="relative w-full max-w-md bg-white/95 rounded-3xl border border-primary-100 shadow-[0_25px_60px_rgba(232,0,111,0.3)] text-center flex flex-col items-center p-8 gap-5 overflow-hidden animate-scale-up">
            {/* Decorative top pink wave/accent line */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary via-primary-300 to-primary" />

            {/* Cancel Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 p-2 rounded-full bg-primary-50/50 hover:bg-primary-100 text-gray-400 hover:text-primary transition-all duration-300 cursor-pointer shadow-pink-sm"
              title="Close"
            >
              <X size={16} className="stroke-[3]" />
            </button>

            {/* Brand Logo Emblem */}
            <div className="w-28 h-28 flex items-center justify-center">
              <Logo showCircle={true} showSubtitle={false} size="h-28" />
            </div>

            {/* Welcome text details */}
            <div className="space-y-1">
              <h3 className="font-playfair text-xl sm:text-2xl font-black text-gray-800">
                Hello <span className="text-primary font-black uppercase tracking-wider">{user?.name?.split(' ')[0] || 'Dear'}</span>! 🌸
              </h3>
              <p className="text-xs text-gray-400 font-semibold italic">
                Kollengode, Kerala 💖 We have curated fresh styles for you!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full justify-center mt-2">
              <Link
                to="/shop"
                onClick={handleClosePopup}
                className="flex-1 max-w-[150px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-full shadow-pink-md hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <ShoppingBag size={12} />
                <span>Shop Now</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                to="/wishlist"
                onClick={handleClosePopup}
                className="flex-1 max-w-[150px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-primary-200 text-gray-700 hover:text-primary hover:bg-primary-50 text-xs font-black rounded-full shadow-pink-sm hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <span>My Wishlist</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
