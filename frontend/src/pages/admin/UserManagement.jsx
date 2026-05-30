import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Users, Search, Ban, Check, Trash2, Key, X, ShieldAlert, Loader2, Pencil, UserPlus, ShieldCheck, History } from 'lucide-react';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password reset state
  const [resettingUser, setResettingUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);
  
  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'active',
  });
  const [addError, setAddError] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit User State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    status: 'active',
  });
  const [editError, setEditError] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Role Management Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [targetRole, setTargetRole] = useState('user');
  const [roleReason, setRoleReason] = useState('');
  const [roleError, setRoleError] = useState('');
  const [submittingRole, setSubmittingRole] = useState(false);

  // Role History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [roleHistory, setRoleHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isSuperAdmin = currentUser?.role === 'superadmin';

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/auth/users';
      const params = [];
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (statusFilter) params.push(`status=${statusFilter}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, roleFilter, statusFilter]);

  const handleToggleBlock = async (user) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/auth/users/${user._id}/block`);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update account block status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user account "${user.name}"?`)) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/auth/users/${user._id}`);
      setSuccess(res.data.message);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user account');
    }
  };

  const handleOpenReset = (user) => {
    setResettingUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetting(true);

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters');
      setResetting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      setResetting(false);
      return;
    }

    try {
      await api.put(`/auth/users/${resettingUser._id}/reset-password`, { newPassword });
      setSuccess(`Password reset successfully for ${resettingUser.name}`);
      setResettingUser(null);
      fetchUsers();
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset user password');
    } finally {
      setResetting(false);
    }
  };

  // Manual Add Form handler
  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setSubmittingAdd(true);

    if (addUserForm.password.length < 6) {
      setAddError('Password must be at least 6 characters long');
      setSubmittingAdd(false);
      return;
    }

    if (addUserForm.password !== addUserForm.confirmPassword) {
      setAddError('Passwords do not match');
      setSubmittingAdd(false);
      return;
    }

    try {
      const res = await api.post('/auth/users', {
        name: addUserForm.name,
        username: addUserForm.username,
        email: addUserForm.email,
        phone: addUserForm.phone,
        password: addUserForm.password,
        status: addUserForm.status,
      });
      
      setSuccess(res.data.message || 'Customer account manuals registered successfully');
      setShowAddModal(false);
      setAddUserForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        status: 'active',
      });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to register customer user account');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Manual Edit Form Handler
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditUserForm({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active',
    });
    setEditError('');
    setShowEditModal(true);
  };

  const handleEditUserInputChange = (e) => {
    const { name, value } = e.target;
    setEditUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSubmittingEdit(true);

    try {
      const res = await api.put(`/auth/users/${editingUser._id}`, editUserForm);
      setSuccess(res.data.message || 'User account parameters updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update user parameters');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Role Management Modal
  const handleOpenRoleModal = (user) => {
    setRoleUser(user);
    setTargetRole(user.role || 'user');
    setRoleReason('');
    setRoleError('');
    setShowRoleModal(true);
  };

  const handleRoleChangeSubmit = async (e) => {
    e.preventDefault();
    setRoleError('');
    setSubmittingRole(true);

    if (!roleReason || roleReason.trim().length === 0) {
      setRoleError('Please provide a valid reason for updating this role');
      setSubmittingRole(false);
      return;
    }

    try {
      const res = await api.put(`/auth/users/${roleUser._id}/role`, {
        newRole: targetRole,
        reason: roleReason,
      });

      setSuccess(res.data.message || 'User security role updated successfully');
      setShowRoleModal(false);
      setRoleUser(null);
      fetchUsers();
    } catch (err) {
      setRoleError(err.response?.data?.message || 'Failed to change user role credentials');
    } finally {
      setSubmittingRole(false);
    }
  };

  // Fetch role history logs
  const fetchRoleHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/auth/role-history');
      setRoleHistory(res.data);
    } catch (err) {
      console.error('Failed to load role histories:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-left space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-dark-800 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <span className="text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-[0.2em] block">Office Control</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">User Management</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review other user accounts, register customers manually, update role permissions, or delete entries.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              fetchRoleHistory();
              setShowHistoryModal(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow-sm"
          >
            <History className="w-4 h-4" />
            <span>View Role History</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-smooth shadow shadow-primary-600/10 hover:shadow-primary-600/20"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3 rounded-lg text-xs text-red-655">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 p-3 rounded-lg text-xs text-emerald-800">
          {success}
        </div>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        
        <div className="sm:col-span-6 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name, username or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500 text-gray-800 dark:text-white"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
        </div>

        <div className="sm:col-span-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-xs text-gray-855 dark:text-white focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="superadmin">Super Admins</option>
            <option value="admin">Administrators</option>
            <option value="user">Normal Users</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 rounded-xl text-xs text-gray-855 dark:text-white focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>

      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="max-w-7xl mx-auto py-12 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Accounts...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 p-16 rounded-3xl text-center">
          <span className="text-4xl">👥</span>
          <h3 className="font-bold text-gray-900 dark:text-white mt-4">No users found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">Adjust your searches or categories filtering filters.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-dark-950 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-slate-100 dark:border-dark-800">
                <tr>
                  <th className="px-6 py-4">Avatar</th>
                  <th className="px-6 py-4">User details</th>
                  <th className="px-6 py-4">Security Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/50">
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-dark-800 border border-slate-200/40 text-primary-650 flex items-center justify-center font-bold text-sm">
                        {item.profilePicture ? (
                          <img src={`${api.defaults.baseURL.replace('/api', '')}${item.profilePicture}`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          item.name[0]
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-955 dark:text-white block leading-tight">{item.name}</span>
                        {item.username && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-semibold">@{item.username}</span>
                        )}
                        <span className="text-[10px] text-gray-400 block">{item.email}</span>
                        {item.phone && (
                          <span className="text-[10px] text-gray-400 block">Phone: {item.phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-650 dark:text-gray-300">
                      {item.role === 'superadmin' ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-150 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-250/20">
                          Super Admin
                        </span>
                      ) : item.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-primary-100 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-500/10">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-gray-700 dark:bg-dark-800 dark:text-gray-400">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        item.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2.5">
                        {isSuperAdmin && item._id !== currentUser?._id && (
                          <button
                            onClick={() => handleOpenRoleModal(item)}
                            className="p-2 bg-blue-50 hover:bg-blue-600 hover:text-white dark:bg-blue-950/20 dark:hover:bg-blue-600 rounded-lg text-blue-650 transition-smooth"
                            title="Manage Security Role & Promotes"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleBlock(item)}
                          className={`p-2 rounded-lg transition-smooth ${
                            item.status === 'active'
                              ? 'bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 dark:bg-amber-950/20'
                              : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:bg-emerald-950/20'
                          }`}
                          title={item.status === 'active' ? 'Block user account' : 'Unblock user account'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 bg-slate-100 hover:bg-primary-600 hover:text-white dark:bg-dark-800 dark:hover:bg-primary-500 rounded-lg text-gray-600 dark:text-gray-300 transition-smooth"
                          title="Edit User Profile"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenReset(item)}
                          className="p-2 bg-slate-100 hover:bg-primary-600 hover:text-white dark:bg-dark-800 dark:hover:bg-primary-500 rounded-lg text-gray-600 dark:text-gray-300 transition-smooth"
                          title="Reset password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(item)}
                          className="p-2 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-950/20 dark:hover:bg-red-650 rounded-lg text-red-500 transition-smooth"
                          title="Permanently delete user"
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
      )}

      {/* Role Management Modal (Super Admin strictly) */}
      {showRoleModal && roleUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between text-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                <span>Manage Security Role</span>
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setRoleUser(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoleChangeSubmit} className="p-6 space-y-4">
              {roleError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 p-2.5 rounded text-xs text-red-600">
                  {roleError}
                </div>
              )}

              <div className="p-3.5 bg-slate-50 dark:bg-dark-950 border border-slate-200/40 rounded-xl text-xs space-y-1.5">
                <span className="text-gray-400 block">Target Account:</span>
                <span className="block font-extrabold text-gray-950 dark:text-white leading-tight">{roleUser.name}</span>
                <span className="block text-[10px] text-gray-400">Current Role: <strong className="text-primary-600 uppercase font-bold">{roleUser.role || 'user'}</strong></span>
              </div>

              {/* Warning panel based on target selection */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-955/20 border border-amber-250/20 rounded-xl text-[10px] text-amber-850 dark:text-amber-400 space-y-1">
                <span className="font-bold flex items-center space-x-1 uppercase tracking-wider block">
                  <ShieldAlert className="w-3.5 h-3.5 text-primary-500 mr-1" />
                  <span>Security Warning:</span>
                </span>
                <p className="leading-relaxed">
                  {targetRole === 'superadmin' && "You are promoting this account to Super Admin. They will receive total control, including changing roles for other admin accounts, creating other Super Admins, and deleting administrative profiles."}
                  {targetRole === 'admin' && "You are promoting this account to Administrator. They will receive full access to products management, inquiry updates, projects catalog, and general settings."}
                  {targetRole === 'user' && "You are demoting this account to standard User. All administrative dashboard panels, logs viewing, and system security privileges will be immediately revoked."}
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Assign New Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-955 rounded-xl text-xs text-gray-850 dark:text-white focus:outline-none"
                >
                  <option value="user">User (Standard Customer)</option>
                  <option value="admin">Admin (Operational Permissions)</option>
                  <option value="superadmin">Super Admin (All Permissions)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Reason for role update</label>
                <textarea
                  required
                  rows="3"
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  placeholder="e.g. Sales team expansion"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-955 text-xs text-gray-800 dark:text-white focus:outline-none"
                ></textarea>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-dark-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleModal(false);
                    setRoleUser(null);
                  }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  className="w-1/2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center space-x-1.5 disabled:bg-slate-350"
                >
                  {submittingRole && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Privileges</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role History Logs Audit Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between text-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-primary-500" />
                <span>Security Role Modification Audits History</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Audit log Table */}
            <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
              {loadingHistory ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">Retrieving Audit Trails...</span>
                </div>
              ) : roleHistory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10 italic">No security modifications audit logs found in the archives.</p>
              ) : (
                <div className="border border-slate-200/40 dark:border-dark-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-dark-950 font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-slate-100 dark:border-dark-800">
                      <tr>
                        <th className="px-5 py-3">Target User</th>
                        <th className="px-5 py-3">Old Role</th>
                        <th className="px-5 py-3">New Role</th>
                        <th className="px-5 py-3">Modified By</th>
                        <th className="px-5 py-3">Reason</th>
                        <th className="px-5 py-3">Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                      {roleHistory.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/30 dark:hover:bg-dark-900/30">
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-gray-900 dark:text-white block leading-tight">{log.user?.name || 'Deleted Account'}</span>
                            <span className="text-[9px] text-gray-450 block">{log.user?.email || 'N/A'}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="uppercase text-[9px] font-bold text-gray-450">{log.oldRole}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`uppercase text-[9px] font-extrabold ${
                              log.newRole === 'superadmin' ? 'text-amber-600' : log.newRole === 'admin' ? 'text-primary-650' : 'text-gray-450'
                            }`}>{log.newRole}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-semibold text-gray-800 dark:text-gray-300 block">{log.changedBy?.name || 'Administrator'}</span>
                            <span className="text-[9px] text-gray-450 block">{log.changedBy?.email || 'N/A'}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 italic font-medium max-w-[200px] truncate" title={log.reason}>
                            {log.reason}
                          </td>
                          <td className="px-5 py-3.5 text-gray-400 font-mono text-[10px]">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-dark-800 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 border border-slate-200 dark:border-dark-850 text-gray-600 dark:text-gray-350 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
              >
                Close Logs Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between text-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-primary-500" />
                <span>Register Customer Account</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 p-3 rounded-lg text-xs text-red-600">
                  {addError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={addUserForm.name}
                    onChange={handleAddUserInputChange}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    name="username"
                    value={addUserForm.username}
                    onChange={handleAddUserInputChange}
                    placeholder="Enter username"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={addUserForm.email}
                    onChange={handleAddUserInputChange}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={addUserForm.phone}
                    onChange={handleAddUserInputChange}
                    placeholder="Enter telephone number"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={addUserForm.password}
                    onChange={handleAddUserInputChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={addUserForm.confirmPassword}
                    onChange={handleAddUserInputChange}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Account Status</label>
                <select
                  name="status"
                  value={addUserForm.status}
                  onChange={handleAddUserInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-955 rounded-xl text-xs text-gray-850 dark:text-white focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Inactive (Blocked)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-dark-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="w-1/2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center space-x-1.5 disabled:bg-slate-350"
                >
                  {submittingAdd && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Register Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between text-left">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <Pencil className="w-5 h-5 text-primary-500" />
                <span>Modify User Parameters</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 p-3 rounded-lg text-xs text-red-600">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={editUserForm.name}
                    onChange={handleEditUserInputChange}
                    placeholder="Enter full name"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    name="username"
                    value={editUserForm.username}
                    onChange={handleEditUserInputChange}
                    placeholder="Enter username"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={editUserForm.email}
                    onChange={handleEditUserInputChange}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={editUserForm.phone}
                    onChange={handleEditUserInputChange}
                    placeholder="Enter telephone number"
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Account Status</label>
                <select
                  name="status"
                  value={editUserForm.status}
                  onChange={handleEditUserInputChange}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-955 rounded-xl text-xs text-gray-850 dark:text-white focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Inactive (Blocked)</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex space-x-3 border-t border-slate-100 dark:border-dark-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="w-1/2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center space-x-1.5 disabled:bg-slate-350"
                >
                  {submittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal Drawer */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800/50 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in flex flex-col justify-between text-left">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-dark-800 flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-primary-500" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              
              {resetError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-255 p-2.5 rounded text-xs text-red-600">
                  {resetError}
                </div>
              )}

              <div className="p-3 bg-slate-50 dark:bg-dark-950 rounded-xl text-xs space-y-1">
                <span className="text-gray-400">Target Account:</span>
                <span className="block font-extrabold text-gray-900 dark:text-white">{resettingUser.name} ({resettingUser.email})</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-dark-800 rounded-xl text-xs bg-slate-50 dark:bg-dark-955 dark:text-white focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex space-x-3 bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-dark-800">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="w-1/2 py-2.5 border border-slate-200 dark:border-dark-800 text-gray-600 dark:text-gray-300 font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting}
                  className="w-1/2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center space-x-1.5 disabled:bg-slate-350"
                >
                  {resetting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Change Password</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
