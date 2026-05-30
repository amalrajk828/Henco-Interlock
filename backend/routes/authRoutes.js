import express from 'express';
import {
  login,
  getProfile,
  getActivityLogs,
  registerAdmin,
  updateProfile,
  getUsers,
  toggleBlockUser,
  resetUserPassword,
  deleteUser,
  adminCreateUser,
  adminUpdateUser,
  updateUserRole,
  getRoleHistory,
} from '../controllers/authController.js';
import { protect, admin, superAdmin } from '../middleware/authMiddleware.js';
import { loginRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);
router.post('/register-admin', protect, admin, registerAdmin);

// Profile Management
router.route('/profile')
  .get(protect, admin, getProfile)
  .put(protect, admin, updateProfile);

router.post('/profile/upload-photo', protect, admin, upload.single('profilePicture'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an image file' });
  }
  res.status(200).json({
    message: 'Profile photo uploaded successfully',
    filePath: `/uploads/${req.file.filename}`
  });
});

// User Management
router.route('/users')
  .get(protect, admin, getUsers)
  .post(protect, admin, adminCreateUser);

router.route('/users/:id')
  .put(protect, admin, adminUpdateUser)
  .delete(protect, admin, deleteUser);

router.put('/users/:id/role', protect, superAdmin, updateUserRole);
router.get('/role-history', protect, admin, getRoleHistory);

router.route('/users/:id/block')
  .put(protect, admin, toggleBlockUser);

router.route('/users/:id/reset-password')
  .put(protect, admin, resetUserPassword);

router.get('/logs', protect, admin, getActivityLogs);

export default router;


