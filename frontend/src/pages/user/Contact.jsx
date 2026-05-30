import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../services/api.js';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Facebook, Instagram, Linkedin } from 'lucide-react';

const getEmbedMapUrl = (url) => {
  if (!url) return '';
  if (url.includes('/embed') || url.includes('output=embed')) {
    return url;
  }
  
  try {
    if (url.includes('/place/')) {
      const parts = url.split('/place/');
      if (parts[1]) {
        const queryPart = parts[1].split('/')[0];
        const decodedQuery = decodeURIComponent(queryPart).replace(/\+/g, ' ');
        return `https://maps.google.com/maps?q=${encodeURIComponent(decodedQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
    }
    
    if (url.includes('google.com/maps')) {
      const urlObj = new URL(url);
      const qParam = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
      if (qParam) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(qParam)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
      
      const geoMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (geoMatch && geoMatch[1] && geoMatch[2]) {
        return `https://maps.google.com/maps?q=${geoMatch[1]},${geoMatch[2]}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
      }
    }
  } catch (e) {
    console.error('Failed to parse map url:', e.message);
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
};

const Contact = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    productInterested: '',
    area: '',
    quantity: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products?limit=100');
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to load products for dropdown:', err.message);
      }
    };
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, phone, email, productInterested, area, quantity } = form;
    if (!name || !phone || !email || !productInterested || !area || !quantity) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      const res = await api.post('/inquiries', form);
      if (res.status === 201) {
        setSubmitted(true);
        setForm({
          name: '',
          phone: '',
          email: '',
          productInterested: '',
          area: '',
          quantity: '',
          message: '',
        });

        // Redirect to tracking page
        setTimeout(() => {
          navigate(`/track?id=${res.data.trackingId}`);
        }, 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register enquiry. Please check variables and retry.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-16">
      
      {/* Header */}
      <div className="text-left space-y-2 max-w-2xl">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Office Contact</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Get In Touch</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Have questions about pricing, dimension tolerances, or bulk delivery locations? Connect with our support line.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Contact coordinates column */}
        <div className="lg:col-span-5 space-y-8 text-left">
          
          <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-8 rounded-3xl space-y-6">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">Corporate Headquarters</h3>
            
            <ul className="space-y-6 text-sm">
              <li className="flex items-start space-x-3.5">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Office Address</span>
                  <span className="text-gray-700 dark:text-gray-300">{settings.address || 'Henco Interlock Industries, Kochi, Kerala'}</span>
                </div>
              </li>
              <li className="flex items-start space-x-3.5">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Call Inquiries</span>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">{settings.phone || '+91 98765 43210'}</span>
                </div>
              </li>
              <li className="flex items-start space-x-3.5">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Direct Email</span>
                  <span className="text-gray-700 dark:text-gray-300">{settings.email || 'info@hencointerlock.com'}</span>
                </div>
              </li>
              <li className="flex items-start space-x-3.5">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Operational Hours</span>
                  <span className="text-gray-700 dark:text-gray-300 text-xs">{settings.businessHours || 'Mon - Sat: 8:30 AM - 6:30 PM (Sunday Closed)'}</span>
                </div>
              </li>
            </ul>

            {/* Social channels */}
            <div className="pt-6 border-t border-slate-100 dark:border-dark-800">
              <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Connect Online</span>
              <div className="flex space-x-3">
                {settings.facebookLink && (
                  <a href={settings.facebookLink} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-smooth text-gray-500">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {settings.instagramLink && (
                  <a href={settings.instagramLink} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-smooth text-gray-500">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {settings.linkedinLink && (
                  <a href={settings.linkedinLink} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 transition-smooth text-gray-500">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right message forms column */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-8 sm:p-10 rounded-3xl text-left shadow-sm">
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-6">Dispatch a Message</h3>
          
          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-6 rounded-2xl text-center space-y-4">
              <span className="text-4xl">🎉</span>
              <h4 className="font-extrabold text-emerald-800 dark:text-emerald-400 text-base">Message Registered!</h4>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 max-w-sm mx-auto">
                We have registered your parameters and sent details directly to our sales dispatch office. Redirecting you to track status...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Line</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Product Interest</label>
                  <select
                    name="productInterested"
                    value={form.productInterested}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-850 dark:text-white cursor-pointer"
                  >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Area (Sq Ft)</label>
                  <input
                    type="number"
                    name="area"
                    value={form.area}
                    onChange={handleInputChange}
                    placeholder="Estimated square footage"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-850 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase tracking-wider">Quantity (Units / Pieces)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleInputChange}
                    placeholder="Estimated pieces"
                    required
                    min="1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-850 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Message Description</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Specify custom specifications, shapes, colors, or timeline parameters..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-850 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary-600/10 hover:shadow-primary-600/20 transition-smooth flex items-center justify-center space-x-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Dispatch Enquiry</span>
              </button>
            </form>
          )}

        </div>

      </div>

      {/* Google Maps Iframe block */}
      {settings.googleMapsEmbedUrl && getEmbedMapUrl(settings.googleMapsEmbedUrl) && (
        <div className="w-full h-[350px] rounded-3xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-dark-800/50 relative">
          <iframe
            src={getEmbedMapUrl(settings.googleMapsEmbedUrl)}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Google Maps Location Frame"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}

    </div>
  );
};

export default Contact;
