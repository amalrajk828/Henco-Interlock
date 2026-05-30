import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { Filter, Calendar, Award, User, RefreshCw, Layers } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Track toggle state for before/after comparison on specific project cards
  const [compareStates, setCompareStates] = useState({}); // { [projectId]: 'after' | 'before' }

  const categories = ['All', 'Residential', 'Commercial', 'Public Space', 'Industrial'];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        let url = '/projects';
        if (selectedCategory && selectedCategory !== 'All') {
          url += `?category=${selectedCategory}`;
        }
        const res = await api.get(url);
        setProjects(res.data);
        
        // Initialize comparative states as 'after'
        const initialStates = {};
        res.data.forEach(p => {
          initialStates[p._id] = 'after';
        });
        setCompareStates(initialStates);

      } catch (err) {
        console.error('Failed to load portfolio projects:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [selectedCategory]);

  const toggleComparison = (id) => {
    setCompareStates(prev => ({
      ...prev,
      [id]: prev[id] === 'after' ? 'before' : 'after',
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Header */}
      <div className="text-left space-y-2 mb-10">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Henco Portfolio</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Completed Projects</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl">Explore our landscaping installations. Toggle the before/after views to see our structural transformations.</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-3.5 mb-12 border-b border-slate-200 dark:border-dark-800 pb-6">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-smooth ${
              (selectedCategory === cat || (cat === 'All' && selectedCategory === ''))
                ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                : 'bg-white dark:bg-dark-900 text-gray-600 dark:text-gray-300 border border-slate-200/50 dark:border-dark-800/50 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 w-full bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl animate-pulse skeleton-shimmer"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 rounded-3xl border border-slate-200/50 dark:border-dark-800/50 p-16 text-center space-y-4 max-w-md mx-auto">
          <span className="text-4xl">🧱</span>
          <h3 className="font-bold text-gray-900 dark:text-white">No projects posted</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Check back soon for completed residential and commercial paving highlights.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => {
            const hasComparison = !!proj.beforeImage && !!proj.afterImage;
            const currentView = compareStates[proj._id] || 'after';
            const displayImage = hasComparison 
              ? (currentView === 'before' ? proj.beforeImage : proj.afterImage)
              : (proj.images?.[0] || '');

            return (
              <div
                key={proj._id}
                className="group bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary-500/20 transition-all duration-300 text-left flex flex-col justify-between"
              >
                {/* Visual comparator frame */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                  {displayImage ? (
                    <img
                      src={`${api.defaults.baseURL.replace('/api', '')}${displayImage}`}
                      alt={proj.title}
                      className="h-full w-full object-cover transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  
                  {/* Floating badge */}
                  <span className="absolute top-4 left-4 text-[9px] font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center space-x-1 backdrop-blur-sm">
                    <Layers className="w-3 h-3 text-primary-500" />
                    <span>{proj.category}</span>
                  </span>

                  {/* Before/After Toggle Controls Overlay */}
                  {hasComparison && (
                    <div className="absolute bottom-4 right-4 z-20 flex items-center space-x-2">
                      <button
                        onClick={() => toggleComparison(proj._id)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md hover:bg-primary-600 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-md border border-slate-700/50 hover:border-primary-500 transition-smooth"
                      >
                        <RefreshCw className="w-3 h-3 animate-pulse" />
                        <span>Show {currentView === 'after' ? 'Before' : 'After'}</span>
                      </button>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase border ${
                        currentView === 'after'
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-amber-600 text-white border-amber-500'
                      }`}>
                        {currentView}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-lg line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {proj.description || 'Professional interlocking concrete brick installation completing precise alignment and premium finish.'}
                    </p>
                  </div>

                  {/* Metadata labels */}
                  <div className="pt-4 border-t border-slate-100 dark:border-dark-800 grid grid-cols-2 gap-4 text-[10px] text-gray-400">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary-500" />
                      <span className="line-clamp-1">{proj.clientName || 'Private Residence'}</span>
                    </div>
                    <div className="flex items-center space-x-2 justify-end">
                      <Calendar className="w-4 h-4 text-primary-500" />
                      <span>{proj.completionDate ? new Date(proj.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Completed'}</span>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Projects;
