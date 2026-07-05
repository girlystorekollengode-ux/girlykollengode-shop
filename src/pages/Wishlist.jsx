import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../store/wishlistStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const { isAuthenticated } = useAuthStore();
  const { wishlistItems, toggleWishlist, fetchWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  // Sync latest on render
  useEffect(() => {
    fetchWishlist(isAuthenticated);
  }, [isAuthenticated]);

  const handleRemove = (product) => {
    toggleWishlist(product, isAuthenticated);
    toast.success('Removed from wishlist');
  };

  const handleQuickAdd = (product) => {
    const size = product.sizes?.[0] || 'M';
    const color = product.colors?.[0] || 'Pink';
    addToCart(product, 1, size, color, isAuthenticated);
    toast.success(`${product.name} added to cart! 🛍️`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-primary-50 pb-4 text-left">
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
          <Heart size={24} className="text-primary fill-primary" />
          <span>My Wishlist</span>
        </h1>
        <p className="text-[11px] text-gray-500 font-medium mt-1">
          Review saved favorites and move them to checkout.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-primary-50 p-12 text-center text-gray-400 shadow-pink-sm space-y-4">
          <Heart size={48} className="mx-auto text-gray-300" />
          <p className="text-xs font-semibold">Your wishlist is empty</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm transition-colors animate-pulse"
          >
            <span>Browse Products Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {wishlistItems.map((prod) => {
            const salePrice = prod.discountPrice || prod.price;
            const hasDiscount = salePrice < prod.price;

            return (
              <div
                key={prod._id}
                className="bg-white rounded-2xl border border-primary-50 hover:border-primary-100 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 relative flex flex-col overflow-hidden group"
              >
                {/* Image aspect ratio container */}
                <Link to={`/products/${prod._id}`} className="relative block overflow-hidden aspect-[3/4]">
                  <img
                    src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />
                  {/* Delete button absolute */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(prod);
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-red-500 shadow-pink-sm cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </Link>

                {/* Details info */}
                <div className="p-4 space-y-1 flex-1 flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider">
                    {prod.category?.name || 'Collection'}
                  </span>
                  <Link
                    to={`/products/${prod._id}`}
                    className="text-xs font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1 block"
                  >
                    {prod.name}
                  </Link>

                  <div className="flex items-center gap-2 pt-2 mt-auto">
                    <span className="text-xs font-black text-primary">₹{salePrice}</span>
                    {hasDiscount && (
                      <span className="text-[10px] text-gray-400 line-through">₹{prod.price}</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleQuickAdd(prod)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded-full shadow-pink-sm cursor-pointer transition-colors mt-3"
                  >
                    <ShoppingBag size={12} />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
