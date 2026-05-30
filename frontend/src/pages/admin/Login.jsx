import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Hammer, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';

const Login = () => {
  const { loginAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock the login route if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both administrative email and password');
      return;
    }

    setLoading(true);
    const result = await loginAdmin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      
      <div className="max-w-md w-full bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-8 sm:p-10 rounded-3xl shadow-xl space-y-8 text-center relative overflow-hidden">
        
        {/* Curved styling details */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-primary-600"></div>

        {/* Logo Brand */}
        <div className="flex flex-col items-center space-y-2">
          <div className="bg-primary-600 text-white p-3 rounded-2xl inline-flex items-center justify-center shadow-lg shadow-primary-600/20">
            <Hammer className="w-6 h-6 animate-float" />
          </div>
          <div>
            <h2 className="font-extrabold text-2xl tracking-wider text-gray-900 dark:text-white">HENCO INTERLOCK</h2>
            <span className="block text-[10px] uppercase tracking-[0.2em] font-semibold text-primary-600 dark:text-primary-400">
              Administration Portal
            </span>
          </div>
        </div>



        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-xl text-xs text-red-650 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrative email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Security Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow shadow-primary-600/10 hover:shadow-primary-600/20 flex items-center justify-center space-x-1.5 disabled:bg-slate-350"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Sign In to Dashboard</span>
          </button>

        </form>

      </div>

    </div>
  );
};

export default Login;
