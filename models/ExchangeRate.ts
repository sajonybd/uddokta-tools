
import mongoose from "mongoose";

const ExchangeRateSchema = new mongoose.Schema({
  currency: {
    type: String,
    required: true,
    unique: true, // e.g. 'BDT', 'INR'
    uppercase: true
  },
  rate: {
    type: Number,
    required: true,
    default: 1
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
ExchangeRateSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.set({ updatedAt: new Date() });
    }
});

const ExchangeRate = mongoose.models.ExchangeRate || mongoose.model("ExchangeRate", ExchangeRateSchema);
export default ExchangeRate;
