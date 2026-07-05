import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RefreshCw, Send, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const isLiked = useWishlistStore((state) => state.isWishlisted(id));

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selector choices
  const [selectedImg, setSelectedImg] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Swipeable media gallery states
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const mediaContainerRef = useRef(null);

  // Review submission state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const fetchProductDetails = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      if (data.success) {
        setProduct(data.data);
        setSelectedImg(data.data.images?.[0]?.url || '');
        setSelectedSize(data.data.sizes?.[0] || 'M');
        setSelectedColor(data.data.colors?.[0] || 'Pink');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found or unavailable');
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await api.get(`/reviews/${id}`);
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([fetchProductDetails(), fetchReviews()]);
      setLoading(false);
    };
    initData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor, isAuthenticated);
    toast.success(`${product.name} (${selectedSize}, ${selectedColor}) added to cart! 🛍️`);
  };

  const handleLikeToggle = () => {
    if (!product) return;
    if (!isAuthenticated) {
      toast.error('Please login to wishlist products 💖');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    toggleWishlist(product, isAuthenticated);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist! 💖');
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setReviewLoading(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      if (data.success) {
        toast.success('Thank you for your review! 💖');
        setReviewComment('');
        setReviewRating(5);
        fetchReviews(); // Refresh list
        fetchProductDetails(); // Refresh average rating
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    setDeleteReviewId(reviewId);
  };

  const confirmDeleteReview = async () => {
    if (!deleteReviewId) return;
    try {
      const { data } = await api.delete(`/reviews/${deleteReviewId}`);
      if (data.success) {
        toast.success('Review deleted successfully 💗');
        fetchReviews();
        fetchProductDetails();
      }
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setDeleteReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-semibold text-sm">Product not found.</p>
        <Link to="/shop" className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }
  // Calculate average rating
  const ratingsList = product.ratings || [];
  const avgRating =
    ratingsList.reduce((sum, r) => sum + r.value, 0) / (ratingsList.length || 1) || 0;

  // Build combined media list (images + videos)
  const imagesList = product.images || [];
  const videosList = product.videos || [];
  const mediaItems = [
    ...imagesList.map((img) => ({ type: 'image', url: img.url || img })),
    ...videosList.map((vid) => ({ type: 'video', url: vid.url || vid })),
  ];
  if (mediaItems.length === 0) {
    mediaItems.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600',
    });
  }

  // Scroll handler for dots sync
  const handleScroll = (e) => {
    const container = e.target;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    if (width > 0) {
      const index = Math.round(scrollLeft / width);
      setActiveMediaIndex(index);
    }
  };

  const handleThumbnailClick = (idx) => {
    setActiveMediaIndex(idx);
    if (mediaContainerRef.current) {
      const width = mediaContainerRef.current.clientWidth;
      mediaContainerRef.current.scrollTo({
        left: idx * width,
        behavior: 'smooth',
      });
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4 space-y-4">
      {/* Top Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 text-left">
        {/* Left Column: Image gallery */}
        <div className="space-y-3">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden border border-primary-50 bg-white relative">
            {/* Back to Shop Link as absolute overlay */}
            <Link
              to="/shop"
              className="absolute top-4 left-4 z-25 inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-700 hover:text-primary transition-all duration-300 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-primary-100 shadow-pink-sm"
            >
              <ArrowLeft size={12} />
              <span>Back to Shop</span>
            </Link>

            {/* Carousel navigation chevrons */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={() => handleThumbnailClick(Math.max(0, activeMediaIndex - 1))}
                  disabled={activeMediaIndex === 0}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-primary shadow-pink-md z-20 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={18} className="stroke-[3]" />
                </button>
                <button
                  onClick={() => handleThumbnailClick(Math.min(mediaItems.length - 1, activeMediaIndex + 1))}
                  disabled={activeMediaIndex === mediaItems.length - 1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-primary shadow-pink-md z-20 disabled:opacity-30 disabled:pointer-events-none transition-all duration-300 cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={18} className="stroke-[3]" />
                </button>
              </>
            )}

            <div
              ref={mediaContainerRef}
              onScroll={handleScroll}
              className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {mediaItems.map((item, idx) => (
                <div key={idx} className="w-full h-full shrink-0 snap-center relative">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      controls
                      playsInline
                      className="w-full h-full object-contain object-center bg-white"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={product.name}
                      className="w-full h-full object-contain object-center bg-white"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Flipkart style Dot Indicators */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-15">
                {mediaItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${activeMediaIndex === idx ? 'bg-primary w-4 shadow-pink-sm' : 'bg-gray-300/80 w-2 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`aspect-[3/4] w-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 relative block bg-white ${activeMediaIndex === index
                    ? 'border-primary shadow-pink-sm'
                    : 'border-primary-100 hover:border-primary-200'
                    }`}
                >
                  {item.type === 'video' ? (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[8px] font-bold pl-0.5 shadow-pink-sm">▶</span>
                      </div>
                    </div>
                  ) : (
                    <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-contain object-center bg-white" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Descriptions & Actions */}
        <div className="space-y-4 flex flex-col justify-start">
          <div className="space-y-2">
            {/* Category tag */}
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
              {product.category?.name || 'Collection'}
            </span>
            <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">
              {product.name}
            </h1>

            {/* Ratings summary */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={star <= Math.round(avgRating) ? 'fill-amber-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-700">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-gray-400 font-medium">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Pricing area */}
          <div className="p-4 bg-primary-50/50 rounded-2xl border border-primary-50 inline-flex items-center gap-3 self-start">
            {product.discountPrice < product.price && (
              <span className="text-xs text-gray-400 line-through font-bold">
                ₹{product.price}
              </span>
            )}
            <span className="text-xl font-extrabold text-primary">
              ₹{product.discountPrice || product.price}
            </span>
            {product.discountPrice < product.price && (
              <span className="bg-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                Sale Discount
              </span>
            )}
          </div>

          {/* Description text */}
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            {product.description}
          </p>

          {/* Selector chips */}
          <div className="space-y-4 pt-2 border-t border-primary-50">
            {/* Sizing selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 flex items-center justify-center text-xs font-black rounded-lg border-2 transition-all cursor-pointer ${selectedSize === s
                        ? 'border-primary bg-primary-50/10 text-primary shadow-pink-sm font-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-200 hover:text-primary font-bold'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Select Color
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 flex items-center justify-center text-xs font-bold rounded-lg border-2 transition-all cursor-pointer ${selectedColor === c
                        ? 'border-primary bg-primary-50/10 text-primary shadow-pink-sm font-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-200 hover:text-primary font-semibold'
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity select */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Quantity
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 border border-primary-200 rounded-full text-xs font-bold hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1 border border-primary-200 rounded-full text-xs font-bold hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  +
                </button>
                <span className="text-[10px] text-gray-400 font-bold ml-2">
                  ({product.stock} items left in stock)
                </span>
              </div>
            </div>
          </div>

          {/* Add actions buttons */}
          <div className="flex gap-3 pt-4 border-t border-primary-50">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer transition-all disabled:cursor-not-allowed"
            >
              <ShoppingBag size={16} />
              <span>{product.stock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}</span>
            </button>

            <button
              onClick={handleLikeToggle}
              className="px-4 py-3 border border-primary-200 hover:border-primary text-gray-600 hover:text-primary rounded-full transition-all cursor-pointer focus:outline-none bg-white shadow-pink-sm"
              title="Add to Wishlist"
            >
              <Heart size={16} className={isLiked ? 'fill-primary text-primary' : ''} />
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 bg-primary-50/20 p-4 rounded-2xl border border-primary-50 text-[10px] font-semibold text-gray-500">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-primary" />
              <span>Express Delivery across Kerala</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span>No Returns or Cancellations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews feed block */}
      <div className="border-t border-primary-100 pt-12 text-left">
        <h2 className="font-playfair text-xl font-black text-gray-800 mb-8">
          Customer Reviews ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Post review panel */}
          <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm self-start space-y-4">
            <h3 className="font-playfair text-sm font-bold text-gray-800">
              Write a Product Review
            </h3>
            {isAuthenticated ? (
              <form onSubmit={handlePostReview} className="space-y-4">
                {/* Rating selection */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Select Rating
                  </span>
                  <div className="flex gap-1.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="cursor-pointer focus:outline-none"
                      >
                        <Star
                          size={18}
                          className={star <= reviewRating ? 'fill-amber-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment text area */}
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    Your Review
                  </span>
                  <textarea
                    required
                    placeholder="Describe your experience with this outfit..."
                    rows={4}
                    className="w-full p-3 border border-primary-200 rounded-2xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent resize-none"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer disabled:opacity-75 transition-all"
                >
                  {reviewLoading ? (
                    <Spinner size="xs" />
                  ) : (
                    <>
                      <Send size={12} />
                      <span>Submit Review</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-primary-50/50 rounded-2xl text-xs font-medium text-gray-500 text-center space-y-2">
                <p>Please log in to write a product review.</p>
                <Link
                  to="/login"
                  className="inline-block text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  Log in today
                </Link>
              </div>
            )}
          </div>

          {/* Reviews listing feed */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="bg-white/50 rounded-3xl border border-primary-50 p-12 text-center text-gray-400 font-medium text-xs">
                No reviews yet for this product. Be the first to share your experience!
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white p-5 rounded-2xl border border-primary-50 shadow-pink-sm relative text-left"
                  >
                    {/* User profile header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {rev.user?.name ? rev.user.name[0] : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">
                            {rev.user?.name || 'Customer'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-semibold">
                            {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={10}
                            className={star <= rev.rating ? 'fill-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-gray-600 leading-relaxed font-medium mt-3.5 pl-0.5">
                      {rev.comment}
                    </p>

                    {/* Delete actions (only review owner or admin) */}
                    {user && (user._id === rev.user?._id || user.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="absolute right-4 bottom-4 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteReviewId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-9999 animate-fade-in">
          <div className="relative w-full max-w-sm bg-white/95 rounded-3xl border border-primary-100 shadow-[0_20px_50px_rgba(232,0,111,0.2)] text-center flex flex-col items-center p-6 gap-4 overflow-hidden animate-scale-up">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 via-primary-300 to-red-500" />

            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 animate-pulse">
              <Trash2 size={22} className="stroke-[2.5]" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="font-playfair text-lg font-black text-gray-800">
                Delete Review?
              </h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Are you sure you want to delete your review? This action is permanent and cannot be undone. 🥺
              </p>
            </div>

            <div className="flex gap-3 w-full mt-2 justify-center">
              <button
                onClick={() => setDeleteReviewId(null)}
                className="flex-1 py-2 px-4 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-black rounded-full transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
