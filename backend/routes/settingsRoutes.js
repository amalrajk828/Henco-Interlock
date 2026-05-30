import express from 'express';
import {
  getSettings,
  updateSettings,
  getStats,
} from '../controllers/settingsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protect, admin, updateSettings);

router.route('/stats')
  .get(protect, admin, getStats);

export default router;
