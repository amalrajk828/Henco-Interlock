import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Layers, Plus, Edit, Trash2, X, ShieldAlert, Calendar } from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Slide drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Residential',
    clientName: '',
    completionDate: '',
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [beforeImageFile, setBeforeImageFile] = useState(null);
  const [afterImageFile, setAfterImageFile] = useState(null);
  const [existingImagesList, setExistingImagesList] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      setError('Failed to fetch portfolio: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenDrawer = (proj = null) => {
    setError('');
    setSuccess('');
    setImageFiles([]);
    setBeforeImageFile(null);
    setAfterImageFile(null);

    if (proj) {
      setEditingId(proj._id);
      setForm({
        title: proj.title,
        description: proj.description || '',
        category: proj.category,
        clientName: proj.clientName || '',
        completionDate: proj.completionDate ? proj.completionDate.split('T')[0] : '',
      });
      setExistingImagesList(proj.images || []);
    } else {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        category: 'Residential',
        clientName: '',
        completionDate: '',
      });
      setExistingImagesList([]);
    }
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, category } = form;
    if (!title || !category) {
      setError('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('description', form.description);
    formData.append('clientName', form.clientName);
    formData.append('completionDate', form.completionDate);

    // Append Standard images
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    // Append Before/After comparison images if chosen
    if (beforeImageFile) {
      formData.append('beforeImage', beforeImageFile);
    }
    if (afterImageFile) {
      formData.append('afterImage', afterImageFile);
    }

    // Keep existing images list
    if (editingId) {
      existingImagesList.forEach((img) => {
        formData.append('existingImages', img);
      });
    }

    try {
      let res;
      if (editingId) {
        res = await api.put(`/projects/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        if (imageFiles.length === 0 && !beforeImageFile) {
          setError('At least one standard project image or a before/after image is required.');
          return;
        }
        res = await api.post('/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.status === 200 || res.status === 201) {
        setSuccess(editingId ? 'Portfolio project updated' : 'Portfolio project added');
        setIsDrawerOpen(false);
        fetchProjects();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit portfolio specifications.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project portfolio "${title}"?`)) {
      return;
    }
    try {
      await api.delete(`/projects/${id}`);
      setSuccess('Portfolio item deleted successfully');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete portfolio item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-dark-800">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Admin control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Project Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Post portfolio transformations, compile dimensions, or adjust client metadata tags.</p>
        </div>

        <button
          onClick={() => handleOpenDrawer()}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-smooth flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
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

      {/* Grid listing */}
      {loading ? (
        <div className="max-w-7xl mx-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-16 rounded-3xl text-center">
          <span className="text-4xl">📐</span>
          <h3 className="font-bold text-gray-900 dark:text-white mt-4">Portfolio is empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">Click "Add New Project" to catalog finished pavement layouts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-200/30">
                {proj.images?.[0] ? (
                  <img src={`${api.defaults.baseURL.replace('/api', '')}${proj.images[0]}`} alt={proj.title} className="w-full h-full object-cover" />
                ) : (
                  <Layers className="w-8 h-8 text-gray-400" />
                )}
                <span className="absolute top-3 left-3 text-[9px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded uppercase">{proj.category}</span>
              </div>
              
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="font-extrabold text-gray-950 dark:text-white text-base leading-tight line-clamp-1">{proj.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{proj.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-dark-800 text-[10px] text-gray-400">
                  <span>Client: {proj.clientName || 'Private'}</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenDrawer(proj)} className="p-1.5 hover:bg-primary-50 dark:hover:bg-dark-800 text-primary-600 rounded">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(proj._id, proj.title)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-dark-900 border-l border-slate-200 dark:border-dark-800 shadow-2xl flex flex-col justify-between h-full animate-slide-in">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-primary-500" />
                <span>{editingId ? 'Modify Project Portfolio' : 'Add Project Portfolio'}</span>
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-450">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Project Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Residential Driveway installation, Kochi"
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Public Space">Public Space</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Client Name</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="e.g. Skyline Builders"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-455 dark:text-gray-400 uppercase">Completion Date</label>
                <input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase">Project Description</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Laid down 4000 square feet of heavy duty paving bricks with dual pattern alignments..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              {/* Multiple standard photos uploads */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-dark-800">
                <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase block">Standard Portfolio Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(Array.from(e.target.files))}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-dark-950 file:text-primary-650 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Before/After upload parameters */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-dark-800">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase block">Before Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforeImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:py-1 file:px-2.5 file:rounded file:bg-slate-100 dark:file:bg-dark-950 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-450 dark:text-gray-400 uppercase block">After Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterImageFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:py-1 file:px-2.5 file:rounded file:bg-slate-100 dark:file:bg-dark-950 cursor-pointer"
                  />
                </div>
              </div>

            </form>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-200 dark:border-dark-800 flex space-x-3.5 bg-slate-50 dark:bg-dark-950">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-1/2 py-3 border border-slate-200 dark:border-dark-800 text-gray-650 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                className="w-1/2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow"
              >
                {editingId ? 'Modify portfolio' : 'Post project'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectManagement;
