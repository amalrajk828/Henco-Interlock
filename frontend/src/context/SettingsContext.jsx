import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    heroTitle: 'Henco Interlock - Premium Paving & Landscaping Solutions',
    heroSubtitle: 'We manufacture high-durability interlocking bricks, paving blocks, designer floor tiles, and robust kerbstones engineered for modern infrastructure.',
    aboutText: 'Henco Interlock is a leading provider of premium landscaping and concrete paving solutions. Backed by state-of-the-art manufacturing processes and standard curing procedures, we craft bricks, paving blocks, and tiles that stand the test of time and weather.',
    mission: 'To deliver premium quality, durable, and highly innovative landscaping and paving solutions that combine aesthetics with unparalleled engineering integrity.',
    vision: 'To be the most trusted and preferred partner in construction infrastructure, recognized for sustainable manufacturing practices and quality craftsmanship.',
    address: 'Henco Interlock Industries, Industrial Zone, Kochi, Kerala, India',
    phone: '+91 98765 43210',
    email: 'info@hencointerlock.com',
    businessHours: 'Monday - Saturday: 8:30 AM - 6:30 PM (Sunday: Closed)',
    whatsappNumber: '919876543210',
    facebookLink: 'https://facebook.com/hencointerlock',
    instagramLink: 'https://instagram.com/hencointerlock',
    linkedinLink: 'https://linkedin.com/company/hencointerlock',
    googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8473347963385!2d76.3267923!3d10.029312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080c8e1a5f6eef%3A0xe54fb72557e0fa0c!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      console.warn('Could not fetch settings from backend, using defaults:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, reloadSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
