import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Subscription from "@/models/Subscription";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
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

// Helper to calculate duration in days
function calculateDurationDays(item: any, targetItem: any) {
    let durationDays = 30; // Default
    if (targetItem?.interval === 'lifetime') {
        durationDays = 36500; // 100 years
    } else if (targetItem?.interval === 'yearly') {
        durationDays = 365 * (item.durationMonths || 1);
    } else if (targetItem?.interval === 'weekly') {
        durationDays = 7 * (item.durationMonths || 1);
    } else if (targetItem?.isTrial && targetItem?.trialDurationDays) {
        durationDays = targetItem.trialDurationDays;
    } else if (targetItem?.isTrial || targetItem?.price === 0) {
        durationDays = 365;
    } else {
        // Monthly
        durationDays = 30 * (item.durationMonths || 1);
    }
    return durationDays;
}

// Update Order Status (Approve/Reject)
export async function PUT(req: Request) {
    await dbConnect();
    try {
        await checkAdmin();
        const { orderId, status, adminNote } = await req.json();

        // Helper to count active users for a tool
        const getActiveUserCountForTool = async (toolId: string) => {
            const activeSubs = await Subscription.find({
              status: "active",
              endDate: { $gt: new Date() }
            }).lean();

            const packages = await Package.find({}).lean();
            
            const parentPackageIds = packages
              .filter((pkg: any) => pkg.tools && pkg.tools.map((id: any) => id.toString()).includes(toolId))
              .map((pkg: any) => pkg._id.toString());

            const matchingSubs = activeSubs.filter((sub: any) => {
              const targetIdStr = sub.packageId?.toString();
              if (sub.itemType === 'Tool') {
                return targetIdStr === toolId;
              } else {
                return parentPackageIds.includes(targetIdStr);
              }
            });

            const uniqueUsers = new Set(matchingSubs.map((sub: any) => sub.user?.toString()));
            return uniqueUsers.size;
        };

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        const oldStatus = order.status;
        const newStatus = status;

        // If status is changing
        if (oldStatus !== newStatus) {
            // Case 1: Approving (Pending -> Approved or Rejected -> Approved)
            if (newStatus === 'approved') {
                // Pre-validate max slot limit for all tools in the order
                for (const item of order.items) {
                    const targetItem = item.itemType === 'Tool'
                        ? await Tool.findById(item.package)
                        : await Package.findById(item.package);

                    if (!targetItem) continue;

                    const existingSub = await Subscription.findOne({
                        user: order.user,
                        packageId: targetItem._id,
                        status: 'active'
                    });

                    if (item.itemType === 'Tool') {
                        if (targetItem.max_slots > 0) {
                            const activeCount = await getActiveUserCountForTool(targetItem._id.toString());
                            const userHasActiveSub = existingSub ? true : false;
                            if (!userHasActiveSub && activeCount >= targetItem.max_slots) {
                                return NextResponse.json({ error: `Tool ${targetItem.name} has reached its maximum user limit of ${targetItem.max_slots} active users.` }, { status: 400 });
                            }
                        }
                    } else {
                        for (const toolId of (targetItem.tools || [])) {
                            const tool = await Tool.findById(toolId);
                            if (tool && tool.max_slots > 0) {
                                const activeCount = await getActiveUserCountForTool(tool._id.toString());
                                const userHasActiveSub = existingSub ? true : false;
                                if (!userHasActiveSub && activeCount >= tool.max_slots) {
                                    return NextResponse.json({ error: `Tool ${tool.name} (included in package ${targetItem.name}) has reached its maximum user limit of ${tool.max_slots} active users.` }, { status: 400 });
                                }
                            }
                        }
                    }
                }

                for (const item of order.items) {
                    const targetItem = item.itemType === 'Tool'
                        ? await Tool.findById(item.package)
                        : await Package.findById(item.package);

                    if (!targetItem) continue;

                    const durationDays = calculateDurationDays(item, targetItem);
                    const startDate = new Date();
                    const endDate = new Date();
                    endDate.setDate(startDate.getDate() + durationDays);

                    const existingSub = await Subscription.findOne({
                        user: order.user,
                        packageId: targetItem._id,
                        status: 'active'
                    });

                    if (existingSub) {
                        const currentEnd = new Date(existingSub.endDate);
                        const extendFrom = currentEnd > startDate ? currentEnd : startDate;
                        const newEnd = new Date(extendFrom);
                        newEnd.setDate(newEnd.getDate() + durationDays);
                        existingSub.endDate = newEnd;
                        existingSub.orderId = order._id;
                        await existingSub.save();
                    } else {
                        await Subscription.create({
                            user: order.user,
                            packageId: targetItem._id,
                            itemType: item.itemType,
                            startDate,
                            endDate,
                            status: 'active',
                            orderId: order._id
                        });
                    }
                }
            }
            // Case 2: Revoking (Approved -> Rejected or Approved -> Pending)
            else if (oldStatus === 'approved' && (newStatus === 'rejected' || newStatus === 'pending')) {
                for (const item of order.items) {
                    const targetItem = item.itemType === 'Tool'
                        ? await Tool.findById(item.package)
                        : await Package.findById(item.package);

                    if (!targetItem) continue;

                    const subscription = await Subscription.findOne({
                        user: order.user,
                        packageId: targetItem._id,
                        orderId: order._id
                    });

                    if (subscription) {
                        const durationDays = calculateDurationDays(item, targetItem);
                        const currentEnd = new Date(subscription.endDate);
                        const newEnd = new Date(currentEnd);
                        newEnd.setDate(newEnd.getDate() - durationDays);
                        
                        subscription.endDate = newEnd;
                        if (newEnd < new Date()) {
                            subscription.status = 'expired';
                        }
                        await subscription.save();
                    }
                }
            }
        }

        order.status = newStatus;
        if (adminNote) order.adminNote = adminNote;
        await order.save();

        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error("Order update failed:", error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}
