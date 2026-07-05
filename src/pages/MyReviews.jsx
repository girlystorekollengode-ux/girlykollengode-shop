import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import { Trash2, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner.jsx';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteReviewId, setDeleteReviewId] = useState(null);

  const fetchMyReviews = async () => {
    try {
      const { data } = await api.get('/reviews/my/reviews');
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleDelete = (id) => {
    setDeleteReviewId(id);
  };

  const confirmDelete = async () => {
    if (!deleteReviewId) return;
    try {
      const { data } = await api.delete(`/reviews/${deleteReviewId}`);
      if (data.success) {
        toast.success('Review deleted successfully 💗');
        setReviews(reviews.filter((r) => r._id !== deleteReviewId));
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setDeleteReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="text-left space-y-1">
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">My Reviews</h1>
        <p className="text-xs text-gray-500 font-medium">
          Manage and track all the product reviews you have shared
        </p>
        <div className="w-12 h-0.5 bg-primary rounded-full mt-2" />
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-primary-50 space-y-4 max-w-md mx-auto shadow-pink-sm mt-8">
          <div className="text-4xl text-primary">✍️</div>
          <h3 className="text-base font-bold text-gray-800">No Reviews Posted Yet</h3>
          <p className="text-xs text-gray-400 font-medium px-4">
            You haven't shared your experience on any purchases yet. Your reviews help others choose the best styles!
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-pink-sm hover:bg-primary-dark transition-all"
          >
            <span>Review Purchased Items</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const product = rev.product;
            if (!product) return null;

            const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200';

            return (
              <div
                key={rev._id}
                className="bg-white rounded-2xl border border-primary-50 p-4 flex gap-4 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 relative text-left"
              >
                {/* Product Image Thumbnail */}
                <Link to={`/products/${product._id}`} className="w-16 h-20 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
                </Link>

                {/* Content details */}
                <div className="flex-grow flex flex-col justify-between py-0.5 min-w-0">
                  <div className="space-y-1">
                    <Link
                      to={`/products/${product._id}`}
                      className="text-xs sm:text-sm font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>

                    {/* Star ratings */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-gray-600 font-medium line-clamp-2 pr-8 mt-1">
                      "{rev.comment}"
                    </p>
                  </div>

                  <p className="text-[10px] text-gray-400 font-semibold mt-2 sm:mt-0">
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(rev._id)}
                  className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

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
                Are you sure you want to delete this review? This action is permanent and cannot be undone. 🥺
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
                onClick={confirmDelete}
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

export default MyReviews;
