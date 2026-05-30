import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import Inquiry from '../models/Inquiry.js';
import Category from '../models/Category.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      {},
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const updateData = {};
    const fieldsToUpdate = [
      'heroTitle',
      'heroSubtitle',
      'aboutText',
      'mission',
      'vision',
      'address',
      'phone',
      'email',
      'businessHours',
      'whatsappNumber',
      'facebookLink',
      'instagramLink',
      'linkedinLink',
      'googleMapsEmbedUrl',
      'siteName',
      'logo',
      'contactEmail',
      'mapUrl',
      'socialLinks'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle bidirectional synchronization between old and new properties for backward compatibility
    if (req.body.contactEmail !== undefined) {
      updateData.email = req.body.contactEmail;
    } else if (req.body.email !== undefined) {
      updateData.contactEmail = req.body.email;
    }

    if (req.body.mapUrl !== undefined) {
      updateData.googleMapsEmbedUrl = req.body.mapUrl;
    } else if (req.body.googleMapsEmbedUrl !== undefined) {
      updateData.mapUrl = req.body.googleMapsEmbedUrl;
    }

    if (req.body.siteName !== undefined) {
      updateData.heroTitle = req.body.siteName;
    } else if (req.body.heroTitle !== undefined) {
      updateData.siteName = req.body.heroTitle;
    }

    // Automatically sync socialLinks nested object with flat properties
    if (req.body.socialLinks) {
      if (req.body.socialLinks.facebook !== undefined) updateData.facebookLink = req.body.socialLinks.facebook;
      if (req.body.socialLinks.instagram !== undefined) updateData.instagramLink = req.body.socialLinks.instagram;
      if (req.body.socialLinks.linkedin !== undefined) updateData.linkedinLink = req.body.socialLinks.linkedin;
      if (req.body.socialLinks.whatsapp !== undefined) updateData.whatsappNumber = req.body.socialLinks.whatsapp;
    } else if (
      req.body.facebookLink !== undefined ||
      req.body.instagramLink !== undefined ||
      req.body.linkedinLink !== undefined ||
      req.body.whatsappNumber !== undefined
    ) {
      updateData.socialLinks = {
        facebook: req.body.facebookLink !== undefined ? req.body.facebookLink : (updateData.facebookLink || ''),
        instagram: req.body.instagramLink !== undefined ? req.body.instagramLink : (updateData.instagramLink || ''),
        linkedin: req.body.linkedinLink !== undefined ? req.body.linkedinLink : (updateData.linkedinLink || ''),
        whatsapp: req.body.whatsappNumber !== undefined ? req.body.whatsappNumber : (updateData.whatsappNumber || '')
      };
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: 'Updated global site settings details',
      ipAddress: req.ip || '',
    });

    res.status(200).json(updatedSettings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/settings/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: 'Pending' });

    // 1. Fetch 5 Recent Inquiries
    const recentInquiries = await Inquiry.find()
      .populate('productInterested', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 2. Category distribution
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          name: cat.name,
          count,
        };
      })
    );

    // 3. Stock breakdown
    const inStock = await Product.countDocuments({ stockStatus: 'In Stock' });
    const lowStock = await Product.countDocuments({ stockStatus: 'Low Stock' });
    const outOfStock = await Product.countDocuments({ stockStatus: 'Out of Stock' });

    // 4. Monthly Inquiries Trend (last 6 months - mock or parsed)
    const inquiryBreakdown = {
      pending: pendingInquiries,
      contacted: await Inquiry.countDocuments({ status: 'Contacted' }),
      closed: await Inquiry.countDocuments({ status: 'Closed' }),
    };

    res.status(200).json({
      totalProducts,
      totalInquiries,
      pendingInquiries,
      recentInquiries,
      categoryStats,
      stockStats: {
        inStock,
        lowStock,
        outOfStock,
      },
      inquiryBreakdown,
    });
  } catch (error) {
    next(error);
  }
};
