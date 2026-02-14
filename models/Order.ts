import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Snapshot of tool details in case they change? For now, linking to package is enough.
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  finalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['offline', 'free', 'online'], // online for future
    required: true,
  },
  paymentProof: {
    type: String, // URL to uploaded image details or text
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  couponApplied: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
  },
  adminNote: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
