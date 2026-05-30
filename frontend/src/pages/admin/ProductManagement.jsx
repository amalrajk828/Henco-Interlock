import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../services/api.js';
import { Blocks, Plus, Edit, Trash2, Check, X, ShieldAlert, Sparkles } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form / Slide-over Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    pricePerSqFt: '',
    colors: '',
    sizes: '',
    stockStatus: 'In Stock',
    isFeatured: false,
  });

  const [imageFiles, setImageFiles] = useState([]); // selected files for upload
  const [existingImagesList, setExistingImagesList] = useState([]); // when editing
  const [submitting, setSubmitting] = useState(false); // prevent double submits

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchCatalogData = async () => {
    setLoading(true);
    try {
      let url = '/admin/products?limit=100';
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;

      const prodRes = await api.get(url);
      setProducts(prodRes.data.products);

      const catRes = await api.get('/categories?all=true');
      setCategories(catRes.data);
    } catch (err) {
      setError('Failed to fetch catalog entries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCatalogData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, categoryFilter]);

  const handleOpenDrawer = (prod = null) => {
    setError('');
    setSuccess('');
    setImageFiles([]);

    if (prod) {
      // Editing
      setEditingId(prod._id);
      setForm({
        name: prod.name,
        category: prod.category?._id || prod.category,
        description: prod.description,
        pricePerSqFt: prod.pricePerSqFt.toString(),
        colors: prod.colors?.join(', ') || '',
        sizes: prod.sizes?.join(', ') || '',
        stockStatus: prod.stockStatus,
        isFeatured: prod.isFeatured,
      });
      setExistingImagesList(prod.images || []);
    } else {
      // Adding
      setEditingId(null);
      setForm({
        name: '',
        category: categories[0]?._id || '',
        description: '',
        pricePerSqFt: '',
        colors: '',
        sizes: '',
        stockStatus: 'In Stock',
        isFeatured: false,
      });
      setExistingImagesList([]);
    }
    setIsDrawerOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setSuccess('Product successfully deleted');
      fetchCatalogData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // ignore duplicates

    setError('');
    setSuccess('');

    const { name, category, description, pricePerSqFt } = form;
    if (!name || !category || !description || !pricePerSqFt) {
      setError('Please fill in all required fields.');
      return;
    }

    // Build FormData for upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('pricePerSqFt', pricePerSqFt);
    formData.append('stockStatus', form.stockStatus);
    formData.append('isFeatured', form.isFeatured);
    formData.append('colors', form.colors);
    formData.append('sizes', form.sizes);

    // Append files
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append existing images if editing
    if (editingId) {
      existingImagesList.forEach((img) => {
        formData.append('existingImages', typeof img === 'object' ? JSON.stringify(img) : img);
      });
    }

    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        // Edit Request
        res = await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Add Request
        if (imageFiles.length === 0) {
          setError('At least one product image is required for new items.');
          setSubmitting(false);
          return;
        }
        res = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.status === 200 || res.status === 201) {
        setSuccess(editingId ? 'Product updated successfully' : 'Product created successfully');
        setIsDrawerOpen(false);
        fetchCatalogData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit product parameters.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-dark-800">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Admin control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Add new paving slabs, configure custom dimensions, alter colors, or delete outdated items.</p>
        </div>

        <button
          onClick={() => handleOpenDrawer()}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-smooth flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
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

      {/* Search and Category Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center animate-fade-in">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="sm:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-xs text-gray-850 dark:text-white cursor-pointer focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main product listings */}
      {loading ? (
        <div className="max-w-7xl mx-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Catalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-16 rounded-3xl text-center animate-fade-in">
          <span className="text-4xl">🧱</span>
          <h3 className="font-bold text-gray-900 dark:text-white mt-4">Catalog is empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">No items match your parameters or the catalog list is empty.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Desktop View Table */}
          <div className="hidden md:block bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-dark-950 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-slate-100 dark:border-dark-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Visual</th>
                    <th className="px-6 py-4">Product Specs</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Est Price</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                  {products.map((prod) => (
                    <tr key={prod._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/50">
                      <td className="px-6 py-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-150 flex items-center justify-center border border-slate-200/40">
                          {prod.images?.[0] ? (
                            <img
                              src={getImageUrl(prod.images?.[0])}
                              alt={prod.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Blocks className="w-5 h-5 text-gray-400 animate-pulse" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-gray-900 dark:text-white block leading-tight truncate max-w-xs">{prod.name}</span>
                          {prod.isFeatured && (
                            <span className="inline-flex items-center text-[8px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.2 rounded border border-amber-500/20 uppercase tracking-widest">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300 truncate max-w-[150px]">
                        {prod.category?.name || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-gray-950 dark:text-white">
                        ₹{prod.pricePerSqFt}/Sq Ft
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          prod.stockStatus === 'In Stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.stockStatus === 'Low Stock'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.stockStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2.5">
                          <button
                            onClick={() => handleOpenDrawer(prod)}
                            className="p-2 bg-slate-100 hover:bg-primary-600 hover:text-white dark:bg-dark-800 dark:hover:bg-primary-500 rounded-lg text-gray-600 dark:text-gray-300 transition-smooth"
                            title="Edit specs"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id, prod.name)}
                            className="p-2 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-650 rounded-lg text-red-500 transition-smooth"
                            title="Delete from Catalog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View Cards */}
          <div className="block md:hidden space-y-4">
            {products.map((prod) => (
              <div
                key={prod._id}
                className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl p-5 shadow-sm space-y-4"
              >
                {/* Product Image */}
                <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/40 relative">
                  {prod.images?.[0] ? (
                    <img
                      src={getImageUrl(prod.images?.[0])}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <Blocks className="w-8 h-8 text-gray-400 animate-pulse" />
                  )}
                  {prod.isFeatured && (
                    <span className="absolute top-2.5 right-2.5 inline-flex items-center text-[8px] font-bold bg-amber-500/90 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow">
                      <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-1.5 text-left">
                  <h4 className="font-extrabold text-sm text-gray-900 dark:text-white break-words leading-tight">
                    {prod.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Category: <span className="text-gray-800 dark:text-gray-200 break-words">{prod.category?.name || 'Unassigned'}</span>
                    </span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      ₹{prod.pricePerSqFt}/Sq Ft
                    </span>
                  </div>
                </div>

                {/* Status and Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-dark-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Status */}
                  <div className="text-left">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${
                      prod.stockStatus === 'In Stock'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                        : prod.stockStatus === 'Low Stock'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                        : 'bg-red-50 text-red-700 border border-red-200/50'
                    }`}>
                      {prod.stockStatus}
                    </span>
                  </div>

                  {/* Stacked Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleOpenDrawer(prod)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-dark-800 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth flex items-center justify-center space-x-1.5 min-h-[40px] shadow-sm"
                    >
                      <Edit className="w-4.5 h-4.5" />
                      <span>Edit Specs</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod._id, prod.name)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-650 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-750 text-red-650 dark:text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth flex items-center justify-center space-x-1.5 min-h-[40px] shadow-sm"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Form drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-dark-900 border-l border-slate-200 dark:border-dark-800 shadow-2xl flex flex-col justify-between h-full animate-slide-in">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-primary-500" />
                <span>{editingId ? 'Modify Product Specifications' : 'Post New Product'}</span>
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Red Cosmic Paver Block"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">Choose category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Rate per Sq. Ft (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.pricePerSqFt}
                    onChange={(e) => setForm({ ...form, pricePerSqFt: e.target.value })}
                    placeholder="45"
                    min="1"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Product Description</label>
                <textarea
                  required
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Engineered using M40 grades, suitable for industrial yard pavings..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Colors (comma separated)</label>
                  <input
                    type="text"
                    value={form.colors}
                    onChange={(e) => setForm({ ...form, colors: e.target.value })}
                    placeholder="Red, Grey, Yellow"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-455 dark:text-gray-400 uppercase">Thicknesses (comma separated)</label>
                  <input
                    type="text"
                    value={form.sizes}
                    onChange={(e) => setForm({ ...form, sizes: e.target.value })}
                    placeholder="60mm, 80mm"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Stock Status</label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) => setForm({ ...form, stockStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-5 pl-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer">Featured Product</label>
                </div>
              </div>

              {/* Upload image selector */}
              <div className="space-y-2 pt-2">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase block">Product Image Attachments</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-dark-950 file:text-primary-600 hover:file:bg-slate-200 cursor-pointer"
                />
                <span className="block text-[9px] text-gray-450 italic">PNG, JPG, or WEBP. Max file size: 5MB.</span>
              </div>

              {/* Show pre-existing image paths when editing */}
              {editingId && existingImagesList.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-800">
                  <span className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase block">Existing Catalog Images</span>
                  <div className="flex flex-wrap gap-2">
                    {existingImagesList.map((img, i) => (
                      <div key={i} className="relative w-16 h-10 rounded overflow-hidden border border-slate-200">
                        <img src={getImageUrl(img)} alt="existing" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImagesList(existingImagesList.filter((x, index) => index !== i))}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </form>

            {/* Footer buttons block */}
            <div className="p-6 border-t border-slate-200 dark:border-dark-800 flex space-x-3.5 bg-slate-50 dark:bg-dark-950">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-1/2 py-3 border border-slate-200 dark:border-dark-800 text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={submitting}
                className="w-1/2 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-350 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow flex items-center justify-center"
              >
                {submitting ? 'Submitting...' : (editingId ? 'Modify specs' : 'Post product')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProductManagement;
