import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { Sun, Moon, Menu, X, Hammer, ShieldAlert, FileSearch, LogOut } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logoutAdmin } = useAuth();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-primary-600 dark:text-primary-500 font-semibold border-b-2 border-primary-600 dark:border-primary-500'
      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 hover:translate-y-[-1px]';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Projects Gallery', path: '/projects' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-nav shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-md shadow-primary-600/20">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-gray-900 dark:text-white font-sans">
                HENCO
              </span>
              <span className="block text-[9px] uppercase tracking-[0.2em] font-semibold text-primary-600 dark:text-primary-400">
                Interlocks &amp; Pavers
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`py-2 text-sm tracking-wide transition-smooth ${isActive(link.path)}`}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Lookup Status Route */}
            <Link
              to="/track"
              className={`flex items-center space-x-1.5 py-1 px-3 rounded-full text-xs font-medium border border-slate-200 dark:border-dark-800 ${
                location.pathname === '/track'
                  ? 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/30 dark:text-primary-400 dark:border-primary-900'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Track Quote</span>
            </Link>
          </div>

          {/* Right Action Icons (Theme switch & Admin login / Dashboard triggers) */}
          <div className="hidden lg:flex items-center space-x-4">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800 transition-smooth"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* Admin session links */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-smooth"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Admin Panel</span>
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-smooth"
                  title="Logout Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-primary-600 text-primary-600 dark:text-primary-500 dark:border-primary-500 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-smooth"
              >
                Admin Gate
              </Link>
            )}
          </div>

          {/* Mobile Menu & Theme Toggler Wrapper */}
          <div className="flex items-center space-x-2 lg:hidden">
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-dark-800"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-dark-800"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Sidebar Dropdown */}
      {isOpen && (
        <div className="lg:hidden glass-panel border-t border-slate-200/50 dark:border-dark-900/50 shadow-lg">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 text-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-smooth ${
                  location.pathname === link.path
                    ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/track"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center space-x-2 px-3 py-3 rounded-lg text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/10"
            >
              <FileSearch className="w-4 h-4" />
              <span>Track Inquiry Status</span>
            </Link>
            
            <div className="pt-4 border-t border-slate-200 dark:border-dark-800 flex justify-center">
              {user ? (
                <div className="flex flex-col space-y-2 w-full max-w-[200px]">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center space-x-1 py-2 px-4 rounded-lg bg-primary-600 text-white font-semibold text-sm shadow-sm"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      logoutAdmin();
                      setIsOpen(false);
                    }}
                    className="py-2 px-4 border border-red-500 rounded-lg text-red-500 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-950/10"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full max-w-[200px] text-center py-2 px-4 border border-primary-600 text-primary-600 dark:text-primary-500 dark:border-primary-500 rounded-lg font-semibold text-sm hover:bg-primary-600 hover:text-white"
                >
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
