import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this category.'],
    unique: true,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters'],
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create slug from name if not provided
CategorySchema.pre('save', async function(this: any) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
