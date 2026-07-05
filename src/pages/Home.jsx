import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuthStore } from '../store/authStore.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import { ProductGridSkeleton, CategoryGridSkeleton } from '../components/ui/Skeleton.jsx';
import { Sparkles, ArrowRight, MapPin, Phone, Clock, ShoppingBag, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Horizontal scroll row with arrow nav ─────────────────── */
const HScrollRow = ({ products }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    // scroll by roughly one card width + gap
    const cardWidth = rowRef.current.querySelector('div')?.offsetWidth || 160;
    rowRef.current.scrollBy({ left: dir * (cardWidth + 16), behavior: 'smooth' });
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white border border-primary-100 shadow-pink-sm rounded-full flex items-center justify-center text-primary opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer hover:bg-primary hover:text-white hover:border-primary"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scrollable track */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((prod) => (
          <div key={prod._id} className="shrink-0 w-[calc(50vw-24px)] sm:w-44">
            <ProductCard product={prod} hideVariants={true} />
          </div>
        ))}

        {/* See-all ghost card at the end */}
        <div className="shrink-0 w-32 sm:w-36 flex items-center justify-center">
          <Link
            to="/shop"
            className="flex flex-col items-center gap-2 text-primary hover:text-primary-dark transition-colors text-center"
          >
            <div className="w-12 h-12 rounded-full border-2 border-primary border-dashed flex items-center justify-center bg-primary-50/40">
              <ArrowRight size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider">View All</span>
          </Link>
        </div>
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white border border-primary-100 shadow-pink-sm rounded-full flex items-center justify-center text-primary opacity-0 group-hover/row:opacity-100 transition-all cursor-pointer hover:bg-primary hover:text-white hover:border-primary"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

/* ── Girly SVG sparkle cluster ────────────────────────────── */
const GirlySVG = () => (
  <svg
    width="36" height="36" viewBox="0 0 36 36" fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
    aria-hidden="true"
  >
    {/* Big 4-point star centre */}
    <path
      d="M18 4 L19.8 14.2 L28 12 L21.2 18 L28 24 L19.8 21.8 L18 32 L16.2 21.8 L8 24 L14.8 18 L8 12 L16.2 14.2 Z"
      fill="#E8006F" fillOpacity="0.85"
    />
    {/* Small top-right sparkle */}
    <path
      d="M29 5 L29.9 8.1 L33 9 L29.9 9.9 L29 13 L28.1 9.9 L25 9 L28.1 8.1 Z"
      fill="#E8006F" fillOpacity="0.5"
    />
    {/* Tiny bottom-left dot star */}
    <path
      d="M6 24 L6.6 26.4 L9 27 L6.6 27.6 L6 30 L5.4 27.6 L3 27 L5.4 26.4 Z"
      fill="#E8006F" fillOpacity="0.35"
    />
    {/* Tiny top-left circle dot */}
    <circle cx="7" cy="10" r="1.5" fill="#E8006F" fillOpacity="0.3" />
    {/* Tiny bottom-right circle dot */}
    <circle cx="30" cy="27" r="1.2" fill="#E8006F" fillOpacity="0.4" />
  </svg>
);

/* ── Themed section heading ───────────────────────────────── */
const SectionHeading = ({ title, subtitle, viewAllLink }) => (
  <div
    className="flex items-center justify-between px-4 py-3 rounded-2xl -mx-2"
    style={{ background: 'linear-gradient(to right, #ffd8e2ff, #fae6ebff, #FFF5F9)' }}
  >
    <div className="flex items-center gap-2">
      {/* Pink accent bar */}
      <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-400 rounded-full shrink-0" />
      <div>
        <h2 className="font-playfair text-xl sm:text-2xl font-black text-gray-800 leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{subtitle}</p>
        )}
      </div>
      {/* Girly SVG sparkle — after the title */}
      <GirlySVG />
    </div>
    {viewAllLink && (
      <Link
        to={viewAllLink}
        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-dark transition-colors ml-4"
      >
        <span>See All</span>
        <ArrowRight size={12} />
      </Link>
    )}
  </div>
);

