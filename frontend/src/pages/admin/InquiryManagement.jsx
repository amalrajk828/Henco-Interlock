import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { MessageSquare, Calendar, Phone, Mail, FileSpreadsheet, FileText, CheckCircle2, Clock, Eye, X, Loader2 } from 'lucide-react';

const InquiryManagement = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Review Modal State
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminComments, setAdminComments] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let url = `/inquiries?page=${currentPage}&limit=12`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      
      const res = await api.get(url);
      setInquiries(res.data.inquiries);
      setTotalPages(res.data.pages);
    } catch (err) {
      setError('Failed to fetch inquiry list: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInquiries();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, statusFilter, currentPage]);

  const handleOpenReview = (item) => {
    setSelectedInquiry(item);
    setAdminComments(item.adminComments || '');
    setCurrentStatus(item.status);
    setError('');
    setSuccess('');
  };

  const handleUpdateInquiry = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);

    try {
      const res = await api.put(`/inquiries/${selectedInquiry._id}`, {
        status: currentStatus,
        adminComments: adminComments,
      });

      if (res.status === 200) {
        setSuccess('Inquiry updated successfully');
        setSelectedInquiry(null);
        fetchInquiries();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update inquiry status');
    } finally {
      setUpdating(false);
    }
  };

  // Dispatch secure blob downloads inside the active browser frame
  const handleExport = async (format) => {
    setError('');
    setSuccess('');
    if (format === 'excel') setExportingExcel(true);
    if (format === 'pdf') setExportingPdf(true);

    try {
      const url = format === 'excel' ? '/inquiries/export' : '/inquiries/export/pdf';
      const response = await api.get(url, { responseType: 'blob' });
      
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `henco-inquiries-${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess(`Inquiries summary report successfully downloaded as ${format === 'excel' ? 'Excel' : 'PDF'}`);
    } catch (err) {
      setError(`Failed to export inquiries: ` + err.message);
    } finally {
      if (format === 'excel') setExportingExcel(false);
      if (format === 'pdf') setExportingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-dark-800">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Office Control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Inquiry Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review quote parameters, update reply logs, or export compiled spreadsheets.</p>
        </div>

        {/* Spreadsheet / PDF Export Widgets */}
        <div className="flex items-center space-x-3.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => handleExport('excel')}
            disabled={exportingExcel || exportingPdf}
            className="px-4 py-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-dark-800 dark:hover:bg-emerald-650 disabled:bg-slate-300 dark:disabled:bg-dark-900 disabled:text-gray-400 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth flex items-center space-x-1.5"
            title="Download Excel spreadsheet"
          >
            {exportingExcel ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-emerald-500" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-500 shrink-0 group-hover:text-white" />
            )}
            <span>{exportingExcel ? 'Exporting...' : 'Excel Export'}</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingExcel || exportingPdf}
            className="px-4 py-2.5 bg-slate-100 hover:bg-red-650 hover:text-white dark:bg-dark-800 dark:hover:bg-red-750 disabled:bg-slate-300 dark:disabled:bg-dark-900 disabled:text-gray-400 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth flex items-center space-x-1.5"
            title="Download PDF report document"
          >
            {exportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-red-500" />
            ) : (
              <FileText className="w-4 h-4 text-red-500 shrink-0 group-hover:text-white" />
            )}
            <span>{exportingPdf ? 'Exporting...' : 'PDF Summary'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-650">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-lg text-xs text-emerald-800">
          {success}
        </div>
      )}

      {/* Filter and search bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Tracking ID, name, phone, or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-xs text-gray-850 dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="">All Inquiries</option>
            <option value="Pending">Pending Review</option>
            <option value="Contacted">Contacted / Dispatched</option>
            <option value="Closed">Closed / Completed</option>
          </select>
        </div>

      </div>

      {/* inquiries table */}
      {loading ? (
        <div className="max-w-7xl mx-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Inquiries...</span>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-16 rounded-3xl text-center">
          <span className="text-4xl">✉</span>
          <h3 className="font-bold text-gray-900 dark:text-white mt-4">Inquiry desk empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">No client messages align with the parameters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-950 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-slate-100 dark:border-dark-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Tracking ID</th>
                    <th className="px-6 py-4">Client Detail</th>
                    <th className="px-6 py-4">Product Interest</th>
                    <th className="px-6 py-4">Volume / Area</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                  {inquiries.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/50">
                      <td className="px-6 py-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                        {item.trackingId}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-950 dark:text-white block leading-tight truncate max-w-xs">{item.name}</span>
                          <span className="text-[10px] text-gray-450 block truncate">{item.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-650 dark:text-gray-300 truncate max-w-[150px]">
                        {item.productInterested?.name || 'Custom Paver'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="space-y-0.5 text-left">
                          <span className="font-bold text-gray-950 dark:text-white block leading-tight">{item.area || 0} Sq Ft</span>
                          <span className="text-[10px] text-gray-450 block">{item.quantity || 0} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded ${
                          item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenReview(item)}
                            className="p-2 bg-slate-100 hover:bg-primary-600 hover:text-white dark:bg-dark-800 dark:hover:bg-primary-500 rounded-lg text-gray-600 dark:text-gray-300 transition-smooth"
                            title="Review Inquiry details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card-Based Listings */}
          <div className="block md:hidden space-y-4">
            {inquiries.map((item) => (
              <div
                key={item._id}
                className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-5 shadow-sm space-y-4 animate-fade-in"
              >
                {/* Header: Tracking ID & Status */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-800">
                  <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400">
                    {item.trackingId}
                  </span>
                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                    item.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                      : item.status === 'Contacted'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Client & Product details */}
                <div className="space-y-2 text-left text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-dark-950 p-3 rounded-2xl border border-slate-100 dark:border-dark-850">
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Client Name</span>
                      <span className="font-bold text-gray-900 dark:text-white block leading-tight truncate">{item.name}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider font-mono">Date Submitted</span>
                      <span className="text-gray-650 dark:text-gray-300 block">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Product Interested</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200 block truncate">{item.productInterested?.name || 'Custom Paver'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Required Volume</span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400 block">{item.area || 0} Sq Ft ({item.quantity || 0} units)</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Client Contacts</span>
                      <span className="text-gray-650 dark:text-gray-300 block truncate">{item.phone}</span>
                      <span className="text-gray-650 dark:text-gray-300 block truncate">{item.email}</span>
                    </div>
                  </div>

                  {/* Message Preview */}
                  {item.message && (
                    <div className="space-y-1">
                      <span className="block text-[8px] text-gray-400 uppercase font-bold tracking-wider">Client Message</span>
                      <p className="p-3 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-100 text-[11px] text-gray-650 dark:text-gray-350 truncate line-clamp-1">
                        "{item.message}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Review & Reply Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-dark-800">
                  <button
                    onClick={() => handleOpenReview(item)}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth flex items-center justify-center space-x-1.5 min-h-[40px] shadow"
                  >
                    <Eye className="w-4.5 h-4.5" />
                    <span>Review &amp; Log Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between text-xs font-bold text-gray-500">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded bg-white hover:bg-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 border border-slate-200 dark:border-dark-800 rounded bg-white hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

        </div>
      )}

      {/* Review & comment log updates Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between max-h-[90vh] text-left">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Inquiry Tracking Code</span>
                <h3 className="font-extrabold text-lg text-primary-650 tracking-wider flex items-center space-x-1.5">
                  <MessageSquare className="w-5 h-5 text-primary-500" />
                  <span>{selectedInquiry.trackingId}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable parameters listings */}
            <form onSubmit={handleUpdateInquiry} className="p-6 overflow-y-auto space-y-6">
              
              {/* Parameter cards summary */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-950 p-5 rounded-2xl border border-slate-100 dark:border-dark-850 text-xs">
                <div className="space-y-1.5">
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Client Name</span>
                  <span className="block font-bold text-gray-900 dark:text-white leading-tight">{selectedInquiry.name}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold font-mono">Date Registered</span>
                  <span className="block text-gray-700 dark:text-gray-300">{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Product Interest</span>
                  <span className="block font-bold text-gray-900 dark:text-white leading-tight">{selectedInquiry.productInterested?.name || 'Custom Paver'}</span>
                </div>
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Est. Area / Quantity</span>
                  <span className="block font-bold text-primary-600 dark:text-primary-400">{selectedInquiry.area || 0} Sq Ft / {selectedInquiry.quantity || 0} units</span>
                </div>
              </div>

              {/* Client message */}
              <div className="space-y-1">
                <span className="block text-[9px] text-gray-450 dark:text-gray-400 uppercase font-bold">Client Message Details</span>
                <p className="p-4 bg-slate-50 dark:bg-dark-950 rounded-2xl border border-slate-100 text-xs italic text-gray-600 dark:text-gray-350 leading-relaxed">
                  "{selectedInquiry.message || 'No additional parameters provided.'}"
                </p>
              </div>

              {/* Client contacts */}
              <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-dark-800 text-xs">
                <a href={`tel:${selectedInquiry.phone}`} className="flex items-center space-x-2 text-primary-650 hover:underline">
                  <Phone className="w-4 h-4" />
                  <span>{selectedInquiry.phone}</span>
                </a>
                <a href={`mailto:${selectedInquiry.email}`} className="flex items-center space-x-2 text-primary-650 hover:underline">
                  <Mail className="w-4 h-4" />
                  <span>{selectedInquiry.email}</span>
                </a>
              </div>

              {/* Update forms parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Process Status</label>
                  <select
                    value={currentStatus}
                    onChange={(e) => setCurrentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="Contacted">Contacted / Dispatched</option>
                    <option value="Closed">Closed / Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-455 dark:text-gray-400 uppercase">Reply Notes (Visible to Client)</label>
                <textarea
                  rows="3"
                  value={adminComments}
                  onChange={(e) => setAdminComments(e.target.value)}
                  placeholder="e.g. Sales rep has been dispatched with samples. Custom rate ₹42 quoted for Kochi aggregate..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                ></textarea>
              </div>

            </form>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-dark-800 flex space-x-3.5 bg-slate-50 dark:bg-dark-950">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 text-gray-650 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInquiry}
                disabled={updating}
                className="w-1/2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow flex items-center justify-center space-x-1"
              >
                {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Log Reply Updates</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InquiryManagement;
