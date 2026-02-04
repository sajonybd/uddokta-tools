import mongoose from 'mongoose';

const CustomPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title.'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a unique slug.'],
    unique: true,
  },
  content: {
    type: String, // HTML/JS content
    required: [true, 'Please provide content.'],
  },
  accessRules: {
      allowedRoles: { type: [String], default: [] }, // e.g. ['admin', 'vip']
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CustomPage || mongoose.model('CustomPage', CustomPageSchema);
