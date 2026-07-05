import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/ui/Skeleton.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { Filter, SlidersHorizontal, Search, ArrowUpDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search/Filters from URL
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchVal, setSearchVal] = useState(urlSearch);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // newest, priceAsc, priceDesc, rating

  // Mobile Filter Drawer Toggle
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Price range filters
  const [maxPrice, setMaxPrice] = useState(3000);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSearchVal(urlSearch);
    setPage(1);
  }, [urlCategory, urlSearch]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (data.success) {
          setCategories(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build API query params
      const params = {
        page,
        limit: 12,
        isActive: true,
      };

      if (selectedCategory) {
        // Find category ID by slug
        const catObj = categories.find((c) => c.slug === selectedCategory);
        if (catObj) params.category = catObj._id;
      }

      if (searchVal) {
        params.search = searchVal;
      }

      if (selectedSize) {
        params['sizes[in]'] = selectedSize;
      }

      if (selectedColor) {
        params['colors[in]'] = selectedColor;
      }

      if (maxPrice) {
        params['price[lte]'] = maxPrice;
      }

      // Sorting
      if (sortOption === 'priceAsc') {
        params.sort = 'price';
      } else if (sortOption === 'priceDesc') {
        params.sort = '-price';
      } else if (sortOption === 'rating') {
        params.sort = '-averageRating';
      } else {
        params.sort = '-createdAt'; // newest
      }

      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading products list:', error);
      toast.error('Failed to load products list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait until categories are fetched to resolve slug->ID
    if (categories.length > 0 || !selectedCategory) {
      fetchProducts();
    }
  }, [selectedCategory, searchVal, selectedSize, selectedColor, sortOption, maxPrice, page, categories]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchVal('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(3000);
    setSortOption('newest');
    setPage(1);
    setSearchParams({});
  };

  // Presets
  const sizesPreset = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorsPreset = ['Pink', 'Red', 'Black', 'Blue', 'White', 'Yellow', 'Peach', 'Lavender'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-20 lg:pb-8">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="hidden lg:block space-y-6 text-left bg-white p-6 rounded-3xl border border-primary-100 shadow-pink-sm self-start">
          <div className="flex items-center justify-between border-b border-primary-50 pb-3">
            <h3 className="font-playfair text-md font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-primary" />
              <span>Filters</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Search text box inside filters */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search keyword</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-3 pr-8 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setPage(1);
                }}
              />
              {searchVal && (
                <button
                  onClick={() => setSearchVal('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-primary"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Categories select list */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSearchParams({});
                }}
                className={`w-full text-left text-xs py-1 px-2.5 rounded-lg font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-primary text-white font-bold'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
                }`}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSearchParams({ category: cat.slug });
                  }}
                  className={`w-full text-left text-xs py-1 px-2.5 rounded-lg font-medium transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-primary text-white font-bold'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              className="w-full accent-primary cursor-pointer"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                setPage(1);
              }}
            />
          </div>

          {/* Sizing options */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sizes</h4>
            <div className="flex flex-wrap gap-1.5">
              {sizesPreset.map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setSelectedSize(selectedSize === sz ? '' : sz);
                    setPage(1);
                  }}
                  className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-primary text-white border-primary shadow-pink-sm'
                      : 'bg-white text-gray-600 border-primary-200 hover:bg-primary-50 hover:text-primary'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Color options */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Colors</h4>
            <div className="flex flex-wrap gap-1.5">
              {colorsPreset.map((cl) => (
                <button
                  key={cl}
                  onClick={() => {
                    setSelectedColor(selectedColor === cl ? '' : cl);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedColor === cl
                      ? 'bg-primary text-white border-primary shadow-pink-sm'
                      : 'bg-white text-gray-600 border-primary-200 hover:bg-primary-50 hover:text-primary'
                  }`}
                >
                  {cl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Catalog Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Info & Sort Dropdown on Desktop */}
          <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-primary-50 shadow-pink-sm mb-4">
            <span className="text-xs font-bold text-gray-500">
              Showing {products.length} products
            </span>
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-primary" />
              <span className="text-xs text-gray-700 font-extrabold">Sort By:</span>
              <select
                className="px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs bg-primary-50/30 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary cursor-pointer hover:bg-primary-50/50 transition-colors"
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Compact Bento Grid for Categories - Dynamic Listing of All Categories */}
          {categories.length > 0 && (
            <div className="space-y-2.5 mb-6 text-left">
              <div className="flex items-center justify-between pl-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-primary">Browse All Categories 🌸</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                {categories.map((cat, idx) => {
                  const emojis = ['👗', '✨', '🎀', '🌸', '👚', '👜', '👠'];
                  const emoji = emojis[idx % emojis.length];
                  const isSelected = selectedCategory === cat.slug;

                  return (
                    <button
                      key={cat._id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategory('');
                          setSearchParams({});
                        } else {
                          setSelectedCategory(cat.slug);
                          setSearchParams({ category: cat.slug });
                        }
                        setPage(1);
                      }}
                      className={`rounded-2xl relative overflow-hidden text-left aspect-[1.8/1] border transition-all duration-300 shadow-pink-sm group ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/60'
                          : 'border-primary-100 hover:border-primary-300'
                      }`}
                    >
                      {/* Background Category Image */}
                      <img
                        src={
                          cat.image?.url ||
                          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'
                        }
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Dark/Primary Gradient Overlay */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-t transition-colors duration-300 ${
                          isSelected
                            ? 'from-primary/95 via-primary/50 to-transparent'
                            : 'from-black/85 via-black/35 to-transparent'
                        }`}
                      />

                      {/* Content Container overlay */}
                      <div className="absolute inset-0 p-3.5 flex flex-col justify-between text-left z-10">
                        <span className="text-lg sm:text-xl self-end group-hover:scale-110 transition-transform">
                          {emoji}
                        </span>
                        <div>
                          <h4 className="font-playfair text-xs sm:text-sm font-bold text-white tracking-tight">
                            {cat.name}
                          </h4>
                          <span className="text-[8px] font-black text-primary-200 uppercase tracking-widest mt-0.5 block">
                            {isSelected ? 'Selected 🌸' : 'Explore →'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <ProductGridSkeleton count={6} className="grid grid-cols-1 sm:grid-cols-3 gap-6" />
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-primary-50 p-12 text-center text-gray-400 shadow-pink-sm">
              <SlidersHorizontal size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-xs font-semibold">No clothes matches the selected filters.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 px-4 py-1.5 bg-primary hover:bg-primary-dark text-white text-[11px] font-bold rounded-full shadow-pink-sm transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} layout="list" />
              ))}
            </div>
          )}

          {/* Pagination control */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center pt-6">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Filter/Sort Action Bar (Flipkart style) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-primary-100 shadow-pink-lg lg:hidden grid grid-cols-2 divide-x divide-primary-100 h-14">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center justify-center gap-2 py-4 text-sm font-bold text-gray-700 hover:bg-primary-50/20 active:bg-primary-50/50 cursor-pointer transition-colors"
        >
          <SlidersHorizontal size={16} className="text-primary" />
          <span>Filter</span>
        </button>
        <div className="relative flex items-center justify-center gap-2 py-4 hover:bg-primary-50/20 transition-colors">
          <ArrowUpDown size={16} className="text-primary absolute left-4 pointer-events-none" />
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="w-full h-full text-center text-sm font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer pl-10 pr-4 appearance-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="priceAsc">Sort: Low-High</option>
            <option value="priceDesc">Sort: High-Low</option>
            <option value="rating">Sort: Top Rated</option>
          </select>
        </div>
      </div>

      {/* Mobile Filters Slide-in Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          {/* Drawer Body */}
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h3 className="font-playfair text-md font-bold text-gray-800 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable filters list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
              {/* Search keyword */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search keyword</h4>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-3 pr-8 py-1.5 border border-primary-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                    value={searchVal}
                    onChange={(e) => {
                      setSearchVal(e.target.value);
                      setPage(1);
                    }}
                  />
                  {searchVal && (
                    <button
                      onClick={() => setSearchVal('')}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-primary"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchParams({});
                    }}
                    className={`w-full text-left text-xs py-1 px-2.5 rounded-lg font-medium transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-white font-bold'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
                    }`}
                  >
                    All categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setSearchParams({ category: cat.slug });
                      }}
                      className={`w-full text-left text-xs py-1 px-2.5 rounded-lg font-medium transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-primary text-white font-bold'
                          : 'text-gray-600 hover:bg-primary-50 hover:text-primary'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range filter */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Price</h4>
                  <span className="text-xs font-bold text-primary">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={100}
                  className="w-full accent-primary cursor-pointer"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setPage(1);
                  }}
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizesPreset.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        setSelectedSize(selectedSize === sz ? '' : sz);
                        setPage(1);
                      }}
                      className={`px-3 py-1 text-[10px] font-black rounded-lg border transition-all cursor-pointer ${
                        selectedSize === sz
                          ? 'bg-primary text-white border-primary shadow-pink-sm'
                          : 'bg-white text-gray-600 border-primary-200 hover:bg-primary-50 hover:text-primary'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Colors</h4>
                <div className="flex flex-wrap gap-1.5">
                  {colorsPreset.map((cl) => (
                    <button
                      key={cl}
                      onClick={() => {
                        setSelectedColor(selectedColor === cl ? '' : cl);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedColor === cl
                          ? 'bg-primary text-white border-primary shadow-pink-sm'
                          : 'bg-white text-gray-600 border-primary-200 hover:bg-primary-50 hover:text-primary'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons inside drawer */}
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => {
                  handleClearFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-2 border border-gray-200 text-xs font-bold text-gray-500 rounded-xl hover:bg-gray-50 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-pink-sm cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default Shop;
