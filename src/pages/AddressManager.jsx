import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { MapPin, Settings, Package, LogOut, Plus, Trash2, Home as HomeIcon, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AddressManager = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, addAddress, deleteAddress, setDefaultAddress, logout } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !pincode) {
      toast.error('All address fields are required');
      return;
    }

    setLoading(true);
    const res = await addAddress({ label, street, city, state, pincode });
    setLoading(false);

    if (res.success) {
      toast.success('Address added successfully! 🏡');
      setShowForm(false);
      setStreet('');
      setCity('');
      setPincode('');
    } else {
      toast.error(res.message || 'Failed to add address');
    }
  };

  const handleDelete = async (addrId) => {
    if (!window.confirm('Delete this shipping address?')) return;
    const res = await deleteAddress(addrId);
    if (res.success) {
      toast.success('Address deleted successfully');
    } else {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (addrId) => {
    const res = await setDefaultAddress(addrId);
    if (res.success) {
      toast.success('Default address updated');
    } else {
      toast.error('Failed to update default address');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-primary-50 pb-4 text-left">
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">
          My Address Book
        </h1>
        <p className="text-[11px] text-gray-500 font-medium mt-1">
          Manage saved billing and shipping addresses for faster checkout experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Side Navigation Panel */}
        <div className="space-y-4 text-left bg-white p-5 rounded-3xl border border-primary-100 shadow-pink-sm self-start">
          <div className="flex items-center gap-3 pb-4 border-b border-primary-50">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-playfair font-black text-lg">
              {user?.name?.[0]?.toUpperCase() || 'G'}
            </div>
            <div className="flex flex-col font-semibold">
              <span className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{user?.name}</span>
              <span className="text-[9px] text-gray-400 font-semibold">{user?.email}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 text-xs font-semibold">
            <Link
              to="/profile"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary rounded-xl transition-colors"
            >
              <Settings size={14} />
              <span>Personal Profile</span>
            </Link>
            <Link
              to="/addresses"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-primary text-white rounded-xl shadow-pink-sm transition-colors"
            >
              <MapPin size={14} />
              <span>My Address Book</span>
            </Link>
            <Link
              to="/orders"
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-gray-600 hover:bg-primary-50 hover:text-primary rounded-xl transition-colors"
            >
              <Package size={14} />
              <span>My Purchase Orders</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left font-semibold"
            >
              <LogOut size={14} />
              <span>Log Out Account</span>
            </button>
          </div>
        </div>

        {/* Right Panel: Address cards & creation */}
        <div className="lg:col-span-3 space-y-6 text-left">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-primary-100 shadow-pink-sm space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-primary-50">
              <h3 className="font-playfair text-md font-bold text-gray-800">
                Delivery Addresses
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center gap-1 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full cursor-pointer hover:bg-primary-dark shadow-pink-sm transition-all"
              >
                <Plus size={14} />
                <span>{showForm ? 'Close Form' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Address Form block */}
            {showForm && (
              <form onSubmit={handleAddAddress} className="p-5 bg-primary-50/20 border border-primary-50 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                      Label Location
                    </label>
                    <select
                      className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Office / Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="678506"
                      className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Block Office Road, Opposite Thrissur Gold Palace"
                    className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kollengode"
                      className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase pl-1 block mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Kerala"
                      className="w-full px-3 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm cursor-pointer disabled:opacity-75"
                >
                  {loading ? 'Saving...' : 'Save New Address'}
                </button>
              </form>
            )}

            {/* List addresses cards */}
            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`p-5 rounded-2xl border bg-white relative flex flex-col space-y-1.5 text-left transition-all ${
                      addr.isDefault ? 'border-primary shadow-pink-sm bg-primary-50/5' : 'border-primary-50 hover:border-primary-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-wider font-black text-primary bg-primary-50 px-2 py-0.5 rounded-full">
                        {addr.label}
                      </span>

                      {/* Delete Address */}
                      <button
                        onClick={() => handleDelete(addr._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-gray-800 font-bold pt-1">{addr.street}</p>
                    <p className="text-[11px] text-gray-500 font-semibold">{addr.city}, {addr.state} - {addr.pincode}</p>

                    <div className="pt-3 border-t border-primary-50/50 flex justify-between items-center mt-auto">
                      {addr.isDefault ? (
                        <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                          <CheckCircle size={12} />
                          <span>Default Shipping</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                        >
                          Mark Default
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-primary-100 rounded-2xl text-center text-xs text-gray-400 font-medium">
                No delivery addresses registered. Create one to enable quick shopping!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManager;
