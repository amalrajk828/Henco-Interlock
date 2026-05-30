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
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = await Settings.create({ key: 'site_settings' });
    }
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
    let settings = await Settings.findOne({ key: 'site_settings' });
    if (!settings) {
      settings = new Settings({ key: 'site_settings' });
    }

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
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    const updatedSettings = await settings.save();

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
