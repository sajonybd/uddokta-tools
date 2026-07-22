import mongoose from "mongoose";

const IPLocationSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    city: {
      type: String,
      default: "Unknown",
    },
    country: {
      type: String,
      default: "Unknown",
    },
  },
  { timestamps: true }
);

const IPLocation = mongoose.models.IPLocation || mongoose.model("IPLocation", IPLocationSchema);

export default IPLocation;
