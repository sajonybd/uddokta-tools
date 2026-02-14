import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Package from "@/models/Package";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware check helper
const checkAdmin = async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'admin') throw new Error("Unauthorized");
    return user;
}

export async function GET(req: Request) {
  await dbConnect();
  try {
    await checkAdmin();
    const orders = await Order.find({})
        .populate('user', 'name email')
        .populate('items.package', 'name price')
        .sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Error" }, { status: 401 });
  }
}

// Update Order Status (Approve/Reject)
export async function PUT(req: Request) {
    await dbConnect();
    try {
        await checkAdmin();
        const { orderId, status, adminNote } = await req.json();

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        // If approving, activate subscription
        if (status === 'approved' && order.status !== 'approved') {
            const dbUser = await User.findById(order.user);
            if (dbUser) {
                for (const item of order.items) {
                    const pkg = await Package.findById(item.package);
                    // Default 30 days if not defined
                    const durationDays = pkg?.isTrial ? pkg.trialDurationDays : (pkg?.interval === 'yearly' ? 365 : 30);
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(startDate.getDate() + (durationDays || 30));

                    dbUser.subscriptions.push({
                        packageId: pkg?._id || item.package,
                        startDate,
                        endDate,
                        status: 'active',
                        autoRenew: false
                    });
                }
                await dbUser.save();
            }
        }

        order.status = status;
        if (adminNote) order.adminNote = adminNote;
        await order.save();

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error("Order update failed:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
