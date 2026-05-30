import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext.jsx';
import api from '../../services/api.js';
import { Settings, Save, Home, Phone, Share2, Map, ShieldAlert, Loader2 } from 'lucide-react';

const WebsiteManagement = () => {
  const { settings, reloadSettings } = useSettings();

  const [form, setForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    mission: '',
    vision: '',
    address: '',
    phone: '',
    email: '',
    businessHours: '',
    whatsappNumber: '',
    facebookLink: '',
    instagramLink: '',
    linkedinLink: '',
    googleMapsEmbedUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('homepage');

  useEffect(() => {
    if (settings) {
      setForm({
        heroTitle: settings.heroTitle || '',
        heroSubtitle: settings.heroSubtitle || '',
        aboutText: settings.aboutText || '',
        mission: settings.mission || '',
        vision: settings.vision || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        businessHours: settings.businessHours || '',
        whatsappNumber: settings.whatsappNumber || '',
        facebookLink: settings.facebookLink || '',
        instagramLink: settings.instagramLink || '',
        linkedinLink: settings.linkedinLink || '',
        googleMapsEmbedUrl: settings.googleMapsEmbedUrl || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/settings', form);
      if (res.status === 200) {
        setSuccess('Global site settings updated successfully');
        reloadSettings(); // Refresh context values across the app
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update site settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-dark-800">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Admin control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Website Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure landing page texts, social networks, telephone lines, and Google Maps embed keys.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-smooth flex items-center space-x-1.5 shrink-0 self-start sm:self-auto disabled:bg-slate-350 animate-pulse-glow"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-650 animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-lg text-xs text-emerald-800 animate-fade-in">
          {success}
        </div>
      )}

      {/* Grid tabs navigators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Navigation Tabs */}
        <div className="lg:col-span-3 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl space-y-3.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b pb-2">Menu Sections</span>
          
          <button
            onClick={() => setActiveTab('homepage')}
            className={`w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'homepage'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Landing Page</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'contacts'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Support Coordinates</span>
          </button>

          <button
            onClick={() => setActiveTab('socials')}
            className={`w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${
              activeTab === 'socials'
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-800'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social &amp; Maps</span>
          </button>
        </div>

        {/* Right Side Form Panel */}
        <div className="lg:col-span-9 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-8 rounded-3xl shadow-sm text-left">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. HOMEPAGE TAB */}
            {activeTab === 'homepage' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-3">
                  <Home className="w-4.5 h-4.5 text-primary-500" />
                  <span>Landing page parameters</span>
                </h3>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Hero Banner Main Title</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={form.heroTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Hero Banner Subtitle Description</label>
                  <textarea
                    name="heroSubtitle"
                    value={form.heroSubtitle}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  ></textarea>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Company About Text Block</label>
                  <textarea
                    name="aboutText"
                    value={form.aboutText}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Mission Statement</label>
                    <textarea
                      name="mission"
                      value={form.mission}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Vision Statement</label>
                    <textarea
                      name="vision"
                      value={form.vision}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    ></textarea>
                  </div>
                </div>

              </div>
            )}

            {/* 2. CONTACTS COORDINATES TAB */}
            {activeTab === 'contacts' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-3">
                  <Phone className="w-4.5 h-4.5 text-primary-500" />
                  <span>Support and locations details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Corporate Telephone Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Office Email Box</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      placeholder="info@hencointerlock.com"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Office Hours Summary</label>
                  <input
                    type="text"
                    name="businessHours"
                    value={form.businessHours}
                    onChange={handleInputChange}
                    placeholder="Monday - Saturday: 8:30 AM - 6:30 PM"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Physical Office Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  ></textarea>
                </div>

              </div>
            )}

            {/* 3. SOCIALS AND MAPS TAB */}
            {activeTab === 'socials' && (
              <div className="space-y-5 animate-fade-in">
                <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-3">
                  <Share2 className="w-4.5 h-4.5 text-primary-500" />
                  <span>Social indexes &amp; Maps anchors</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">WhatsApp chat number (with country code)</label>
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={form.whatsappNumber}
                      onChange={handleInputChange}
                      placeholder="919876543210"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Facebook Link</label>
                    <input
                      type="url"
                      name="facebookLink"
                      value={form.facebookLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Instagram Link</label>
                    <input
                      type="url"
                      name="instagramLink"
                      value={form.instagramLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">LinkedIn Corporate Company Link</label>
                    <input
                      type="url"
                      name="linkedinLink"
                      value={form.linkedinLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Google Maps Embed Frame Iframe URL</label>
                  <textarea
                    name="googleMapsEmbedUrl"
                    value={form.googleMapsEmbedUrl}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  ></textarea>
                </div>

              </div>
            )}

          </form>

        </div>

      </div>

    </div>
  );
};

export default WebsiteManagement;
