import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/ui/Skeleton.jsx';
import { Search, ArrowLeft, Star, ShoppingBag, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [maxPrice, setMaxPrice] = useState(3000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state with url parameter
  useEffect(() => {
    setInputVal(query);
  }, [query]);

  // Fetch categories & catalog suggestions on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      setCatalogLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products', { params: { limit: 20, isActive: true, sort: '-createdAt' } })
        ]);
        if (catRes.data.success) {
          setCategories(catRes.data.data || []);
        }
        if (prodRes.data.success) {
          setAllProducts(prodRes.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching search catalog suggestions:', err);
      } finally {
        setCatalogLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Fetch query-based search results with active filters
  useEffect(() => {
    const fetchFilteredResults = async () => {
      const trimmed = inputVal.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = {
          search: trimmed,
          isActive: true,
          limit: 48,
        };

        if (selectedCategory) {
          const catObj = categories.find((c) => c.slug === selectedCategory);
          if (catObj) params.category = catObj._id;
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

        // Sorting options
        if (sortOption === 'priceAsc') {
          params.sort = 'price';
        } else if (sortOption === 'priceDesc') {
          params.sort = '-price';
        } else if (sortOption === 'rating') {
          params.sort = '-averageRating';
        } else {
          params.sort = '-createdAt';
        }

        const { data } = await api.get('/products', { params });
        if (data.success) {
          setResults(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching filtered search results:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchFilteredResults();
    }, 250);

    return () => clearTimeout(timer);
  }, [inputVal, selectedCategory, selectedSize, selectedColor, sortOption, maxPrice, categories]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedColor('');
    setMaxPrice(3000);
    setSortOption('newest');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const sizesPreset = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colorsPreset = ['Pink', 'Red', 'Black', 'Blue', 'White', 'Yellow', 'Peach', 'Lavender'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20 lg:pb-10">
      
      {/* Back to Home Link */}
      <div className="text-left">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-500 hover:text-primary transition-colors bg-white px-3.5 py-1.5 rounded-full border border-primary-100 shadow-pink-sm"
        >
          <ArrowLeft size={12} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Inline Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search for dresses, sarees, sets..."
            className="w-full pl-5 pr-12 py-3 rounded-full border border-primary-200 bg-white text-xs font-semibold text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-pink-sm transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors cursor-pointer shadow-pink-sm"
          >
            <Search size={14} />
          </button>
        </div>
      </form>

      {query ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
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

            {/* Categories Selection */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory('')}
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
                    onClick={() => setSelectedCategory(cat.slug)}
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

            {/* Price range */}
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
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sizes</h4>
              <div className="flex flex-wrap gap-1.5">
                {sizesPreset.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
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
                    onClick={() => setSelectedColor(selectedColor === cl ? '' : cl)}
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

          {/* Results Grid Container */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting Header Banner */}
            <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-primary-50 shadow-pink-sm mb-4">
              <span className="text-xs font-bold text-gray-500">
                Showing {results.length} results for "{query}"
              </span>
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-primary" />
                <span className="text-xs text-gray-700 font-extrabold">Sort By:</span>
                <select
                  className="px-2.5 py-1.5 border border-primary-200 rounded-xl text-xs bg-primary-50/30 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-primary/45 focus:border-primary cursor-pointer hover:bg-primary-50/50 transition-colors"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-primary-50 space-y-3 shadow-pink-sm">
                <p className="text-4xl">🔍</p>
                <p className="text-sm font-bold text-gray-700">No matching results found</p>
                <p className="text-xs text-gray-400 font-semibold">Try clearing filters or refining your search parameters.</p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-white text-xs font-bold rounded-full shadow-pink-sm hover:bg-primary-dark transition-all mt-2 cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {results.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Suggestions shown when search term is empty */
        <div className="space-y-8">
          
          {/* Shop Categories */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">
              Shop By Categories
            </h3>
            {catalogLoading ? (
              <CategoryGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${cat.slug}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-primary-50 hover:border-primary-100 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 bg-white"
                  >
                    <img
                      src={cat.image?.url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'}
                      alt={cat.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 text-left">
                      <h4 className="font-playfair text-xs sm:text-sm font-bold text-white group-hover:text-primary-100 transition-colors">
                        {cat.name}
                      </h4>
                      <span className="text-[8px] font-black text-primary-200 uppercase tracking-widest mt-0.5">
                        Browse Collection →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Catalog suggestions list */}
          <section className="space-y-4 text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pl-1">
              All Available Products
            </h3>
            {catalogLoading ? (
              <ProductGridSkeleton count={8} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {allProducts.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Mobile Sticky Sorting & Filter Panel */}
      {query && (
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
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full h-full text-center text-sm font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer pl-10 pr-4 appearance-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="priceAsc">Sort: Low-High</option>
              <option value="priceDesc">Sort: High-Low</option>
              <option value="rating">Sort: Top Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Mobile filter slide-out sidebar */}
      {isMobileFilterOpen && query && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden flex justify-end">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            onClick={() => setIsMobileFilterOpen(false)}
          />
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

            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-left">
              {/* Categories */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
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
                      onClick={() => setSelectedCategory(cat.slug)}
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

              {/* Price range */}
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
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizesPreset.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
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
                      onClick={() => setSelectedColor(selectedColor === cl ? '' : cl)}
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

export default SearchResults;