/* ── Main Component ───────────────────────────────────────── */
const Home = () => {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
      setHeroSearch('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, newRes] = await Promise.all([
          api.get('/categories'),
          // Fetch last 20 products; we'll filter to this week client-side
          api.get('/products', { params: { limit: 20, isActive: true, sort: '-createdAt' } }),
        ]);

        const allCats = catRes.data.success ? catRes.data.data || [] : [];
        setCategories(allCats);

        if (newRes.data.success) {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const thisWeek = (newRes.data.data || []).filter(
            (p) => new Date(p.createdAt) >= oneWeekAgo
          );
          // Fallback: if nothing added this week, show latest 8
          setNewArrivals(thisWeek.length > 0 ? thisWeek : (newRes.data.data || []).slice(0, 8));
        }

        // Fetch products per category in parallel
        const results = await Promise.all(
          allCats.map((cat) =>
            api
              .get('/products', {
                params: { category: cat._id, limit: 8, isActive: true, sort: '-createdAt' },
              })
              .then((r) => ({ catId: cat._id, products: r.data.success ? r.data.data || [] : [] }))
              .catch(() => ({ catId: cat._id, products: [] }))
          )
        );

        const map = {};
        results.forEach(({ catId, products }) => { map[catId] = products; });
        setCategoryProducts(map);
      } catch (err) {
        console.error('Homepage load error:', err);
        toast.error('Failed to load shop catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeCats = categories.filter((c) => (categoryProducts[c._id]?.length || 0) > 0);

  return (
    <div className="space-y-8 pb-2">

      {/* ── 1. Hero ── */}
      {!isAuthenticated && (
        <section className="relative bg-white border-b border-primary-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
              <div className="space-y-2 sm:space-y-6 text-left">
                <h1 className="font-playfair text-xl sm:text-5xl lg:text-6xl font-black text-gray-800 leading-tight">
                  Your Fashion <br />
                  <span className="text-primary">Destination</span>
                </h1>
                <p className="hidden sm:block text-[11px] sm:text-base text-gray-500 font-medium leading-relaxed max-w-md">
                  "Your Style, Your Way!" Discover premium women's clothing, ethnic wear, co-ord sets, and
                  night wear carefully selected in Kollengode, Kerala.
                </p>
                <div className="flex gap-2 sm:gap-4 pt-1 sm:pt-2">
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 bg-primary hover:bg-primary-dark text-white text-[9px] sm:text-xs font-bold rounded-full shadow-pink-sm transition-all cursor-pointer"
                  >
                    <ShoppingBag size={10} />
                    <span>Shop Collection</span>
                    <ArrowRight size={10} />
                  </Link>
                  <a
                    href="#visit-store"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-6 sm:py-2.5 border border-primary text-primary hover:bg-primary-50 text-[9px] sm:text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    <span>Visit Store</span>
                  </a>
                </div>
              </div>

              <div className="hidden lg:block relative aspect-[4/3] max-h-[45vh] w-full rounded-3xl overflow-hidden border border-primary-100 shadow-pink-md">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
                  alt="Women's Boutique Collection"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute bottom-4 left-4 right-4 glass-card p-3 rounded-2xl text-left border border-white/20">
                  <p className="font-dancing text-lg text-primary font-bold">Your Style, Your Way!</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                    Explore Indian &amp; Western Fashions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 2. New Arrivals — vertical grid (this week's items) ── */}
      {loading ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 mt-4 sm:mt-6">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl -mx-2 animate-pulse"
            style={{ background: 'linear-gradient(to right, rgba(255, 182, 211, 0.3), rgba(255, 205, 224, 0.2), rgba(255, 232, 240, 0.1))' }}
          >
            <div className="h-6 w-32 bg-primary-100/50 rounded" />
          </div>
          <ProductGridSkeleton count={4} />
        </section>
      ) : newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 mt-4 sm:mt-6">
          <SectionHeading
            title="✨ New Arrivals"
            viewAllLink="/shop"
          />
          {/* Subtitle below the heading banner */}
          <p className="text-xs text-gray-500 font-medium -mt-2 pl-2">
            Freshly added this week — grab them before they're gone!
          </p>

          {/* Vertical 2-column product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} hideVariants={true} />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-full shadow-pink-sm transition-all"
            >
              <span>View All Products</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. Shop by Categories grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">Shop By Categories</h2>
          <div className="w-16 h-0.5 bg-primary mx-auto rounded-full" />
          <p className="text-xs text-gray-500 font-medium">Browse our popular styles and handpicked selections</p>
        </div>

        {loading ? (
          <CategoryGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-primary-50 hover:border-primary-100 shadow-pink-sm hover:shadow-pink-md transition-all duration-300 bg-white"
              >
                <img
                  src={
                    cat.image?.url ||
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-left">
                  <h3 className="font-playfair text-sm sm:text-base font-bold text-white group-hover:text-primary-100 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[9px] font-black text-primary-200 uppercase tracking-widest mt-0.5">
                    Explore →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Per-category horizontal rows ── */}
      {!loading && activeCats.map((cat) => (
        <section
          key={cat._id}
          id={`cat-${cat._id}`}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-5"
        >
          <SectionHeading
            title={cat.name}
            subtitle={cat.description || null}
            viewAllLink={`/shop?category=${cat.slug}`}
          />
          <HScrollRow products={categoryProducts[cat._id] || []} />
        </section>
      ))}

      {/* ── 5. Visit Store ── */}
      <section id="visit-store" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="bg-white border border-primary-100 rounded-3xl p-8 md:p-12 shadow-pink-md grid grid-cols-1 lg:grid-cols-3 gap-8 items-center text-left">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-playfair text-2xl sm:text-3xl font-black text-gray-800">
              Visit Our Retail Store
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              We look forward to welcoming you in-person! Come explore our premium collection of sarees,
              churidars, and daily styles. Feel the fabric, try on the sizes, and find your perfect outfit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Address</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold pl-6 mt-1">
                  Block Office Road, Kollengode, Kerala, India
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Phone size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Contact</span>
                </div>
                <p className="text-xs text-gray-600 font-semibold pl-6 mt-1">
                  +91 812988 98313 <br /> +91 70120 65738
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Store Hours</span>
                </div>
                <p className="text-xs text-gray-600 font-semibold pl-6 mt-1">
                  Open Daily: <br /> 9:30 AM – 8:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-square w-full rounded-2xl overflow-hidden border border-primary-50 relative">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=400"
              alt="Kollengode Store Location"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center p-4">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white text-xs font-bold text-primary rounded-full hover:bg-primary hover:text-white transition-all shadow-pink-sm cursor-pointer"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
