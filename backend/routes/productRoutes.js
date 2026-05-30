import express from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadProducts } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, admin, uploadProducts.array('images', 6), createProduct);

router.route('/:id')
  .put(protect, admin, uploadProducts.array('images', 6), updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/slug/:slug')
  .get(getProductBySlug);

export default router;
