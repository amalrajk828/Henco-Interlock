import Testimonial from '../models/Testimonial.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all approved testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json(testimonials);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a testimonial (Public submission)
// @route   POST /api/testimonials
// @access  Public
export const createTestimonial = async (req, res, next) => {
  const { name, company, role, review, rating, image } = req.body;

  try {
    if (!name || !review || !rating) {
      return res.status(400).json({ message: 'Name, review, and rating are required fields' });
    }

    const testimonial = await Testimonial.create({
      name,
      company: company || '',
      role: role || '',
      review,
      rating: Number(rating),
      image: image || '',
      isApproved: true, // Auto-approve for local demo, can be toggled by admin
    });

    res.status(201).json(testimonial);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a testimonial status / content
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res, next) => {
  const { id } = req.params;
  const { name, company, role, review, rating, image, isApproved } = req.body;

  try {
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (name) testimonial.name = name;
    if (company !== undefined) testimonial.company = company;
    if (role !== undefined) testimonial.role = role;
    if (review) testimonial.review = review;
    if (rating !== undefined) testimonial.rating = Number(rating);
    if (image !== undefined) testimonial.image = image;
    if (isApproved !== undefined) testimonial.isApproved = isApproved;

    const updatedTestimonial = await testimonial.save();

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Updated Testimonial by: ${updatedTestimonial.name}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json(updatedTestimonial);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res, next) => {
  const { id } = req.params;

  try {
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await Testimonial.findByIdAndDelete(id);

    // Log Activity
    await ActivityLog.create({
      admin: req.user._id,
      action: `Deleted Testimonial by: ${testimonial.name}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    next(error);
  }
};
