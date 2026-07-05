import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  Check,
  AlertTriangle,
  XCircle,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrderDetail();
  }, [id, isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="mx-auto text-red-500" size={48} />
        <h3 className="text-lg font-bold text-gray-800">Order Not Found</h3>
        <button onClick={() => navigate('/orders')} className="btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  // Determine timeline progress state (like Flipkart)
  const steps = [
    { label: 'Ordered', statusKey: 'pending', desc: 'Order placed successfully' },
    { label: 'Confirmed', statusKey: 'confirmed', desc: 'Order verified & confirmed' },
    { label: 'Packed & Processing', statusKey: 'processing', desc: 'Outfit prepared for shipment' },
    { label: 'Shipped', statusKey: 'shipped', desc: 'Dispatched from Kollengode center' },
    { label: 'Delivered', statusKey: 'delivered', desc: 'Handed over to customer' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-left">
      {/* Back button */}
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to My Orders</span>
      </button>

      {/* Header card info */}
      <div className="bg-white rounded-3xl border border-primary-50 p-6 shadow-pink-sm space-y-4">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Order ID</span>
            <h1 className="text-sm sm:text-base font-black text-gray-800 select-all">{order._id}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" />
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={13} className="text-gray-400" />
                Paid via {order.paymentMethod === 'coupon' ? '100% Coupon' : 'Razorpay Secure'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${isCancelled ? 'bg-red-50 text-red-600 border-red-200' : 'bg-primary-50 text-primary border-primary-100'
              }`}>
              {order.orderStatus}
            </span>
            {/* Payment status badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'
              }`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Flipkart-Style Order Timeline Tracker */}
      <div className="bg-white rounded-3xl border border-primary-50 p-6 md:p-8 shadow-pink-sm space-y-8">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-primary-50 pb-3">
          Delivery Timeline Status
        </h3>

        {isCancelled ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 text-red-700">
            <XCircle size={28} className="shrink-0" />
            <div>
              <p className="text-sm font-bold">This order has been Cancelled</p>
              <p className="text-xs font-medium opacity-90">
                Contact support for any queries or details.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Desktop Horizontal Timeline */}
            <div className="hidden md:flex justify-between items-start relative z-10">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isActive = idx === currentStepIdx;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center text-center px-2 relative">
                    {/* Connecting line */}
                    {idx < steps.length - 1 && (
                      <div
                        className={`absolute top-3.5 left-1/2 right-[-50%] h-[3px] z-[-1] transition-colors duration-500 ${idx < currentStepIdx ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                      />
                    )}

                    {/* Step circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'bg-white border-gray-300 text-gray-400'
                        } ${isActive ? 'scale-110 ring-4 ring-green-100' : ''}`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                      )}
                    </div>

                    {/* Labels */}
                    <div className="mt-3 space-y-0.5">
                      <p className={`text-xs font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[9px] text-gray-400 font-semibold px-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="md:hidden flex flex-col space-y-0 text-left">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isActive = idx === currentStepIdx;

                return (
                  <div key={idx} className="flex gap-4 items-stretch">
                    {/* Circle and vertical line segment */}
                    <div className="flex flex-col items-center shrink-0 w-8">
                      {/* Circle */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                            ? 'bg-green-500 border-green-500 text-white shadow-sm'
                            : 'bg-white border-gray-300 text-gray-400'
                          } ${isActive ? 'ring-4 ring-green-100' : ''}`}
                      >
                        {isCompleted ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      {/* Line connecting to the next step */}
                      {idx < steps.length - 1 && (
                        <div
                          className={`w-[3px] flex-grow my-1 transition-colors duration-500 ${idx < currentStepIdx ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          style={{ minHeight: '36px' }}
                        />
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="pb-6 space-y-0.5">
                      <p className={`text-xs font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Details Grid (Items and Addresses) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products list card */}
        <div className="bg-white rounded-3xl border border-primary-50 p-6 shadow-pink-sm md:col-span-2 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-primary-50 pb-3 flex items-center gap-1.5">
            <ShoppingBag size={14} />
            <span>Items Ordered</span>
          </h3>

          <div className="divide-y divide-primary-50">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <Link to={`/products/${item.product}`} className="w-16 h-20 rounded-xl overflow-hidden bg-primary-50 shrink-0 border border-primary-50 block">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                </Link>

                <div className="flex-grow flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <Link
                      to={`/products/${item.product}`}
                      className="text-xs sm:text-sm font-bold text-gray-800 hover:text-primary transition-colors line-clamp-1 block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[10px] text-gray-400 font-bold">
                      Size: {item.size} • Color: {item.color} • Qty: {item.qty}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-black text-gray-700">₹{item.price} each</span>
                    <Link
                      to={`/products/${item.product}#reviews`}
                      className="text-[10px] font-black text-primary hover:underline"
                    >
                      Write Review
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address & payment card */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-primary-50 p-6 shadow-pink-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-primary-50 pb-3 flex items-center gap-1.5">
              <MapPin size={14} />
              <span>Shipping Address</span>
            </h3>
            <div className="text-xs text-gray-600 space-y-1 font-medium">
              <p className="font-bold text-gray-800">{order.shippingAddress.name}</p>
              <p className="font-bold text-primary-dark">{order.shippingAddress.phone}</p>
              <p className="pt-1">{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p className="font-bold text-gray-800">{order.shippingAddress.pincode}</p>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="bg-white rounded-3xl border border-primary-50 p-6 shadow-pink-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-primary-50 pb-3 flex items-center gap-1.5">
              <FileText size={14} />
              <span>Billing Details</span>
            </h3>
            <div className="space-y-2 text-xs font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{order.totalMRP}</span>
              </div>
              {order.couponCode && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount ({order.couponCode})</span>
                  <span>-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className="border-t border-primary-50 pt-2 flex justify-between font-black text-gray-800 text-sm">
                <span>Final Paid</span>
                <span className="text-primary">₹{order.finalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
