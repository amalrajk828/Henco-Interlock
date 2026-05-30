import express from 'express';
import { getAdminProducts } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, admin, getAdminProducts);

export default router;
