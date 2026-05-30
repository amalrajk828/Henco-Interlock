import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../services/api.js';
import { Search, Filter, SlidersHorizontal, Info, X, MessageSquare, Truck, AlertTriangle } from 'lucide-react';

const Products = () => {
  const { settings } = useSettings();
  const location = useLocation();

  // Search parameters
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [stockFilter, setStockFilter] = useState('');
  
  // Details Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quoteRequest, setQuoteRequest] = useState(null); // to show quote form inside modal
  const [quoteQuantity, setQuoteQuantity] = useState('1000');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  
  // Quote client credentials
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  // Extract query category parameters if navigating from footer or home link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?sort=${sortOption}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      if (stockFilter) url += `&stockStatus=${stockFilter}`;
      
      const res = await api.get(url);
      setProducts(res.data.products);
    } catch (err) {
      console.error('Failed to fetch catalog products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay search key triggers to reduce api hit rates
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory, sortOption, stockFilter]);

  const handleOpenDetail = async (prod) => {
    setSelectedProduct(prod);
    setQuoteRequest(null);
    setQuoteSubmitted(false);
    setQuoteError('');
    // Trigger pop-hit update passively
    try {
      await api.get(`/products/slug/${prod.slug}`);
    } catch (err) {
      console.warn('Passive product hit trigger failed:', err.message);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteError('');
    const { name, phone, email, message } = quoteForm;

    if (!name || !phone || !email || !quoteQuantity) {
      setQuoteError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.post('/inquiries', {
        name,
        phone,
        email,
        productInterested: selectedProduct._id,
        quantity: Number(quoteQuantity),
        message,
      });

      if (res.status === 201) {
        setQuoteSubmitted(true);
        setQuoteForm({ name: '', phone: '', email: '', message: '' });
      }
    } catch (err) {
      setQuoteError(err.response?.data?.message || 'Failed to submit quote. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen relative">
      
      {/* Page Header */}
      <div className="text-left space-y-2 mb-10">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Henco Showcase</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Our Products</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">Explore our diverse collection of premium pavers, interlocking bricks, kerbs, and designer floor slabs.</p>
      </div>

      {/* Grid Controls (Search & Filters Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Responsive Filter sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-2xl space-y-6 text-left">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-dark-800">
            <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-primary-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setStockFilter('');
                setSortOption('popularity');
              }}
              className="text-[10px] uppercase font-bold text-gray-400 hover:text-primary-600"
            >
              Reset All
            </button>
          </div>

          {/* Search field */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Catalog</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Product name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Categories select options */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories</label>
            <div className="space-y-2.5">
              <label className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="category_filter"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                  className="accent-primary-600"
                />
                <span>All Categories</span>
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name="category_filter"
                    checked={selectedCategory === cat.slug || selectedCategory === cat._id}
                    onChange={() => setSelectedCategory(cat.slug)}
                    className="accent-primary-600"
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Filters */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Availability</label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 rounded-xl text-xs text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-primary-500"
            >
              <option value="">All Stock Options</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort By options */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sort List</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 rounded-xl text-xs text-gray-800 dark:text-white cursor-pointer focus:outline-none focus:border-primary-500"
            >
              <option value="popularity">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

        </div>

        {/* Right Catalog Grid */}
        <div className="lg:col-span-9 space-y-6">
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[340px] w-full bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-2xl animate-pulse skeleton-shimmer"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 p-12 text-center space-y-4">
              <span className="text-4xl text-gray-300">🔍</span>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">No products found</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">We couldn't locate items matching your filtering parameters. Try adjusting the search term or category options.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  onClick={() => handleOpenDetail(prod)}
                  className="group bg-white dark:bg-dark-900 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 overflow-hidden hover-glow transition-all duration-300 cursor-pointer text-left"
                >
                  
                  {/* Aspect ratio frame */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200 flex items-center justify-center">
                    {prod.images && prod.images.length > 0 ? (
                      <img
                        src={`${api.defaults.baseURL.replace('/api', '')}${prod.images[0]}`}
                        alt={prod.name}
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {/* Floating elements */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent"></div>
                    <span className="absolute top-3 left-3 text-[9px] font-bold bg-primary-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prod.category?.name || 'Henco'}
                    </span>
                    
                    {/* Stock Status Badge */}
                    <span className={`absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                      prod.stockStatus === 'In Stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : prod.stockStatus === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {prod.stockStatus}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                    
                    {/* Specs snippet */}
                    {(prod.sizes?.length > 0 || prod.colors?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {prod.sizes?.slice(0, 1).map((s) => (
                          <span key={s} className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-dark-800 text-gray-500 rounded">{s} Thickness</span>
                        ))}
                        {prod.colors?.slice(0, 2).map((c) => (
                          <span key={c} className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-dark-800 text-gray-500 rounded">{c}</span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-200 dark:border-dark-800 flex items-center justify-between">
                      <div>
                        <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Price Estimate</span>
                        <span className="font-extrabold text-primary-600 dark:text-primary-500">₹{prod.pricePerSqFt} <span className="text-[10px] text-gray-400 font-medium">/ Sq. Ft.</span></span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 flex items-center space-x-1.5 bg-slate-50 dark:bg-dark-800 py-1.5 px-3 rounded-lg border border-slate-100 dark:border-dark-800">
                        <Info className="w-3.5 h-3.5" />
                        <span>Specs</span>
                      </span>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* 4. PRODUCT DETAILED MODAL LAYER */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col md:flex-row text-left max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-gray-800 dark:bg-dark-850 dark:hover:bg-dark-800 dark:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image column */}
            <div className="md:w-1/2 bg-slate-100 relative max-h-[300px] md:max-h-full overflow-hidden flex items-center justify-center">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <img
                  src={`${api.defaults.baseURL.replace('/api', '')}${selectedProduct.images[0]}`}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 to-transparent"></div>
              
              <span className="absolute bottom-4 left-4 text-[10px] font-bold bg-primary-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                {selectedProduct.category?.name || 'Catalog'}
              </span>
            </div>

            {/* Right Information Details column */}
            <div className="md:w-1/2 p-8 overflow-y-auto space-y-5 flex flex-col justify-between max-h-[50vh] md:max-h-[80vh]">
              
              {!quoteRequest ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                      {selectedProduct.name}
                    </h2>
                    
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedProduct.stockStatus === 'In Stock'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedProduct.stockStatus === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.stockStatus}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-slate-200 dark:border-dark-800">
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Color Options</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProduct.colors?.length > 0 ? (
                          selectedProduct.colors.map((c) => (
                            <span key={c} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded font-medium">{c}</span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400">Terracotta Grey</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase tracking-wider">Thickness Options</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedProduct.sizes?.length > 0 ? (
                          selectedProduct.sizes.map((s) => (
                            <span key={s} className="text-[10px] bg-slate-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded font-medium">{s}</span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-400">60mm / 80mm</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-gray-400 uppercase block tracking-wider">Price per square foot</span>
                      <strong className="text-2xl text-primary-600 dark:text-primary-500 font-extrabold">₹{selectedProduct.pricePerSqFt} <span className="text-xs text-gray-400 font-medium">/ Sq. Ft.</span></strong>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setQuoteRequest(true)}
                      disabled={selectedProduct.stockStatus === 'Out of Stock'}
                      className="w-full py-3 bg-primary-600 disabled:bg-slate-300 disabled:dark:bg-dark-800 disabled:text-gray-400 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow-lg shadow-primary-600/10 flex items-center justify-center space-x-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Request Quote Estimate</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Instant Quote form within detailed modal view */
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200 dark:border-dark-800">
                    <button
                      onClick={() => setQuoteRequest(false)}
                      className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase hover:underline"
                    >
                      &larr; Back to specifications
                    </button>
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white mt-1">Estimate for {selectedProduct.name}</h3>
                  </div>

                  {quoteSubmitted ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl text-center space-y-2">
                      <span className="text-3xl">🎉</span>
                      <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs">Request Sent!</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-500">We have registered your parameters. A quote summary has been sent to your email.</p>
                      <button
                        onClick={() => setSelectedProduct(null)}
                        className="mt-2 text-[10px] font-bold bg-emerald-600 text-white py-1 px-3 rounded-lg hover:bg-emerald-700"
                      >
                        Close Portal
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="space-y-3">
                      {quoteError && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-2 rounded text-[10px] text-red-600 text-left">
                          {quoteError}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Your Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Full name"
                            value={quoteForm.name}
                            onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-lg text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Phone Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="Phone"
                            value={quoteForm.phone}
                            onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-lg text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="Email"
                            value={quoteForm.email}
                            onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-lg text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Volume (Sq Ft)</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={quoteQuantity}
                            onChange={(e) => setQuoteQuantity(e.target.value)}
                            placeholder="1000"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-lg text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-gray-400 uppercase">Optional Notes</label>
                        <textarea
                          placeholder="Colors, thicknesses, or delivery site..."
                          rows="2"
                          value={quoteForm.message}
                          onChange={(e) => setQuoteForm({ ...quoteForm, message: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-dark-800 rounded-lg text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow"
                      >
                        Submit Quote Request
                      </button>
                    </form>
                  )}

                </div>
              )}

              {/* Base delivery badge */}
              <div className="flex items-center space-x-2 text-[10px] text-gray-400 border-t border-slate-100 dark:border-dark-800 pt-3">
                <Truck className="w-4 h-4 text-primary-500" />
                <span>Heavy delivery logistics dispatched from warehouse.</span>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
