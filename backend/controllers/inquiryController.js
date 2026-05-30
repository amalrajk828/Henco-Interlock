import Inquiry from '../models/Inquiry.js';
import Product from '../models/Product.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendInquiryEmails } from '../utils/emailService.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// @desc    Submit a new inquiry/quote request
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res, next) => {
  const { name, phone, email, productInterested, quantity, message } = req.body;

  try {
    if (!name || !phone || !email || !productInterested || !quantity) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const product = await Product.findById(productInterested);
    if (!product) {
      return res.status(404).json({ message: 'Selected product not found' });
    }

    const inquiry = await Inquiry.create({
      name,
      phone,
      email,
      productInterested,
      quantity: Number(quantity),
      message,
    });

    // Fire email notifications (asynchronously to avoid delay)
    sendInquiryEmails(inquiry, product);

    res.status(201).json({
      message: 'Inquiry submitted successfully',
      trackingId: inquiry.trackingId,
      inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inquiries (with search, filter, and page counts)
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res, next) => {
  const { search, status, page, limit } = req.query;

  try {
    const query = {};

    // 1. Filter by Status
    if (status) {
      query.status = status;
    }

    // 2. Filter by search (matches name, email, phone, or trackingId)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { trackingId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageSize = Number(limit) || 20;
    const currentPage = Number(page) || 1;
    const count = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .populate('productInterested', 'name pricePerSqFt images')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (currentPage - 1));

    res.status(200).json({
      inquiries,
      page: currentPage,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track inquiry status by trackingId
// @route   GET /api/inquiries/track/:trackingId
// @access  Public
export const trackInquiry = async (req, res, next) => {
  const { trackingId } = req.params;

  try {
    const inquiry = await Inquiry.findOne({ trackingId: trackingId.toUpperCase().trim() })
      .populate('productInterested', 'name pricePerSqFt images description');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry tracking ID not found. Please double check the code.' });
    }

    res.status(200).json({
      trackingId: inquiry.trackingId,
      name: inquiry.name,
      productInterested: inquiry.productInterested,
      quantity: inquiry.quantity,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
      adminComments: inquiry.status === 'Closed' || inquiry.status === 'Contacted' ? inquiry.adminComments : '', // Hide sensitive comments if needed, but we share it for status tracking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inquiry status & admin comments
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
export const updateInquiryStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminComments } = req.body;

  try {
    const inquiry = await Inquiry.findById(id).populate('productInterested', 'name');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    if (adminComments !== undefined) inquiry.adminComments = adminComments;

    const updatedInquiry = await inquiry.save();

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Updated Inquiry [${inquiry.trackingId}] status to: ${status}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json(updatedInquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Export inquiries to Excel Spreadsheet
// @route   GET /api/inquiries/export/excel
// @access  Private/Admin
export const exportInquiriesExcel = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('productInterested', 'name pricePerSqFt')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Henco Inquiries');

    // Add Styles and Columns
    worksheet.columns = [
      { header: 'Tracking ID', key: 'trackingId', width: 18 },
      { header: 'Client Name', key: 'name', width: 22 },
      { header: 'Email Address', key: 'email', width: 25 },
      { header: 'Phone Number', key: 'phone', width: 15 },
      { header: 'Product Interested', key: 'product', width: 25 },
      { header: 'Quantity (Sq Ft)', key: 'quantity', width: 18 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Date Submitted', key: 'date', width: 20 },
      { header: 'Comments', key: 'comments', width: 30 },
    ];

    // Format header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C2410C' }, // clay orange
    };

    // Add Data
    inquiries.forEach((item) => {
      worksheet.addRow({
        trackingId: item.trackingId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        product: item.productInterested ? item.productInterested.name : 'N/A',
        quantity: item.quantity,
        status: item.status,
        date: new Date(item.createdAt).toLocaleString(),
        comments: item.adminComments || '',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'henco-inquiries-' + Date.now() + '.xlsx'
    );

    // Activity Log
    await ActivityLog.create({
      admin: req.user._id,
      action: 'Exported website inquiries list to Excel spreadsheet',
      ipAddress: req.ip || '',
    });

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export inquiries to PDF Document
// @route   GET /api/inquiries/export/pdf
// @access  Private/Admin
export const exportInquiriesPdf = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('productInterested', 'name')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'henco-inquiries-' + Date.now() + '.pdf'
    );

    doc.pipe(res);

    // Title Block
    doc.fillColor('#c2410c').fontSize(24).font('Helvetica-Bold').text('Henco Interlock', { align: 'center' });
    doc.fillColor('#475569').fontSize(12).font('Helvetica').text('Inquiry and Quote Summary Report', { align: 'center' });
    doc.moveDown();
    doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(30, 80).lineTo(565, 80).stroke();
    doc.moveDown(2);

    // Draw Report Info
    doc.fontSize(10).fillColor('#334155');
    doc.text(`Generated Date: ${new Date().toLocaleString()}`);
    doc.text(`Total Inquiries Count: ${inquiries.length}`);
    doc.moveDown(2);

    // Table Header
    doc.fillColor('#ffffff');
    doc.rect(30, doc.y, 535, 20).fill('#c2410c'); // orange bar
    
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
    const startY = doc.y + 5;
    doc.text('Tracking ID', 35, startY);
    doc.text('Name & Phone', 130, startY);
    doc.text('Product Interest', 260, startY);
    doc.text('Volume (Sq Ft)', 390, startY);
    doc.text('Status', 485, startY);
    
    doc.moveDown(1.5);
    
    // Draw rows
    doc.fillColor('#334155').font('Helvetica');
    inquiries.forEach((item, index) => {
      // Check if we need to add a page (prevent spillover off page limits)
      if (doc.y > 720) {
        doc.addPage();
        // Redraw Header
        doc.fillColor('#ffffff');
        doc.rect(30, doc.y, 535, 20).fill('#c2410c');
        doc.fillColor('#ffffff').font('Helvetica-Bold');
        doc.text('Tracking ID', 35, doc.y + 5);
        doc.text('Name & Phone', 130, doc.y + 5);
        doc.text('Product Interest', 260, doc.y + 5);
        doc.text('Volume (Sq Ft)', 390, doc.y + 5);
        doc.text('Status', 485, doc.y + 5);
        doc.moveDown(1.5);
        doc.fillColor('#334155').font('Helvetica');
      }

      const rowY = doc.y;
      
      // Draw background shading for alternate rows
      if (index % 2 === 0) {
        doc.fillColor('#f8fafc').rect(30, rowY - 2, 535, 28).fill().fillColor('#334155');
      }

      doc.fontSize(8);
      doc.text(item.trackingId, 35, rowY + 3);
      doc.text(`${item.name}\n${item.phone}`, 130, rowY + 3);
      doc.text(item.productInterested ? item.productInterested.name : 'Custom', 260, rowY + 3);
      doc.text(`${item.quantity} Sq Ft`, 390, rowY + 3);
      
      // Status Color-coding
      if (item.status === 'Pending') {
        doc.fillColor('#dc2626').font('Helvetica-Bold');
      } else if (item.status === 'Contacted') {
        doc.fillColor('#2563eb').font('Helvetica-Bold');
      } else {
        doc.fillColor('#16a34a').font('Helvetica-Bold');
      }
      doc.text(item.status, 485, rowY + 3);
      
      doc.fillColor('#334155').font('Helvetica');
      doc.moveDown(2.2);
    });

    // Activity Log
    await ActivityLog.create({
      admin: req.user._id,
      action: 'Exported website inquiries list to PDF document',
      ipAddress: req.ip || '',
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};
