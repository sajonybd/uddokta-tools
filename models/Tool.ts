import mongoose from 'mongoose';

const ToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this tool.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  url: {
    type: String,
    // URL is optional if linkedPage is present. Logic handled in validation or application layer.
  },
  linkedPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPage',
  },
  icon: {
    type: String,
    // Store URL or icon name
  },
  category: {
    type: String,
    required: [true, 'Please provide a category.'],
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active',
  },
  image: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Tool || mongoose.model('Tool', ToolSchema);
