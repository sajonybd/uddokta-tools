import dbConnect from './mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Setting from '@/models/Setting';
import AffiliateEarning from '@/models/AffiliateEarning';

/**
 * Process affiliate commission when an order is approved.
 */
export async function processAffiliateCommission(orderId: string) {
  await dbConnect();

  try {
    const order = await Order.findById(orderId);
    if (!order || order.status !== 'approved') return;

    // Do not generate commission on free/zero amount orders
    if (order.finalAmount <= 0) return;

    // Check if commission was already processed for this order to prevent duplicates
    const existing = await AffiliateEarning.findOne({ order: order._id });
    if (existing) return;

    // Get purchasing user details
    const customer = await User.findById(order.user);
    if (!customer || !customer.referredBy) return;

    // Verify referrer exists
    const referrer = await User.findById(customer.referredBy);
    if (!referrer) return;

    // Check if this is the user's first approved paid order
    const previousOrdersCount = await Order.countDocuments({
      user: order.user,
      status: 'approved',
      finalAmount: { $gt: 0 },
      _id: { $ne: order._id }
    });
    const isFirstPurchase = previousOrdersCount === 0;

    // Fetch site settings for percentages
    const settings = await Setting.findOne({});
    const firstPercentage = settings?.affiliateFirstPurchasePercentage ?? 20;
    const recurringPercentage = settings?.affiliateRecurringPercentage ?? 10;

    const percentage = isFirstPurchase ? firstPercentage : recurringPercentage;
    const commissionAmount = parseFloat(((order.finalAmount * percentage) / 100).toFixed(2));

    if (commissionAmount <= 0) return;

    // Lock period: 30 days from now
    const availableAt = new Date();
    availableAt.setDate(availableAt.getDate() + 30);

    await AffiliateEarning.create({
      referrer: customer.referredBy,
      referredUser: order.user,
      order: order._id,
      amount: commissionAmount,
      purchaseAmount: order.finalAmount,
      commissionPercentage: percentage,
      type: isFirstPurchase ? 'first_purchase' : 'recurring',
      availableAt,
      createdAt: new Date(),
    });

    console.log(`[Affiliate] Earned ${commissionAmount} for referrer ${customer.referredBy} from user ${order.user}`);
  } catch (error) {
    console.error('[Affiliate] Error processing commission:', error);
  }
}

/**
 * Revoke affiliate commission if an order is cancelled or reverted.
 */
export async function revokeAffiliateCommission(orderId: string) {
  await dbConnect();
  try {
    const result = await AffiliateEarning.deleteOne({ order: orderId });
    if (result.deletedCount > 0) {
      console.log(`[Affiliate] Revoked commission for order ${orderId}`);
    }
  } catch (error) {
    console.error('[Affiliate] Error revoking commission:', error);
  }
}
