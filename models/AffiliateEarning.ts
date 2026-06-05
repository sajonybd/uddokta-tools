import mongoose from 'mongoose';

const AffiliateEarningSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  purchaseAmount: {
    type: Number,
    required: true,
  },
  commissionPercentage: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['first_purchase', 'recurring'],
    required: true,
  },
  availableAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AffiliateEarning || mongoose.model('AffiliateEarning', AffiliateEarningSchema);
