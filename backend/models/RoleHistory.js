import mongoose from 'mongoose';

const roleHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    oldRole: {
      type: String,
      required: true,
    },
    newRole: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the role change'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const RoleHistory = mongoose.model('RoleHistory', roleHistorySchema);
export default RoleHistory;
