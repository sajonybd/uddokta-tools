import mongoose from 'mongoose';

const AuthLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'revoked'],
    required: true,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  deviceLimitTriggered: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AuthLog || mongoose.model('AuthLog', AuthLogSchema);
