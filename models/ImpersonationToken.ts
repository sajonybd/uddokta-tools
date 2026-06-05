import mongoose from "mongoose";

const ImpersonationTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // Automatically deletes itself after 60 seconds
  },
});

export default mongoose.models.ImpersonationToken || mongoose.model("ImpersonationToken", ImpersonationTokenSchema);
