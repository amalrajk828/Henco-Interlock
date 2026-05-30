import express from 'express';
import {
  createInquiry,
  getInquiries,
  trackInquiry,
  updateInquiryStatus,
  exportInquiriesExcel,
  exportInquiriesPdf,
} from '../controllers/inquiryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(createInquiry)
  .get(protect, admin, getInquiries);

router.route('/export')
  .get(protect, admin, exportInquiriesExcel);

router.route('/export/excel')
  .get(protect, admin, exportInquiriesExcel);

router.route('/export/pdf')
  .get(protect, admin, exportInquiriesPdf);

router.route('/track/:trackingId')
  .get(trackInquiry);

router.route('/:id')
  .put(protect, admin, updateInquiryStatus);

export default router;
