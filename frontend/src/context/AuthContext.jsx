import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('henco_admin_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          
          // Verify token actively with backend
          const res = await api.get('/auth/profile');
          setUser({ ...parsed, ...res.data });
        } catch (error) {
          console.warn('Active session verification failed, clearing tokens:', error.message);
          localStorage.removeItem('henco_admin_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginAdmin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('henco_admin_user', JSON.stringify(res.data));
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    }
  };

  const logoutAdmin = () => {
    setUser(null);
    localStorage.removeItem('henco_admin_user');
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, logoutAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
