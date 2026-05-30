import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      enum: ['Residential', 'Commercial', 'Public Space', 'Industrial', 'Other'],
      default: 'Residential',
    },
    images: {
      type: [{
        imageUrl: { type: String, required: true },
        public_id: { type: String, required: true }
      }],
      required: [true, 'At least one project image is required'],
    },
    beforeImage: {
      imageUrl: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    afterImage: {
      imageUrl: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    clientName: {
      type: String,
      trim: true,
    },
    completionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
