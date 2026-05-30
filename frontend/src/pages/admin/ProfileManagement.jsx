import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api.js';
import { User, ShieldAlert, Key, Save, Bell, Loader2 } from 'lucide-react';

const ProfileManagement = () => {
  const { user, logoutAdmin } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    profilePicture: '',
    notificationsEnabled: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/profile/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setForm((prev) => ({
        ...prev,
        profilePicture: res.data.filePath,
      }));
      setSuccess('Profile photo uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        profilePicture: user.profilePicture || '',
        notificationsEnabled: user.notificationsEnabled !== false,
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { name, email, currentPassword, newPassword, confirmNewPassword } = form;

    if (!name || !email) {
      setError('Name and Email are required fields');
      setLoading(false);
      return;
    }

    // Password strength & consistency checks if shifting credentials
    if (newPassword) {
      if (!currentPassword) {
        setError('Current password is required to change to a new password');
        setLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        setLoading(false);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await api.put('/auth/profile', form);
      
      if (res.status === 200) {
        setSuccess(res.data.message);
        
        // Force re-login if password was changed
        if (res.data.passwordChanged) {
          setTimeout(() => {
            logoutAdmin();
          }, 3000);
        } else {
          // Update local session storage quietly
          const storedUser = localStorage.getItem('henco_admin_user');
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            localStorage.setItem('henco_admin_user', JSON.stringify({
              ...parsed,
              name: res.data.name,
              email: res.data.email,
              profilePicture: res.data.profilePicture,
              notificationsEnabled: res.data.notificationsEnabled,
            }));
          }
          // Clear credentials fields
          setForm(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
          }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update administrative profile settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-dark-800">
        <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Security control</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Admin Profile Settings</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Configure your username credentials, reset passwords, set an avatar path, or toggle operational notifications.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-655 animate-fade-in">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-lg text-xs text-emerald-800 animate-fade-in">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Avatar & session panel */}
        <div className="lg:col-span-4 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-6 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-dark-800 border-2 border-primary-500/20 text-primary-600 flex items-center justify-center font-extrabold text-3xl mx-auto shadow shadow-primary-500/10">
            {form.profilePicture ? (
              <img src={`${api.defaults.baseURL.replace('/api', '')}${form.profilePicture}`} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              form.name[0] || 'A'
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-gray-950 dark:text-white">{form.name || 'Admin'}</h3>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-0.5">{user?.role} Access Level</span>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-dark-800 text-[10px] text-gray-400 text-left space-y-2">
            <span className="block">Email: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{form.email}</strong></span>
            <span className="block">Session Joined: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong></span>
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="lg:col-span-8 bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-8 rounded-3xl shadow-sm text-left">
          
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            
            {/* Account Details Block */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs uppercase text-gray-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-2.5">
                <User className="w-4.5 h-4.5 text-primary-500" />
                <span>Account parameters</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Username Display</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">Profile Photo (Upload file)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      name="profilePicture"
                      value={form.profilePicture}
                      onChange={handleInputChange}
                      placeholder="No photo uploaded yet"
                      readOnly
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-100 dark:bg-dark-950 text-xs focus:outline-none dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <label className="cursor-pointer inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Select File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  checked={form.notificationsEnabled}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-primary-600 rounded cursor-pointer"
                />
                <label htmlFor="notificationsEnabled" className="text-xs font-bold text-gray-750 dark:text-gray-300 cursor-pointer flex items-center space-x-1">
                  <Bell className="w-3.5 h-3.5 text-primary-500 mr-1" />
                  <span>Enable System Email Notifications Alerts</span>
                </label>
              </div>

            </div>

            {/* Password changes Block */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-dark-800">
              <h3 className="font-extrabold text-xs uppercase text-gray-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-dark-800 pb-2.5">
                <Key className="w-4.5 h-4.5 text-primary-500" />
                <span>Security credential modifications</span>
              </h3>
              
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-dark-950 border border-slate-200/40 rounded-2xl text-[10px] text-gray-400">
                <span className="font-bold block flex items-center space-x-1 text-primary-600">
                  <ShieldAlert className="w-3.5 h-3.5 inline mr-1 text-primary-500" />
                  <span>Important Note:</span>
                </span>
                <span className="block leading-relaxed">Leave the password fields empty if you do not wish to change your active login password. Modifying passwords will force immediate session logout.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={form.confirmNewPassword}
                    onChange={handleInputChange}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl bg-slate-50 dark:bg-dark-950 text-xs focus:outline-none dark:text-white"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-smooth flex items-center justify-center space-x-1.5 disabled:bg-slate-355"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Account Settings</span>
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default ProfileManagement;
