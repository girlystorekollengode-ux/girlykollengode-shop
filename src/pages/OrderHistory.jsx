import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import { Package, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
      toast.error('Failed to load orders history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const getStatusBadge = (status) => {
    const presets = {
      pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      confirmed: 'bg-green-50 text-green-600 border-green-200',
      processing: 'bg-blue-50 text-blue-600 border-blue-200',
      shipped: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      cancelled: 'bg-red-50 text-red-600 border-red-200',
    };
    return presets[status] || 'bg-gray-50 text-gray-600 border-gray-200';
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
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">
          My Purchase Orders
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Track packages shipment status and view details
        </p>
        <div className="w-12 h-0.5 bg-primary rounded-full mt-2" />
      </div>

      {/* Orders List */}
      <div className="text-left">
        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-primary-50 space-y-4 max-w-md mx-auto shadow-pink-sm mt-8">
            <div className="text-4xl text-primary">🛍️</div>
            <h3 className="text-base font-bold text-gray-800">No Orders Placed Yet</h3>
            <p className="text-xs text-gray-400 font-medium px-4">
              You haven't placed any orders yet. Let's find some beautiful styles for you!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-full shadow-pink-sm hover:bg-primary-dark transition-all"
            >
              <span>Start Browsing Catalog</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord._id}
                onClick={() => navigate(`/orders/${ord._id}`)}
                className="bg-white border border-primary-50 rounded-2xl p-5 hover:border-primary-100 hover:shadow-pink-md transition-all duration-300 flex flex-col space-y-4 cursor-pointer relative shadow-pink-sm"
              >
                {/* Header info */}
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-primary-50/50 pb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-black">Order Reference ID</span>
                    <span className="text-xs font-bold text-gray-800 select-all" onClick={(e) => e.stopPropagation()}>
                      {ord._id}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(ord.orderStatus)}`}>
                      {ord.orderStatus}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                      ord.paymentStatus === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      PAYMENT {ord.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Items thumbnails and metadata preview */}
                <div className="space-y-3">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-10 rounded-sm bg-primary-50 overflow-hidden shrink-0 border border-primary-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 line-clamp-1">{item.name}</span>
                          <span className="text-[9px] text-gray-400 font-bold">
                            {item.size} • {item.color} • Qty {item.qty}
                          </span>
                        </div>
                      </div>
                      <span className="font-black text-gray-700">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Pricing details */}
                <div className="flex justify-between items-center pt-3 border-t border-primary-50/50 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Order Placed:</span>
                    <span className="text-xs font-bold text-gray-700">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold block">Final Amount Paid</span>
                      <span className="text-xs font-black text-primary">₹{ord.finalAmount}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
