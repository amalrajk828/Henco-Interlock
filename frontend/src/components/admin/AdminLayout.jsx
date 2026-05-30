import React, { useState } from 'react';
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { MessageSquare, Clock, ShieldCheck, Home, LogOut, Layers, Settings, LayoutDashboard, Menu, X, ArrowLeft, Users, User } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading, logoutAdmin } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Verifying admin session...</span>
      </div>
    );
  }

  // Auth gate check: redirect if not authenticated
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Products', path: '/admin/products', icon: Layers },
    { name: 'Client Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Pavements Gallery', path: '/admin/projects', icon: Layers },
    { name: 'Website Settings', path: '/admin/settings', icon: Settings },
    { name: 'Manage Admins', path: '/admin/users', icon: Users },
    { name: 'Admin Settings', path: '/admin/profile', icon: User },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isLinkActive = (path) => {
    return location.pathname === path
      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
      : 'text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-primary-600';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      
      {/* 1. DESKTOP SIDEBAR PANEL */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 h-screen sticky top-0 py-6 text-left">
        
        <div className="space-y-8 px-4">
          
          {/* Logo brand */}
          <Link to="/" className="flex items-center space-x-2 px-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-wider">Henco Admin</span>
              <span className="block text-[8px] uppercase tracking-[0.2em] font-semibold text-primary-600 dark:text-primary-400">
                Security clearance
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="space-y-1.5">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${isLinkActive(link.path)}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Footer actions */}
        <div className="px-4 space-y-3.5">
          
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-primary-600 uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-primary-500 shrink-0" />
            <span>Go to Website</span>
          </Link>

          <button
            onClick={logoutAdmin}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log Out Panel</span>
          </button>
        </div>

      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION DRAWER */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Mobile Header Bar */}
        <header className="lg:hidden h-16 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-gray-900 dark:text-white uppercase">Henco Admin</span>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-slate-150"
            aria-label="Toggle Side panel menu"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex justify-start bg-slate-900/60 backdrop-blur-sm">
            <aside className="w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 p-6 flex flex-col justify-between text-left h-full">
              <div className="space-y-8">
                
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-base tracking-wider text-gray-950 dark:text-white uppercase flex items-center space-x-1">
                    <ShieldCheck className="w-5 h-5 text-primary-500" />
                    <span>Henco Admin</span>
                  </span>
                  <button onClick={toggleSidebar} className="text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {adminLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-smooth ${isLinkActive(link.path)}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-3.5">
                <Link
                  to="/"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-dark-800 hover:text-primary-650 uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4 text-primary-500 shrink-0" />
                  <span>Main Website</span>
                </Link>
                <button
                  onClick={logoutAdmin}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* 3. MAIN CONTENT CONTAINER OUTLET */}
        <main className="flex-1 bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
