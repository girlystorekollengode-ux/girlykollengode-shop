import { create } from 'zustand';
import api from '../api/axios.js';

export const useCartStore = create((set, get) => ({
  cartItems: [],
  isLoading: false,

  // Load cart (checks auth or parses localStorage)
  fetchCart: async (isAuthenticated) => {
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        const { data } = await api.get('/cart');
        if (data.success) {
          set({ cartItems: data.data.items || [] });
        }
      } else {
        const local = localStorage.getItem('girly_cart');
        set({ cartItems: local ? JSON.parse(local) : [] });
      }
    } catch (error) {
      console.error('Fetch cart failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Add Item
  addToCart: async (product, qty, size, color, isAuthenticated) => {
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        const { data } = await api.post('/cart/add', {
          product: product._id,
          qty,
          size,
          color,
        });
        if (data.success) {
          set({ cartItems: data.data.items || [] });
        }
      } else {
        const currentItems = [...get().cartItems];
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.product._id === product._id &&
            item.size === size &&
            item.color === color
        );

        if (existingIndex > -1) {
          currentItems[existingIndex].qty += qty;
        } else {
          currentItems.push({
            _id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            product,
            qty,
            size,
            color,
          });
        }
        localStorage.setItem('girly_cart', JSON.stringify(currentItems));
        set({ cartItems: currentItems });
      }
    } catch (error) {
      console.error('Add to cart failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Update quantity
  updateQuantity: async (itemId, qty, isAuthenticated) => {
    if (qty <= 0) {
      get().removeFromCart(itemId, isAuthenticated);
      return;
    }
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        const { data } = await api.put('/cart/update', { itemId, qty });
        if (data.success) {
          set({ cartItems: data.data.items || [] });
        }
      } else {
        const currentItems = get().cartItems.map((item) =>
          item._id === itemId ? { ...item, qty } : item
        );
        localStorage.setItem('girly_cart', JSON.stringify(currentItems));
        set({ cartItems: currentItems });
      }
    } catch (error) {
      console.error('Update quantity failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Remove Item
  removeFromCart: async (itemId, isAuthenticated) => {
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        const { data } = await api.delete(`/cart/remove/${itemId}`);
        if (data.success) {
          set({ cartItems: data.data.items || [] });
        }
      } else {
        const currentItems = get().cartItems.filter((item) => item._id !== itemId);
        localStorage.setItem('girly_cart', JSON.stringify(currentItems));
        set({ cartItems: currentItems });
      }
    } catch (error) {
      console.error('Remove from cart failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear Cart
  clearCartStore: async (isAuthenticated) => {
    try {
      if (isAuthenticated) {
        await api.delete('/cart/clear');
      }
    } catch (error) {
      console.error('Clear cart backend call failed:', error);
    } finally {
      localStorage.removeItem('girly_cart');
      set({ cartItems: [] });
    }
  },

  // Merge local guest cart to database upon login
  mergeGuestCart: async () => {
    const local = localStorage.getItem('girly_cart');
    if (!local) return;
    try {
      const items = JSON.parse(local);
      if (items.length > 0) {
        // Send sequential or parallel add requests to database
        for (const item of items) {
          await api.post('/cart/add', {
            product: item.product._id,
            qty: item.qty,
            size: item.size,
            color: item.color,
          });
        }
      }
    } catch (error) {
      console.error('Merging guest cart failed:', error);
    } finally {
      localStorage.removeItem('girly_cart');
      // Fetch latest cart
      const { data } = await api.get('/cart');
      if (data.success) {
        set({ cartItems: data.data.items || [] });
      }
    }
  },

  // Cart total calculations
  getCartSubtotal: () => {
    return get().cartItems.reduce((sum, item) => {
      const price = item.product?.discountPrice || item.product?.price || 0;
      return sum + price * item.qty;
    }, 0);
  },

  getCartTotalCount: () => {
    return get().cartItems.reduce((sum, item) => sum + item.qty, 0);
  },
}));
