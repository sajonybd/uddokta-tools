import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code.'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: [true, 'Please provide a discount type.'],
  },
  discountAmount: {
    type: Number,
    required: [true, 'Please provide a discount amount.'],
  },
  expirationDate: {
    type: Date,
    required: [true, 'Please provide an expiration date.'],
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  rules: {
    userType: {
      type: String,
      enum: ['new', 'active', 'old', 'all'],
      default: 'all',
    },
    specificEmails: {
      type: [String],
      default: [],
    },
    specificPackages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
    }],
    specificTools: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tool',
    }],
    minOrderValue: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
