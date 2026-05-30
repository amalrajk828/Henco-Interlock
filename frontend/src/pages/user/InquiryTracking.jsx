import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api.js';
import { Search, Loader2, Calendar, ShoppingBag, FileText, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const InquiryTracking = () => {
  const location = useLocation();
  const [trackingId, setTrackingId] = useState('');
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Extract ID parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (idParam) {
      setTrackingId(idParam);
      handleTrack(idParam);
    }
  }, [location]);

  const handleTrack = async (idToTrack) => {
    const id = idToTrack || trackingId;
    if (!id) {
      setError('Please provide a valid Henco tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setInquiry(null);

    try {
      const res = await api.get(`/inquiries/track/${id.toUpperCase().trim()}`);
      setInquiry(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to locate tracking ID. Please double check the code.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-8 h-8 text-amber-500 animate-pulse" />;
      case 'Contacted':
        return <CheckCircle2 className="w-8 h-8 text-blue-500" />;
      case 'Closed':
        return <CheckCircle2 className="w-8 h-8 text-emerald-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Under Sales Review';
      case 'Contacted':
        return 'Sales Representative Dispatched';
      case 'Closed':
        return 'Quotation Confirmed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 min-h-screen space-y-12">
      
      {/* Header */}
      <div className="text-left space-y-2">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Quote Progress</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Track Inquiry Status</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Enter the unique Henco tracking code (e.g., HN-2026-XXXXXX) provided after inquiry submission to review real-time processing status.</p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 sm:p-8 rounded-3xl text-left shadow-sm space-y-4">
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase tracking-wider">Inquiry Tracking Code</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. HN-2026-123456"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-xs font-semibold focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white placeholder:text-gray-400 tracking-widest"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              onClick={() => handleTrack()}
              disabled={loading}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow disabled:bg-slate-350 flex items-center justify-center space-x-1.5 shrink-0"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Verify Status</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-650 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Inquiry details panel */}
      {inquiry && (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl shadow-sm text-left overflow-hidden animate-fade-in">
          
          {/* Header Progress status bar */}
          <div className="bg-slate-50 dark:bg-dark-950 p-6 border-b border-slate-200/50 dark:border-dark-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tracking Code</span>
              <strong className="block text-xl text-primary-600 dark:text-primary-500 font-extrabold tracking-wider">{inquiry.trackingId}</strong>
            </div>

            <div className="flex items-center space-x-3 bg-white dark:bg-dark-900 px-4 py-2.5 rounded-2xl border border-slate-200/30 dark:border-dark-850">
              {getStatusIcon(inquiry.status)}
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Current Status</span>
                <span className="block text-xs font-extrabold text-gray-800 dark:text-white">{getStatusText(inquiry.status)}</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Parameters listing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 dark:border-dark-800">
              
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Inquiry Parameters</h4>
                <ul className="space-y-3.5 text-xs">
                  <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <ShoppingBag className="w-4 h-4 text-primary-500 shrink-0" />
                    <span>Product: <strong>{inquiry.productInterested?.name || 'Custom Paver'}</strong></span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <FileText className="w-4 h-4 text-primary-500 shrink-0" />
                    <span>Volume: <strong>{inquiry.quantity} Square Feet</strong></span>
                  </li>
                  <li className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                    <span>Date Submitted: <strong>{new Date(inquiry.createdAt).toLocaleDateString()}</strong></span>
                  </li>
                </ul>
              </div>

              {/* Product Specifications Snippet */}
              {inquiry.productInterested && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-dark-950 rounded-2xl border border-slate-100 dark:border-dark-850">
                  <h5 className="font-extrabold text-[10px] text-gray-450 dark:text-gray-400 uppercase tracking-wider">Selected Product Details</h5>
                  <span className="block font-bold text-xs text-gray-900 dark:text-white leading-tight">{inquiry.productInterested.name}</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{inquiry.productInterested.description}</p>
                  <span className="block text-[10px] font-bold text-primary-600 dark:text-primary-500">Est. Rate: ₹{inquiry.productInterested.pricePerSqFt} / Sq Ft</span>
                </div>
              )}

            </div>

            {/* Admin Response/Comments */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Replying Office Comments</h4>
              
              <div className="p-5 bg-primary-50/40 dark:bg-primary-950/10 border-l-4 border-primary-600 rounded-r-xl">
                {inquiry.adminComments ? (
                  <p className="text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{inquiry.adminComments}"
                  </p>
                ) : inquiry.status === 'Pending' ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Our sales representatives are currently verifying raw materials inventories and shipping logistics for Kochi, Kerala. We will contact you at your provided telephone number shortly.
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    No comments registered. A sales representative has been dispatched to coordinate physical site visitations.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default InquiryTracking;
