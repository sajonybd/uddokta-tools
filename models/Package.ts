import mongoose from 'mongoose';

const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a package name.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price.'],
  },
  interval: {
    type: String,
    enum: ['monthly', 'yearly', 'lifetime'],
    default: 'monthly',
  },
  features: {
    type: [String],
    default: [],
  },
  tools: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
  }],
  isTrial: {
    type: Boolean,
    default: false,
  },
  trialDurationDays: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  stripePriceId: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
