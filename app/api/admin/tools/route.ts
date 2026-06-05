import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import Package from "@/models/Package";
import Subscription from "@/models/Subscription";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const tools = await Tool.find({}).sort({ position: 1, createdAt: -1 }).lean();
    
    // Fetch all active subscriptions
    const activeSubs = await Subscription.find({
      status: "active",
      endDate: { $gt: new Date() }
    }).lean();

    // Fetch all packages
    const packages = await Package.find({}).lean();

    // Attach active users count to each tool
    const toolsWithActiveUsers = tools.map((tool: any) => {
      const toolIdStr = tool._id.toString();

      // Find packages containing this tool
      const parentPackageIds = packages
        .filter((pkg: any) => pkg.tools && pkg.tools.map((id: any) => id.toString()).includes(toolIdStr))
        .map((pkg: any) => pkg._id.toString());

      // Find subscriptions for this tool directly or packages containing this tool
      const matchingSubs = activeSubs.filter((sub: any) => {
        const targetIdStr = sub.packageId?.toString();
        if (sub.itemType === 'Tool') {
          return targetIdStr === toolIdStr;
        } else {
          return parentPackageIds.includes(targetIdStr);
        }
      });

      // Unique user count
      const uniqueUsers = new Set(matchingSubs.map((sub: any) => sub.user?.toString()));

      return {
        ...tool,
        activeUsers: uniqueUsers.size
      };
    });

    return NextResponse.json(toolsWithActiveUsers);
  } catch (error: any) {
    console.error("Admin Tools API Error:", error);
    return NextResponse.json({ error: error.message || "Fetch failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { order } = await req.json(); // Array of { id: string, position: number }
    if (!Array.isArray(order)) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    const bulkOps = order.map((item: any) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { position: item.position } }
      }
    }));

    await Tool.bulkWrite(bulkOps);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Tools Reorder Error:", error);
    return NextResponse.json({ error: error.message || "Reorder failed" }, { status: 500 });
  }
}
