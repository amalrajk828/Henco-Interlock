import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';

// Layouts
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import WhatsAppButton from './components/layout/WhatsAppButton.jsx';
import FloatingCallButton from './components/layout/FloatingCallButton.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// User Pages
import Home from './pages/user/Home.jsx';
import Products from './pages/user/Products.jsx';
import Projects from './pages/user/Projects.jsx';
import About from './pages/user/About.jsx';
import Contact from './pages/user/Contact.jsx';
import InquiryTracking from './pages/user/InquiryTracking.jsx';

// Admin Pages
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ProductManagement from './pages/admin/ProductManagement.jsx';
import InquiryManagement from './pages/admin/InquiryManagement.jsx';
import ProjectManagement from './pages/admin/ProjectManagement.jsx';
import WebsiteManagement from './pages/admin/WebsiteManagement.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import ProfileManagement from './pages/admin/ProfileManagement.jsx';

// Public Page layout wrapper containing header & footer controls
const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <FloatingCallButton />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              
              {/* 1. PUBLIC USER CHANNELS */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="projects" element={<Projects />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="track" element={<InquiryTracking />} />
              </Route>

              {/* 2. ADMIN PRIVATE CHANNELS */}
              <Route path="/admin/login" element={<Login />} />
              
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="inquiries" element={<InquiryManagement />} />
                <Route path="projects" element={<ProjectManagement />} />
                <Route path="settings" element={<WebsiteManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="profile" element={<ProfileManagement />} />
              </Route>

            </Routes>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
