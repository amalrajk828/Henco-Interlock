import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import RoleHistory from '../models/RoleHistory.js';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Validate fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    // 2. Locate user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Match passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 4. Log admin action
    await ActivityLog.create({
      admin: user._id,
      action: 'Logged into Administration Panel',
      ipAddress: req.ip || '',
    });

    // 5. Respond with credentials and token
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in admin details
// @route   GET /api/auth/profile
// @access  Private/Admin
export const getProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc    Get activity logs
// @route   GET /api/auth/logs
// @access  Private/Admin
export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('admin', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin
// @route   POST /api/auth/register-admin
// @access  Private/Admin
export const registerAdmin = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // 1. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 3. Create Admin
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin', // strictly enforce admin role
    });

    // 4. Log Action
    await ActivityLog.create({
      admin: req.user._id,
      action: `Registered new administrative account: ${user.email}`,
      ipAddress: req.ip || '',
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: 'Administrative account registered successfully',
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update Admin Profile Settings
// @route   PUT /api/auth/profile
// @access  Private/Admin
export const updateProfile = async (req, res, next) => {
  const { name, email, currentPassword, newPassword, profilePicture, notificationsEnabled } = req.body;

  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Update basic fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
          return res.status(400).json({ message: 'Email address is already in use by another account' });
        }
        user.email = email;
      }
    }
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (notificationsEnabled !== undefined) user.notificationsEnabled = !!notificationsEnabled;

    // 2. Password change processing
    let passwordChanged = false;
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      user.password = newPassword; // Mongoose pre-save hook will auto-hash this
      passwordChanged = true;
    }

    const updatedUser = await user.save();

    // 3. Log Action
    await ActivityLog.create({
      admin: req.user._id,
      action: passwordChanged 
        ? 'Updated profile details and security password' 
        : 'Updated profile settings details',
      ipAddress: req.ip || '',
    });

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      notificationsEnabled: updatedUser.notificationsEnabled,
      passwordChanged,
      message: 'Profile settings updated successfully' + (passwordChanged ? '. Please re-login.' : ''),
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Search, filter, page counts)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  const { search, role, status } = req.query;

  try {
    const query = {};

    // Filter by Role
    if (role) {
      query.role = role;
    }

    // Filter by Status
    if (status) {
      query.status = status;
    }

    // Filter by Text Search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock a user status
// @route   PUT /api/auth/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Prevent blocking self
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Access denied: You cannot block your own administrative account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Toggle status
    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    // Log action
    await ActivityLog.create({
      admin: req.user._id,
      action: `${user.status === 'blocked' ? 'Blocked' : 'Unblocked'} account: ${user.email}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      message: `Account successfully ${user.status === 'blocked' ? 'blocked' : 'unblocked'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset a user's password
// @route   PUT /api/auth/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    user.password = newPassword; // Will be auto-hashed pre-save
    await user.save();

    // Log action
    await ActivityLog.create({
      admin: req.user._id,
      action: `Reset credentials password for account: ${user.email}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ message: `Password reset successfully for ${user.name}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user account
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Access denied: You cannot delete your own administrative account' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    await User.findByIdAndDelete(id);

    // Log action
    await ActivityLog.create({
      admin: req.user._id,
      action: `Deleted user account: ${user.email}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually create a customer/user account
// @route   POST /api/auth/users
// @access  Private/Admin
export const adminCreateUser = async (req, res, next) => {
  const { name, username, email, phone, password, status } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide at least Name, Email, and Password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email address' });
    }

    const newUser = await User.create({
      name,
      username: username || '',
      email,
      phone: phone || '',
      password,
      status: status || 'active',
      role: 'user', // strictly manual customer creation
    });

    // Log action
    await ActivityLog.create({
      admin: req.user._id,
      action: `Manually registered customer account: ${email}`,
      ipAddress: req.ip || '',
    });

    res.status(201).json({
      message: 'Customer account manually registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        status: newUser.status,
        role: newUser.role,
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually update user/customer details
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const adminUpdateUser = async (req, res, next) => {
  const { id } = req.params;
  const { name, username, email, phone, status } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (name) user.name = name;
    if (username !== undefined) user.username = username;
    if (phone !== undefined) user.phone = phone;
    if (status) user.status = status;

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email address is already in use by another account' });
      }
      user.email = email;
    }

    await user.save();

    // Log action
    await ActivityLog.create({
      admin: req.user._id,
      action: `Updated customer account parameters: ${user.email}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      message: 'User account parameters updated successfully',
      user,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Super Admin promote/demote user roles manually with audit trails
// @route   PUT /api/auth/users/:id/role
// @access  Private/SuperAdmin
export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { newRole, reason } = req.body;

  try {
    const allowedRoles = ['user', 'admin', 'superadmin'];
    if (!allowedRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid security role requested' });
    }

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Please provide a clear reason for the role update' });
    }

    // Double security check: Only Super Admin allowed
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied: Only Super Administrators can modify security privileges' });
    }

    // Prevent self role change
    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Access denied: You are not allowed to change your own security role' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user account not found' });
    }

    const oldRole = targetUser.role;

    // Enforce role changes
    targetUser.role = newRole;
    await targetUser.save();

    // Log to RoleHistory
    await RoleHistory.create({
      user: targetUser._id,
      changedBy: req.user._id,
      oldRole,
      newRole,
      reason,
    });

    // Log to general ActivityLog
    await ActivityLog.create({
      admin: req.user._id,
      action: `Modified role of user ${targetUser.email} from '${oldRole}' to '${newRole}' (Reason: ${reason})`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      message: `Privileges for ${targetUser.name} successfully updated to '${newRole}'`,
      user: targetUser,
    });

  } catch (error) {
    next(error);
  }
};

// @desc    View audit logs role histories
// @route   GET /api/auth/role-history
// @access  Private/Admin
export const getRoleHistory = async (req, res, next) => {
  const { userId } = req.query;

  try {
    const query = {};
    if (userId) {
      query.user = userId;
    }

    const history = await RoleHistory.find(query)
      .populate('user', 'name email')
      .populate('changedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};


