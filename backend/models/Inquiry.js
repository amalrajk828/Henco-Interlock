import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    productInterested: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product interest is required'],
    },
    area: {
      type: Number,
      required: [true, 'Area in square feet is required'],
      min: [1, 'Area must be at least 1 square foot'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Contacted', 'Closed'],
      default: 'Pending',
    },
    adminComments: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unique tracking ID
inquirySchema.pre('save', async function (next) {
  if (!this.trackingId) {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    this.trackingId = `HN-${year}-${randomSuffix}`;
  }
  next();
});

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
