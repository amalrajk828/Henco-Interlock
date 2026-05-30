import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext.jsx';
import api, { getImageUrl } from '../../services/api.js';
import { ArrowRight, Star, ShieldCheck, Truck, Users, Settings, Blocks, Sparkles, MessageSquare } from 'lucide-react';

const Home = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    phone: '',
    email: '',
    productInterested: '',
    area: '',
    quantity: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [allProducts, setAllProducts] = useState([]); // for quote dropdown

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const catRes = await api.get('/categories');
        setCategories(catRes.data.slice(0, 6));

        // Fetch Featured Products
        const prodRes = await api.get('/products?isFeatured=true&limit=4');
        setFeaturedProducts(prodRes.data.products);

        // Fetch all products (for dropdown)
        const allProdRes = await api.get('/products?limit=100');
        setAllProducts(allProdRes.data.products);

        // Fetch Testimonials
        const testRes = await api.get('/testimonials');
        setTestimonials(testRes.data.slice(0, 4));

        // Fetch Recent Projects
        const projRes = await api.get('/projects');
        setProjects(projRes.data.slice(0, 3));

      } catch (err) {
        console.error('Failed to load homepage assets:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setQuoteForm({ ...quoteForm, [e.target.name]: e.target.value });
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const { name, phone, email, productInterested, area, quantity } = quoteForm;

    if (!name || !phone || !email || !productInterested || !area || !quantity) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.post('/inquiries', quoteForm);
      if (res.status === 201) {
        setFormSubmitted(true);
        // Clear form
        setQuoteForm({
          name: '',
          phone: '',
          email: '',
          productInterested: '',
          area: '',
          quantity: '',
          message: '',
        });
        
        // Redirect to tracking page after 4 seconds
        setTimeout(() => {
          navigate(`/track?id=${res.data.trackingId}`);
        }, 4000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    }
  };

  // Framer Motion Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 text-white pt-24 pb-16 px-4">
        {/* Background Overlay */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#c2410c_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-primary-600/20 text-primary-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-primary-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Heavy Duty &amp; Aesthetic Pavers</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              {settings.heroTitle || 'Premium Landscaping & Interlocking Pavers'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl"
            >
              {settings.heroSubtitle || 'We manufacture high-durability interlocking bricks, paving blocks, designer floor tiles, and robust kerbstones engineered for modern infrastructure.'}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-primary-600/20 transition-smooth group"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#quote-form"
                className="px-6 py-3.5 rounded-lg border border-slate-500 hover:border-white text-slate-200 hover:text-white font-bold text-sm uppercase tracking-wider transition-smooth"
              >
                Get Custom Quote
              </a>
            </motion.div>
          </div>

          {/* Hero Banner Image Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-800 flex items-center justify-center">
              {/* Fallback visual illustration block */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-900 to-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <Blocks className="w-16 h-16 text-primary-500 animate-float" />
                <span className="text-xl font-bold uppercase tracking-wider">Henco Quality Assurance</span>
                <p className="text-xs text-slate-400 max-w-sm">Manufactured using heavy-duty vibration compressors and premium pigment consolidations to support residential and heavy vehicular environments.</p>
                <div className="flex space-x-2">
                  <span className="text-[10px] bg-slate-700/60 py-1 px-2.5 rounded-full border border-slate-600">IS 15658 Comp</span>
                  <span className="text-[10px] bg-slate-700/60 py-1 px-2.5 rounded-full border border-slate-600">60mm / 80mm</span>
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/10 rounded-lg blur-2xl z-0 pointer-events-none"></div>
          </motion.div>

        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="py-20 bg-slate-50 dark:bg-dark-950 px-4 transition-colors">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Classification</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Product Categories
          </h2>
          <p className="max-w-xl mx-auto text-sm text-gray-500 dark:text-gray-400">
            Explore our specialized concrete landscaping products structured to support all architectural requirements.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-6 pt-10"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat._id}
                variants={fadeInUp}
                className="group relative bg-white dark:bg-dark-900 p-6 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/20"
              >
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                  <Blocks className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 text-left">{cat.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-left line-clamp-2">{cat.description || 'Premium structural solutions manufactured to quality standards.'}</p>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="mt-4 flex items-center space-x-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOG */}
      <section className="py-20 bg-white dark:bg-dark-900 px-4 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="text-left space-y-2">
              <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Sought After</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Featured Products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">Highlighting our most popular concrete blocks, non-slip floor tiles, and garden stones.</p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center space-x-1 px-4 py-2 text-xs font-bold tracking-wider uppercase bg-slate-100 hover:bg-primary-600 dark:bg-dark-800 text-gray-700 hover:text-white dark:text-gray-300 dark:hover:text-white rounded-lg transition-smooth shrink-0 self-start md:self-auto"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 w-full bg-slate-100 dark:bg-dark-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No featured products found. Check back soon.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => (
                <div
                  key={prod._id}
                  className="group bg-slate-50 dark:bg-dark-950 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 overflow-hidden hover-glow transition-all duration-300"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-200 flex items-center justify-center">
                    {prod.images && prod.images.length > 0 ? (
                      <img
                        src={getImageUrl(prod.images?.[0])}
                        alt={prod.name}
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none'; // hide broken images
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent"></div>
                    <span className="absolute top-3 left-3 text-[10px] font-semibold bg-primary-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {prod.category?.name || 'Henco Product'}
                    </span>
                  </div>

                  <div className="p-5 text-left space-y-3.5">
                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                    
                    <div className="pt-2 border-t border-slate-200 dark:border-dark-800 flex items-center justify-between">
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase tracking-wider">Est. Price</span>
                        <span className="font-extrabold text-primary-600 dark:text-primary-500 text-xs">Request Price</span>
                      </div>
                      <Link
                        to={`/products?slug=${prod.slug}`}
                        className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. WHY CHOOSE HENCO */}
      <section className="py-20 bg-slate-50 dark:bg-dark-950 px-4 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Our Edge</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Why Choose Henco Interlock?</h2>
            <p className="max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400">Engineering excellence combined with strict curing procedures and premium pigments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-left">Industrial Strength</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left leading-relaxed">
                Our interlocking bricks and paving tiles undergo heavy hydraulic compression and strict standard steam curing, yielding high load-bearing index values.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-2">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-left">Custom Designs &amp; Finishes</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left leading-relaxed">
                Available in multiple colors (terracotta clay, charcoal grey, and sunny sand) and custom textures, aligning perfectly with residential and public spaces.
              </p>
            </div>

            <div className="bg-white dark:bg-dark-900 p-8 rounded-2xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-2">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white text-left">On-Site Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-left leading-relaxed">
                Backed by a dedicated fleet of distribution vehicles, we deliver interlocking materials directly to your site, ensuring zero delays in work execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GET A QUOTE FORM */}
      <section id="quote-form" className="py-20 bg-white dark:bg-dark-900 px-4 transition-colors relative">
        <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-dark-950 rounded-3xl border border-slate-200/40 dark:border-dark-800/40 p-8 sm:p-12 shadow-xl relative z-10">
          <div className="text-center max-w-lg mx-auto space-y-4 mb-8">
            <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Quote Request</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Get a Custom Pricing Estimate</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fill in the fields below. Our specialists will review the sizing parameters and get in touch with you shortly.</p>
          </div>

          {formSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-2xl text-center space-y-4"
            >
              <span className="text-5xl">🎉</span>
              <h3 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-lg">Inquiry Submitted Successfully!</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 max-w-sm mx-auto">
                We have registered your quote request and sent a confirmation receipt directly to your email. Redirecting you to tracking status lookup now...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleQuoteSubmit} className="space-y-6">
              {formError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-600 text-left">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={quoteForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={quoteForm.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={quoteForm.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                </div>
                <div className="text-left space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product Selection</label>
                  <select
                    name="productInterested"
                    value={quoteForm.productInterested}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white cursor-pointer"
                  >
                    <option value="">Select a Product</option>
                    {allProducts.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Area (Square Feet)</label>
                  <input
                    type="number"
                    name="area"
                    value={quoteForm.area}
                    onChange={handleInputChange}
                    placeholder="Estimated area needed in square feet"
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity (Units / Pieces)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={quoteForm.quantity}
                    onChange={handleInputChange}
                    placeholder="Estimated pieces needed"
                    required
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                  />
                </div>
              </div>

              <div className="text-left space-y-1">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Additional Message</label>
                <textarea
                  name="message"
                  value={quoteForm.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Specify custom size requirements, color options, or shipping addresses..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm focus:outline-none focus:border-primary-500 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-primary-600/10 hover:shadow-primary-600/20 transition-smooth"
              >
                Submit Inquiry &amp; Generate Tracking Code
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 6. CLIENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-dark-950 px-4 transition-colors">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Endorsements</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Client Testimonials</h2>
              <p className="max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400">See how Henco products support builders, architects, and private owners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((test) => (
                <div
                  key={test._id}
                  className="bg-white dark:bg-dark-900 p-8 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 space-y-4 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center space-x-1 text-amber-500">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm italic text-gray-600 dark:text-gray-300 leading-relaxed">
                    "{test.review}"
                  </p>
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-dark-800 flex items-center justify-center font-bold text-primary-600">
                      {test.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{test.name}</h4>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {test.role} {test.company ? `@ ${test.company}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
