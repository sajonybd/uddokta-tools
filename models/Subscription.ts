import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'itemType',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['Package', 'Tool'],
    default: 'Package',
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }
}, { timestamps: true });

// Index for faster lookups
SubscriptionSchema.index({ user: 1, packageId: 1, status: 1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
