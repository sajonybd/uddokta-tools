import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import Package from "@/models/Package";
import Subscription from "@/models/Subscription";
import Order from "@/models/Order"; // Ensure model registered
import User from "@/models/User"; // Ensure model registered
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const toolId = params.id;
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    // Find all packages containing this tool
    const packages = await Package.find({ tools: toolId }).lean();
    const packageIds = packages.map(pkg => pkg._id);

    // Find all active subscriptions for this tool or packages containing this tool
    const subscriptions = await Subscription.find({
      status: "active",
      endDate: { $gt: new Date() },
      $or: [
        { packageId: toolId, itemType: "Tool" },
        { packageId: { $in: packageIds }, itemType: "Package" }
      ]
    })
    .populate("user", "name email")
    .populate("packageId", "name price interval")
    .populate("orderId", "paymentMethod finalAmount paymentProof")
    .sort({ endDate: 1 })
    .lean();

    return NextResponse.json({ tool, subscriptions });
  } catch (error: any) {
    console.error("Fetch tool users error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}
