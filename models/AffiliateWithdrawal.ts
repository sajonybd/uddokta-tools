import mongoose from 'mongoose';

const AffiliateWithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['bank', 'bkash', 'rocket', 'nagad'],
    required: true,
  },
  paymentDetails: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminNote: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AffiliateWithdrawalSchema.pre('save', function (next: any) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.AffiliateWithdrawal || mongoose.model('AffiliateWithdrawal', AffiliateWithdrawalSchema);
