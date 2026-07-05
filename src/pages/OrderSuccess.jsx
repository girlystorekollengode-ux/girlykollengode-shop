import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/ui/Spinner.jsx';
import { CheckCircle, Truck, Package, ShoppingBag, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        if (data.success) {
          setOrder(data.data);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-500 font-semibold text-sm">Order information could not be retrieved.</p>
        <Link to="/shop" className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-full">
          Return to Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8 text-left">
      {/* Visual Success card */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-primary-100 shadow-pink-md text-center space-y-6">
        <div className="inline-flex p-4 bg-green-50 rounded-full text-green-500 mb-2">
          <CheckCircle size={48} className="fill-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-playfair text-3xl font-black text-gray-800">
            Order Confirmed!
          </h1>
          <p className="text-xs text-gray-500 font-semibold max-w-sm mx-auto leading-relaxed">
            Thank you for shopping at Girly. We've verified your payment and are preparing your wardrobe!
          </p>
        </div>

        {/* Order details capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-xs font-semibold text-gray-500">
          <div className="bg-primary-50/20 border border-primary-50 p-3 rounded-2xl">
            <p className="text-[10px] text-gray-400 uppercase font-black">Order ID</p>
            <p className="text-gray-800 mt-0.5 truncate select-all">{order._id}</p>
          </div>
          <div className="bg-primary-50/20 border border-primary-50 p-3 rounded-2xl">
            <p className="text-[10px] text-gray-400 uppercase font-black">Final Amount Paid</p>
            <p className="text-primary font-extrabold mt-0.5">₹{order.finalAmount}</p>
          </div>
        </div>

        {/* Shipping tracking timeline */}
        <div className="bg-primary-50/20 border border-primary-50 p-4 rounded-2xl max-w-md mx-auto flex gap-3 text-left">
          <Truck className="text-primary shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-xs font-bold text-gray-800">Estimated Delivery: 3 - 5 Days</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
              Shipping to {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Review ordered items */}
      <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
        <h3 className="font-playfair text-md font-bold text-gray-800 pb-2 border-b border-primary-50 flex items-center gap-2">
          <Package size={16} className="text-primary" />
          <span>Purchased Items</span>
        </h3>

        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item._id} className="flex gap-4 items-center justify-between border-b border-gray-50 pb-3 last:border-b-0 last:pb-0">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-12 rounded-lg bg-primary-50 overflow-hidden shrink-0 border border-primary-50">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">{item.name}</span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    Size: {item.size} • Color: {item.color} • Qty {item.qty}
                  </span>
                </div>
              </div>
              <span className="text-xs font-black text-gray-700">₹{item.price * item.qty}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons footer */}
      <div className="flex justify-center gap-4">
        <Link
          to="/orders"
          className="px-6 py-2.5 border border-primary text-primary hover:bg-primary-50 text-xs font-bold rounded-full transition-all"
        >
          View Order History
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm transition-all"
        >
          <span>Continue Shopping</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
