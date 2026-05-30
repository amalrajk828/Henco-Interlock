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
      type: [String],
      required: [true, 'At least one project image is required'],
    },
    beforeImage: {
      type: String,
      default: '',
    },
    afterImage: {
      type: String,
      default: '',
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
