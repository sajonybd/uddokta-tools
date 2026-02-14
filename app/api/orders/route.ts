import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Package from "@/models/Package";
import Coupon from "@/models/Coupon";
import User from "@/models/User"; // Import User to update subscription
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  
  if (!session) {
      return NextResponse.json({ error: "Please login to place an order" }, { status: 401 });
  }
  
  const user = session.user as any;

  try {
    const { items, paymentMethod, paymentProof, couponCode } = await req.json();
    // items should be [{ packageId, ... }]

    // 1. Calculate Totals Server-Side for Security
    let totalAmount = 0;
    const finalItems = [];

    for (const item of items) {
        const pkg = await Package.findById(item._id);
        if (!pkg) continue;
        const price = pkg.price;
        totalAmount += price;
        finalItems.push({
            package: pkg._id,
            price: price
        });
    }

    // 2. Apply Coupon
    let discountAmount = 0;
    let couponId = null;

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode });
        // TODO: Re-verify coupon validity here (call validate logic or duplicate it)
        // For now, assuming validated or trusting basic check + simple re-calc
        if (coupon && coupon.status === 'active') {
            couponId = coupon._id;
            if (coupon.discountType === 'flat') {
                discountAmount = coupon.discountAmount;
            } else {
                discountAmount = (totalAmount * coupon.discountAmount) / 100;
            }
            // Update used count
            await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
        }
    }

    if (discountAmount > totalAmount) discountAmount = totalAmount; // Prevent negative
    const finalAmount = totalAmount - discountAmount;

    // 3. Determine Status
    // If Free (Total 0), auto-approve.
    // If Offline, status 'pending'.
    let status = 'pending';
    if (finalAmount === 0 || paymentMethod === 'free') {
        status = 'approved';
    }

    // 4. Create Order
    const order = await Order.create({
        user: user.id,
        items: finalItems,
        totalAmount,
        discountAmount,
        finalAmount,
        paymentMethod: finalAmount === 0 ? 'free' : paymentMethod,
        paymentProof,
        status,
        couponApplied: couponId
    });

    // 5. If Approved (Free), Activate Subscription Immediately
    if (status === 'approved') {
        // Logic to update User Subscription
        const dbUser = await User.findById(user.id);
        
        // Loop through items and add subscriptions
        // Helper function or inline logic
        for (const item of finalItems) {
             const pkg = await Package.findById(item.package);
             const durationDays = pkg.isTrial ? pkg.trialDurationDays : (pkg.interval === 'yearly' ? 365 : 30); // simplistic logic
             const startDate = new Date();
             const endDate = new Date();
             endDate.setDate(startDate.getDate() + (durationDays || 30));

             dbUser.subscriptions.push({
                 packageId: pkg._id,
                 startDate,
                 endDate,
                 status: 'active',
                 autoRenew: false // Default
             });
        }
        await dbUser.save();
    }

    return NextResponse.json({ success: true, orderId: order._id, status }, { status: 201 });

  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
