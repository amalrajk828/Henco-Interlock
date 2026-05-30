import express from 'express';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const uploadFields = upload.fields([
  { name: 'images', maxCount: 6 },
  { name: 'beforeImage', maxCount: 1 },
  { name: 'afterImage', maxCount: 1 },
]);

router.route('/')
  .get(getProjects)
  .post(protect, admin, uploadFields, createProject);

router.route('/:id')
  .put(protect, admin, uploadFields, updateProject)
  .delete(protect, admin, deleteProject);

export default router;
