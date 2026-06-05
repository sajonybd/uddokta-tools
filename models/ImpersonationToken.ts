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
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // Automatically deletes itself after 60 seconds
  },
});

if (mongoose.models.ImpersonationToken) {
  delete mongoose.models.ImpersonationToken;
}

export default mongoose.model("ImpersonationToken", ImpersonationTokenSchema);
