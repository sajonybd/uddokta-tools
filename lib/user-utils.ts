import User from "@/models/User";

export async function getNextUserId() {
  const lastUser = await User.findOne({ customId: { $ne: null } }).sort({ customId: -1 });
  
  if (!lastUser || !lastUser.customId) {
    return 1000;
  }
  
  return lastUser.customId + 1;
}
