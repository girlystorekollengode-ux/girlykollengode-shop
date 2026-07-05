import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useCartStore } from '../../store/cartStore.js';
import { useAuthStore } from '../../store/authStore.js';
import toast from 'react-hot-toast';

const ProductCard = ({ product, layout = 'grid', hideVariants = false }) => {
  const { isAuthenticated } = useAuthStore();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isLiked = useWishlistStore((state) => state.isWishlisted(product._id));
  const addToCart = useCartStore((state) => state.addToCart);

  const originalPrice = product.price || 0;
  const salePrice = product.discountPrice || originalPrice;
  const hasDiscount = salePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const isNew = product.createdAt && new Date(product.createdAt) >= oneWeekAgo;

  const handleLikeToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to wishlist products 💖');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    toggleWishlist(product, isAuthenticated);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist 💖');
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Default select first size and color
    const defaultSize = product.sizes?.[0] || 'M';
    const defaultColor = product.colors?.[0] || 'Pink';

    addToCart(product, 1, defaultSize, defaultColor, isAuthenticated);
    toast.success(`${product.name} added to cart! 🛍️`);
  };

  // Safe image url helper
  const imageUrl =
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400';

  if (layout === 'list') {
    return (
      <div className="group bg-white rounded-2xl border border-primary-50 hover:border-primary-100 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 relative overflow-hidden flex flex-row sm:flex-col h-32 sm:h-full text-left">
        {/* Product Image Area */}
        <Link to={`/products/${product._id}`} className="relative block overflow-hidden w-28 sm:w-full h-full sm:aspect-[3/4] bg-primary-50/20 shrink-0">
          {/* Badges Container */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
            {isNew && (
              <span className="bg-primary-100 text-primary-dark border border-primary-200 text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 uppercase tracking-widest rounded-full shadow-pink-sm">
                New
              </span>
            )}
            {hasDiscount && (
              <span className="bg-primary text-white text-[7px] sm:text-[9px] font-black px-1.5 py-0.5 uppercase tracking-widest rounded-full shadow-pink-sm">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Wishlist Toggle Button */}
          <button
            onClick={handleLikeToggle}
            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-primary z-10 shadow-pink-sm transition-all focus:outline-none cursor-pointer"
          >
            <Heart size={13} className={isLiked ? 'fill-primary text-primary' : ''} />
          </button>

          {/* Hover zoom Image */}
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Sizes Overlay at bottom of image */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-xs py-1 px-1.5 flex gap-1 justify-center z-10">
              {product.sizes.map((s) => (
                <span key={s} className="text-[8px] sm:text-[9px] font-black text-primary border border-primary-200 px-1 bg-[#FFF5F9] rounded-sm shadow-pink-xs">
                  {s}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Info Content Section */}
        <div className="p-3 flex flex-col flex-grow min-w-0 justify-between sm:justify-start sm:space-y-1.5">
          <div className="space-y-0.5 sm:space-y-1">
            {/* Category Tag */}
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-bold block">
              {product.category?.name || 'Collection'}
            </span>

            {/* Title */}
            <Link to={`/products/${product._id}`} className="block">
              <h3 className="text-sm sm:text-base font-extrabold text-gray-800 whitespace-normal break-words group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Colors line */}
            {!hideVariants && product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 font-semibold mt-1">
                <span>Varient:</span>
                <span className="truncate max-w-[140px] font-black text-gray-700">{product.colors.join(', ')}</span>
              </div>
            )}

            {/* Sizing Details - hidden on mobile to prevent lengthy/stretched cards */}
            <p className="hidden sm:block text-[10px] text-gray-400 line-clamp-2 min-h-[30px]">
              {product.description}
            </p>
          </div>

          {/* Price list & Quick add */}
          <div className="flex items-center justify-between pt-1 border-t border-primary-50 sm:mt-auto">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-gray-400 line-through font-semibold">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-sm sm:text-base font-black text-primary">
                ₹{salePrice}
              </span>
            </div>

            {/* Quick checkout add */}
            <button
              onClick={handleQuickAdd}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white text-[9px] sm:text-[10px] font-bold rounded-full transition-colors cursor-pointer shadow-pink-sm"
              title="Add to Cart"
            >
              <ShoppingBag size={10} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-primary-50 hover:border-primary-100 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 relative overflow-hidden flex flex-col h-full text-left">
      {/* Product Image Area */}
      <Link to={`/products/${product._id}`} className="relative block overflow-hidden aspect-[3/4] bg-primary-50/20">
        {/* Badges Container */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {isNew && (
            <span className="bg-primary-100 text-primary-dark border border-primary-200 text-[8px] sm:text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-full shadow-pink-sm">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-primary text-white text-[8px] sm:text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-full shadow-pink-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Toggle Button */}
        <button
          onClick={handleLikeToggle}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-primary z-10 shadow-pink-sm transition-all focus:outline-none cursor-pointer"
        >
          <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
        </button>

        {/* Hover zoom Image */}
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Sizes Overlay at bottom of image */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 bg-white/80 backdrop-blur-xs py-1 px-3 flex gap-1.5 justify-center z-10">
            {product.sizes.map((s) => (
              <span key={s} className="text-[9px] sm:text-[10px] font-black text-primary border border-primary-200 px-1.5 py-0.5 bg-[#FFF5F9] rounded-sm shadow-pink-sm">
                {s}
              </span>
            ))}
          </div>
        )}
      </Link>


      {/* Info Content Section */}
      <div className="p-2 sm:p-4 flex flex-col flex-1 space-y-1 sm:space-y-1.5">
        {/* Category Tag */}
        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-primary font-bold">
          {product.category?.name || 'Collection'}
        </span>

        {/* Title */}
        <Link to={`/products/${product._id}`} className="block">
          <h3 className="text-sm sm:text-base font-extrabold text-gray-800 whitespace-normal break-words group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Colors line */}
        {!hideVariants && product.colors && product.colors.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-500 font-semibold mt-1">
            <span>Varient:</span>
            <span className="truncate max-w-[140px] font-black text-gray-700">{product.colors.join(', ')}</span>
          </div>
        )}

        {/* Sizing Details - hidden on mobile to prevent lengthy/stretched cards */}
        <p className="hidden sm:block text-[10px] text-gray-400 line-clamp-2 min-h-[30px]">
          {product.description}
        </p>

        {/* Price list & Quick add */}
        <div className="flex items-center justify-between mt-auto pt-1 sm:pt-2 border-t border-primary-50">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] sm:text-xs text-gray-400 line-through font-semibold">
                ₹{originalPrice}
              </span>
            )}
            <span className="text-sm sm:text-base font-black text-primary">
              ₹{salePrice}
            </span>
          </div>

          {/* Quick checkout add */}
          <button
            onClick={handleQuickAdd}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded-full transition-colors cursor-pointer shadow-pink-sm"
            title="Add to Cart"
          >
            <ShoppingBag size={11} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
