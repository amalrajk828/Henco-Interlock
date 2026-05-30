import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import { MessageSquare, Clock, ArrowRight, ShieldCheck, Activity, BarChart3, PieChart, Layers } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/settings/stats');
      setStats(statsRes.data);

      const logsRes = await api.get('/auth/logs');
      setLogs(logsRes.data.slice(0, 8)); // latest 8 logs

    } catch (err) {
      console.error('Failed to load dashboard parameters:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Analytics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-10 text-left">
      
      {/* Upper Brand Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-dark-800">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Office Control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review aggregates, product stock updates, client quote lists, and system security event logs.</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-2xl border border-emerald-250 shrink-0 self-start md:self-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Access Clearance</span>
            <span className="block text-xs font-extrabold text-emerald-800 dark:text-emerald-400">Secure JWT Active</span>
          </div>
        </div>
      </div>

      {/* 3 Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Products */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow transition-all">
          <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Products</span>
            <strong className="text-3xl text-gray-900 dark:text-white font-extrabold">{stats?.totalProducts || 0}</strong>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow transition-all">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Quotes</span>
            <strong className="text-3xl text-gray-900 dark:text-white font-extrabold">{stats?.totalInquiries || 0}</strong>
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl flex items-center space-x-4 shadow-sm hover:shadow transition-all">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pending Quotes</span>
            <strong className="text-3xl text-gray-900 dark:text-white font-extrabold">{stats?.pendingInquiries || 0}</strong>
          </div>
        </div>

      </div>

      {/* Mid Sections: Categories Stats & Stock Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Categories Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-1.5 border-b border-slate-100 dark:border-dark-800 pb-3">
            <BarChart3 className="w-4 h-4 text-primary-500" />
            <span>Product Categories Distribution</span>
          </h3>

          <div className="space-y-4">
            {stats?.categoryStats?.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                  <span className="text-gray-500 dark:text-gray-400">{item.count} items</span>
                </div>
                {/* Visual Bar percentage representation (safely cap max width) */}
                <div className="w-full bg-slate-100 dark:bg-dark-950 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats?.totalProducts > 0 ? (item.count / stats.totalProducts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock status meters */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-1.5 border-b border-slate-100 dark:border-dark-800 pb-3">
            <PieChart className="w-4 h-4 text-primary-500" />
            <span>Stock Inventory Breakdown</span>
          </h3>

          <div className="grid grid-cols-3 gap-4 pt-2 text-center">
            
            {/* In Stock */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl">
              <span className="text-[9px] font-bold uppercase text-emerald-600 block">In Stock</span>
              <strong className="text-2xl text-emerald-800 dark:text-emerald-400 font-extrabold mt-1 block">{stats?.stockStats?.inStock || 0}</strong>
            </div>

            {/* Low Stock */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
              <span className="text-[9px] font-bold uppercase text-amber-600 block">Low Stock</span>
              <strong className="text-2xl text-amber-800 dark:text-amber-400 font-extrabold mt-1 block">{stats?.stockStats?.lowStock || 0}</strong>
            </div>

            {/* Out of Stock */}
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 rounded-2xl">
              <span className="text-[9px] font-bold uppercase text-red-650 block">Out of Stock</span>
              <strong className="text-2xl text-red-700 dark:text-red-400 font-extrabold mt-1 block">{stats?.stockStats?.outOfStock || 0}</strong>
            </div>

          </div>

          <div className="text-[10px] text-gray-400 italic bg-slate-50 dark:bg-dark-950 p-4 rounded-2xl text-center border border-slate-100 dark:border-dark-850">
            Keep product catalogs verified to prevent client drop-outs on quote requests.
          </div>

        </div>

      </div>

      {/* Bottom Grid: Recent Inquiries & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Inquiries List */}
        <div className="lg:col-span-7 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-3">
            <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-1.5">
              <MessageSquare className="w-4 h-4 text-primary-500" />
              <span>Recent Quote Inquiries</span>
            </h3>
            <Link
              to="/admin/inquiries"
              className="text-[10px] font-bold text-primary-650 hover:underline uppercase flex items-center space-x-1"
            >
              <span>Manage Inquiries</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.recentInquiries?.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No quote inquiries registered yet.</p>
          ) : (
            <div className="space-y-4">
              {stats?.recentInquiries?.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-dark-950 border border-slate-100 dark:border-dark-850 rounded-2xl text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-gray-950 dark:text-white block">{item.name}</span>
                    <span className="text-[10px] text-gray-450 block">{item.productInterested?.name || 'Custom Paver'} ({item.quantity} Sq Ft)</span>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : item.status === 'Contacted'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Activity Logs */}
        <div className="lg:col-span-5 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl space-y-6">
          <h3 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center space-x-1.5 border-b border-slate-100 dark:border-dark-800 pb-3">
            <Activity className="w-4 h-4 text-primary-500" />
            <span>Panel Activity Logs</span>
          </h3>

          {logs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No logging event tracks recorded.</p>
          ) : (
            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log._id} className="text-[11px] border-b border-slate-100 dark:border-dark-850 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between font-bold text-gray-800 dark:text-gray-300">
                    <span className="line-clamp-1">{log.admin?.name || 'Administrator'}</span>
                    <span className="text-[9px] text-gray-400 font-medium shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{log.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
