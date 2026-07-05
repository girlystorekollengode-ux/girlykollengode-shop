import { create } from 'zustand';
import api from '../api/axios.js';

export const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  isLoading: false,

  fetchWishlist: async (isAuthenticated) => {
    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        const { data } = await api.get('/wishlist');
        if (data.success) {
          set({ wishlistItems: data.data || [] });
        }
      } else {
        const local = localStorage.getItem('girly_wishlist');
        set({ wishlistItems: local ? JSON.parse(local) : [] });
      }
    } catch (error) {
      console.error('Fetch wishlist failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (product, isAuthenticated) => {
    const productId = product._id;
    const isCurrentlyLiked = get().wishlistItems.some((item) => item._id === productId);

    set({ isLoading: true });
    try {
      if (isAuthenticated) {
        if (isCurrentlyLiked) {
          const { data } = await api.delete(`/wishlist/remove/${productId}`);
          if (data.success) set({ wishlistItems: data.data || [] });
        } else {
          const { data } = await api.post(`/wishlist/add/${productId}`);
          if (data.success) set({ wishlistItems: data.data || [] });
        }
      } else {
        let currentItems = [...get().wishlistItems];
        if (isCurrentlyLiked) {
          currentItems = currentItems.filter((item) => item._id !== productId);
        } else {
          currentItems.push(product);
        }
        localStorage.setItem('girly_wishlist', JSON.stringify(currentItems));
        set({ wishlistItems: currentItems });
      }
    } catch (error) {
      console.error('Toggle wishlist failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  mergeWishlist: async () => {
    const local = localStorage.getItem('girly_wishlist');
    if (!local) return;
    try {
      const items = JSON.parse(local);
      if (items.length > 0) {
        for (const item of items) {
          await api.post(`/wishlist/add/${item._id}`);
        }
      }
    } catch (error) {
      console.error('Merging wishlist failed:', error);
    } finally {
      localStorage.removeItem('girly_wishlist');
      // Fetch latest wishlist
      const { data } = await api.get('/wishlist');
      if (data.success) {
        set({ wishlistItems: data.data || [] });
      }
    }
  },

  isWishlisted: (productId) => {
    return get().wishlistItems.some((item) => item._id === productId);
  },
}));
