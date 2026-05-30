import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'site_settings',
    },
    heroTitle: {
      type: String,
      default: 'Henco Interlock - Premium Paving & Landscaping Solutions',
    },
    heroSubtitle: {
      type: String,
      default: 'We manufacture high-durability interlocking bricks, paving blocks, designer floor tiles, and robust kerbstones engineered for modern infrastructure.',
    },
    aboutText: {
      type: String,
      default: 'Henco Interlock is a leading provider of premium landscaping and concrete paving solutions. Backed by state-of-the-art manufacturing processes and standard curing procedures, we craft bricks, paving blocks, and tiles that stand the test of time and weather.',
    },
    mission: {
      type: String,
      default: 'To deliver premium quality, durable, and highly innovative landscaping and paving solutions that combine aesthetics with unparalleled engineering integrity.',
    },
    vision: {
      type: String,
      default: 'To be the most trusted and preferred partner in construction infrastructure, recognized for sustainable manufacturing practices and quality craftsmanship.',
    },
    address: {
      type: String,
      default: 'Henco Interlock Industries, Industrial Zone, Kochi, Kerala, India',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    email: {
      type: String,
      default: 'info@hencointerlock.com',
    },
    businessHours: {
      type: String,
      default: 'Monday - Saturday: 8:30 AM - 6:30 PM (Sunday: Closed)',
    },
    whatsappNumber: {
      type: String,
      default: '919876543210', // digits with country code, no symbols
    },
    facebookLink: {
      type: String,
      default: 'https://facebook.com/hencointerlock',
    },
    instagramLink: {
      type: String,
      default: 'https://instagram.com/hencointerlock',
    },
    linkedinLink: {
      type: String,
      default: 'https://linkedin.com/company/hencointerlock',
    },
    googleMapsEmbedUrl: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8473347963385!2d76.3267923!3d10.029312!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080c8e1a5f6eef%3A0xe54fb72557e0fa0c!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
