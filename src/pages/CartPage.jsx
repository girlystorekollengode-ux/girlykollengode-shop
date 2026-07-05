import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import api from '../api/axios.js';
import { ShoppingBag, ArrowRight, Trash2, Tag, Percent } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal } = useCartStore();

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount }
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getCartSubtotal();

  // Free delivery above ₹999, else ₹50 shipping
  const shippingFee = subtotal > 999 || subtotal === 0 ? 0 : 50;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  const handleQtyChange = (itemId, currentQty, amount) => {
    updateQuantity(itemId, currentQty + amount, isAuthenticated);
  };

  const handleRemove = (itemId) => {
    removeFromCart(itemId, isAuthenticated);
    toast.success('Product removed from bag');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to apply coupons');
      return;
    }
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const { data } = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase().trim(),
        orderAmount: subtotal,
      });

      if (data.success) {
        setAppliedCoupon({
          code: couponCode.toUpperCase().trim(),
          discount: data.discountAmount,
        });
        toast.success(`Coupon "${couponCode.toUpperCase()}" applied successfully! Save ₹${data.discountAmount} 🏷️`);
        setCouponCode('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code or expired');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckoutClick = () => {
    if (cartItems.length === 0) {
      toast.error('Your shopping bag is empty');
      return;
    }

    // Pass coupon information along via state if applied
    navigate('/checkout', {
      state: {
        appliedCoupon: appliedCoupon,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-primary-50 pb-4 text-left">
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800 flex items-center gap-2">
          <ShoppingBag size={24} className="text-primary" />
          <span>Shopping Bag</span>
        </h1>
        <p className="text-[11px] text-gray-500 font-medium mt-1">
          Review your items and proceed to shipping.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-primary-50 p-12 text-center text-gray-400 shadow-pink-sm space-y-4">
          <ShoppingBag size={48} className="mx-auto text-gray-300 animate-bounce" />
          <p className="text-xs font-semibold">Your shopping bag is empty</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cart items list */}
          <div className="lg:col-span-2 space-y-4 text-left">
            {cartItems.map((item) => {
              const product = item.product || {};
              const imageUrl =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200';
              const price = product.discountPrice || product.price || 0;

              return (
                <div
                  key={item._id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-primary-50 hover:border-primary-100 shadow-pink-sm transition-all flex gap-4"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${product._id}`}
                    className="aspect-[3/4] w-20 rounded-xl overflow-hidden bg-primary-50/20 shrink-0"
                  >
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover object-top" />
                  </Link>

                  {/* Content detail */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/products/${product._id}`}
                          className="text-xs font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
                        {product.category?.name || 'Outfit'}
                      </p>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-500 font-semibold">
                        <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                        <span>Color: <strong className="text-gray-700">{item.color}</strong></span>
                      </div>
                    </div>

                    {/* Qty and price modifiers */}
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-primary-50/50">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQtyChange(item._id, item.qty, -1)}
                          className="px-2 py-0.5 border border-primary-100 rounded-full text-[10px] font-bold hover:bg-primary-50 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-gray-700">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item._id, item.qty, 1)}
                          className="px-2 py-0.5 border border-primary-100 rounded-full text-[10px] font-bold hover:bg-primary-50 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-black text-primary">
                        ₹{price * item.qty}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order summary & coupons */}
          <div className="space-y-6 text-left">
            {/* Promo coupons verification box */}
            <div className="bg-white p-5 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5">
                <Tag size={14} className="text-primary" />
                <span>Apply Promo Code</span>
              </h3>

              {appliedCoupon ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-green-700 font-bold">
                    <Percent size={14} />
                    <span>"{appliedCoupon.code}" Applied</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-red-500 hover:text-red-700 font-bold text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    disabled={!isAuthenticated}
                    placeholder={isAuthenticated ? "WELCOM50, etc." : "Login to apply coupon"}
                    className="flex-1 px-3 py-1.5 border border-primary-200 rounded-xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase min-w-0"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !isAuthenticated}
                    className="w-full sm:w-auto px-4 py-1.5 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white text-xs font-bold rounded-xl shadow-pink-sm cursor-pointer transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Invoicing Details card */}
            <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
              <h3 className="font-playfair text-sm font-bold text-gray-800 pb-2 border-b border-primary-50">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-800 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Delivery</span>
                  <span className="text-gray-800 font-bold">
                    {shippingFee === 0 ? <strong className="text-green-600 font-bold">FREE</strong> : `₹${shippingFee}`}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ("{appliedCoupon.code}")</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="border-t border-primary-50/50 pt-3 flex justify-between text-sm text-gray-800 font-black">
                  <span>Estimated Total</span>
                  <span className="text-primary text-md">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer transition-colors mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>

              {shippingFee > 0 && (
                <p className="text-[10px] text-center text-primary font-bold">
                  Add ₹{1000 - subtotal} more to unlock FREE DELIVERY! 🍀
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
