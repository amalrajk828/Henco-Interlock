import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin, Hammer, ArrowUp } from 'lucide-react';

const Footer = () => {
  const { settings } = useSettings();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 dark:bg-dark-950 dark:text-gray-400 pt-16 pb-8 overflow-hidden transition-all duration-300 border-t border-slate-800 dark:border-dark-900">
      
      {/* Curved Divider Accent */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[15px] fill-slate-50 dark:fill-dark-950">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-lg flex items-center justify-center shadow-md shadow-primary-600/30">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-wider text-white">HENCO</span>
                <span className="block text-[8px] uppercase tracking-[0.2em] font-semibold text-primary-500">
                  Interlocks &amp; Pavers
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 dark:text-gray-500">
              {settings.aboutText ? settings.aboutText.slice(0, 160) + '...' : 'Leading manufacturer of concrete paving blocks, interlocking bricks, kerbstones, and non-slip exterior tiles engineered to support heavy infrastructures.'}
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {settings.facebookLink && (
                <a
                  href={settings.facebookLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white dark:bg-dark-900 transition-smooth"
                  aria-label="Facebook Link"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagramLink && (
                <a
                  href={settings.instagramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white dark:bg-dark-900 transition-smooth"
                  aria-label="Instagram Link"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.linkedinLink && (
                <a
                  href={settings.linkedinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-primary-600 hover:text-white dark:bg-dark-900 transition-smooth"
                  aria-label="Linkedin Link"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white tracking-wider text-base uppercase border-l-2 border-primary-500 pl-3 mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Home Page</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Our Product Catalog</Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Latest Projects Showcase</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">About Henco Profile</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Contact Us Office</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Inquiry Tracking</Link>
              </li>
            </ul>
          </div>

          {/* Product Categories Links */}
          <div>
            <h4 className="font-semibold text-white tracking-wider text-base uppercase border-l-2 border-primary-500 pl-3 mb-6">
              Our Products
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link to="/products?category=interlocking-bricks" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Interlocking Bricks</Link>
              </li>
              <li>
                <Link to="/products?category=paving-blocks" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Paving Blocks / Pavers</Link>
              </li>
              <li>
                <Link to="/products?category=floor-tiles" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Exterior Floor Tiles</Link>
              </li>
              <li>
                <Link to="/products?category=kerbstones" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Concrete Kerbstones</Link>
              </li>
              <li>
                <Link to="/products?category=garden-landscaping-products" className="hover:text-primary-500 transition-smooth block hover:translate-x-1">Garden Pavers &amp; Blocks</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-semibold text-white tracking-wider text-base uppercase border-l-2 border-primary-500 pl-3 mb-6">
              Office Details
            </h4>
            <ul className="space-y-4 text-sm text-slate-400 dark:text-gray-500">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span>{settings.address || 'Henco Interlock Industries, Industrial Zone, Kochi, Kerala, India'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{settings.phone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>{settings.email || 'info@hencointerlock.com'}</span>
              </li>
              <li className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span className="text-[12px]">{settings.businessHours || 'Mon - Sat: 8:30 AM - 6:30 PM (Sun: Closed)'}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Base bar */}
        <div className="pt-8 mt-12 border-t border-slate-800 dark:border-dark-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-gray-600">
          <p className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Henco Interlocks &amp; Pavers. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/admin/login" className="hover:text-primary-500">Admin Gate</Link>
            <button
              onClick={handleScrollTop}
              className="flex items-center space-x-1 hover:text-white transition-smooth"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
