import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { useCartStore } from '../store/cartStore.js';
import api from '../api/axios.js';
import { MapPin, Phone, User as UserIcon, ShieldCheck, CreditCard, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, addAddress, isAuthenticated } = useAuthStore();
  const { cartItems, getCartSubtotal, clearCartStore } = useCartStore();

  const appliedCoupon = location.state?.appliedCoupon || null;

  // Address Selection States
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('Kerala');
  const [addressPincode, setAddressPincode] = useState('');
  const [addressName, setAddressName] = useState(user?.name || '');
  const [addressPhone, setAddressPhone] = useState(user?.phone || '');

  const [paymentLoading, setPaymentLoading] = useState(false);

  // Protected route check
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [isAuthenticated, navigate]);

  // Lazily load Razorpay script only when this page is visited
  useEffect(() => {
    const existingScript = document.getElementById('razorpay-script');
    if (existingScript) return; // already loaded

    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up when leaving the checkout page
      const s = document.getElementById('razorpay-script');
      if (s) document.body.removeChild(s);
    };
  }, []);

  const subtotal = getCartSubtotal();
  const shippingFee = subtotal > 999 ? 0 : 50;
  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + shippingFee - couponDiscount);

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!addressStreet || !addressCity || !addressPincode) {
      toast.error('Please fill in all address fields');
      return;
    }

    const res = await addAddress({
      label: addressLabel,
      street: addressStreet,
      city: addressCity,
      state: addressState,
      pincode: addressPincode,
    });

    if (res.success) {
      toast.success('Address added to your account');
      setShowAddressForm(false);
      // Select the new address (which gets appended to the end of user.addresses)
      setSelectedAddressIndex((user?.addresses?.length || 0));
      // Reset form
      setAddressStreet('');
      setAddressCity('');
      setAddressPincode('');
    } else {
      toast.error(res.message || 'Failed to save address');
    }
  };

  const handlePayNow = async () => {
    const addresses = user?.addresses || [];
    if (addresses.length === 0) {
      toast.error('Please select or add a delivery shipping address');
      return;
    }

    const selectedAddress = addresses[selectedAddressIndex];
    if (!selectedAddress) {
      toast.error('Selected address is invalid');
      return;
    }

    setPaymentLoading(true);

    const orderPayload = {
      items: cartItems.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || '',
        price: item.product.discountPrice || item.product.price,
        qty: item.qty,
        size: item.size,
        color: item.color,
      })),
      shippingAddress: {
        name: addressName || user?.name,
        phone: addressPhone || user?.phone,
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
      },
      totalMRP: subtotal,
      totalDiscount: 0, // In our setup, MRP is same as price, discount is computed as price vs discountPrice
      deliveryCharge: shippingFee,
      finalAmount: total,
      couponCode: appliedCoupon?.code || '',
      couponDiscount: couponDiscount,
    };

    // If order total is 0 (due to 100% coupon discount & free shipping), process directly without Razorpay
    if (total === 0) {
      try {
        const verifyRes = await api.post('/orders/create-free-order', {
          orderData: orderPayload,
        });

        if (verifyRes.data.success) {
          toast.success('Order placed successfully! 🎉');
          await clearCartStore(true);
          navigate(`/order-success?orderId=${verifyRes.data.data._id}`);
        } else {
          toast.error('Failed to place order');
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Error processing zero-amount order placement');
      } finally {
        setPaymentLoading(false);
      }
      return;
    }

    try {
      // 1. Create order on the backend to obtain Razorpay order parameters
      const { data } = await api.post('/orders/create-razorpay-order', {
        items: cartItems.map((item) => ({
          product: item.product._id,
          qty: item.qty,
          size: item.size,
          color: item.color,
        })),
        couponCode: appliedCoupon?.code || '',
      });

      if (!data.success || !data.order) {
        throw new Error('Failed to create Razorpay checkout order');
      }

      const razorpayOrder = data.order;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

      // 2. Configure and open Razorpay Payment Gateway popup
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Girly Store',
        description: 'Women Fashion Apparel checkout',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Post payment details and order payload to verification route
            const verifyRes = await api.post('/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderPayload,
            });

            if (verifyRes.data.success) {
              toast.success('Payment verified! Order placed successfully 🎉');
              await clearCartStore(true);
              navigate(`/order-success?orderId=${verifyRes.data.data._id}`);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error(verifyError);
            toast.error(verifyError.response?.data?.message || 'Error processing purchase verification');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        notes: {
          address: `${selectedAddress.street}, ${selectedAddress.city}`,
        },
        theme: {
          color: '#E8006F',
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment checkout popup closed by user');
            setPaymentLoading(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error initializing transaction');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-primary-50 pb-4 text-left">
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">
          Delivery & Payment
        </h1>
        <p className="text-[11px] text-gray-500 font-medium mt-1">
          Complete your delivery details and execute online payment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Addresses and Options */}
        <div className="lg:col-span-2 space-y-8 text-left">
          {/* Shipping Contact Information */}
          <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5 border-b border-primary-50 pb-2">
              <UserIcon size={14} className="text-primary" />
              <span>Recipient Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  placeholder="Recipient Name"
                  className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={addressName}
                  onChange={(e) => setAddressName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                  Recipient Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="Recipient Phone"
                  className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs bg-primary-50/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Delivery Address Book */}
          <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
            <div className="flex justify-between items-center border-b border-primary-50 pb-2">
              <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-primary" />
                <span>Delivery Address</span>
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {/* Inline Address Creation Form */}
            {showAddressForm && (
              <form onSubmit={handleAddNewAddress} className="p-4 bg-primary-50/30 rounded-2xl border border-primary-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Label</label>
                    <select
                      className="w-full px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs bg-white focus:outline-none"
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Office / Work</option>
                      <option value="Store">Store Pickup</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="678506"
                      className="w-full px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none"
                      value={addressPincode}
                      onChange={(e) => setAddressPincode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    placeholder="Block Office Road, Opposite Gold Palace"
                    className="w-full px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none"
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">City / Town</label>
                    <input
                      type="text"
                      required
                      placeholder="Kollengode"
                      className="w-full px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="Kerala"
                      className="w-full px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3.5 py-1 text-[11px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1 bg-primary text-white text-[11px] font-bold rounded-xl shadow-pink-sm cursor-pointer hover:bg-primary-dark"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Select Cards */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr, index) => (
                  <button
                    key={addr._id}
                    onClick={() => setSelectedAddressIndex(index)}
                    className={`p-4 rounded-2xl border text-left flex flex-col space-y-1 transition-all relative cursor-pointer ${selectedAddressIndex === index
                        ? 'border-primary bg-primary-50/20 shadow-pink-sm'
                        : 'border-primary-100 hover:border-primary-200 bg-white'
                      }`}
                  >
                    <span className="text-[9px] uppercase tracking-widest font-black text-primary bg-primary-50 px-2 py-0.5 rounded-full self-start">
                      {addr.label}
                    </span>
                    <p className="text-xs text-gray-800 font-bold mt-1.5">{addr.street}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>
                    {addr.isDefault && (
                      <span className="text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md absolute right-3 top-3">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-primary-200 rounded-2xl text-center text-xs text-gray-400 font-medium">
                No delivery addresses saved. Please click "Add Address" above to enter your shipping details.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Pricing Summary */}
        <div className="space-y-6 text-left">
          <div className="bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm space-y-4">
            <h3 className="font-playfair text-sm font-bold text-gray-800 pb-2 border-b border-primary-50">
              Payment Summary
            </h3>

            {/* Cart Items list review preview */}
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item._id} className="flex gap-2 items-center text-xs justify-between">
                  <div className="flex gap-2 items-center">
                    <div className="w-8 h-10 rounded-sm bg-primary-50 overflow-hidden shrink-0">
                      <img src={item.product?.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 line-clamp-1 max-w-[120px]">{item.product?.name}</span>
                      <span className="text-[9px] text-gray-400 font-bold">{item.size} • {item.color} • Qty {item.qty}</span>
                    </div>
                  </div>
                  <span className="font-black text-gray-700">₹{(item.product?.discountPrice || item.product?.price || 0) * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Calculations invoicing */}
            <div className="space-y-2 text-xs border-t border-primary-50 pt-4 text-gray-600 font-semibold">
              <div className="flex justify-between">
                <span>Total Items Value</span>
                <span className="text-gray-800 font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Delivery Charges</span>
                <span className="text-gray-800 font-bold">
                  {shippingFee === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shippingFee}`}
                </span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Promo coupon Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="border-t border-primary-50/50 pt-3 flex justify-between text-sm text-gray-800 font-black">
                <span>Final Checkout Amount</span>
                <span className="text-primary text-md">₹{total}</span>
              </div>
            </div>

            {/* Security disclaimer */}
            <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-primary-50/20 p-2.5 rounded-xl border border-primary-50">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <span>Secure card & UPI checkout transactions processed via Razorpay.</span>
            </div>

            {/* Razorpay Call action */}
            <button
              onClick={handlePayNow}
              disabled={paymentLoading || cartItems.length === 0}
              className="w-full inline-flex items-center justify-center gap-1.5 py-3 bg-primary hover:bg-primary-dark disabled:bg-gray-300 text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer transition-colors"
            >
              {paymentLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Securely Pay with Razorpay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
