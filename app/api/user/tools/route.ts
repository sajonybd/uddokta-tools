import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
      const allTools = await Tool.find({ status: 'active' }).sort({ createdAt: -1 });
      const user = session.user as any;

      // Admin sees everything
      if (user.role === 'admin') {
          return NextResponse.json(allTools);
      }

      // Filter for regular users
      const dbUser = await User.findById(user.id).populate({
          path: 'subscriptions.packageId',
          populate: { path: 'tools' }
      });

      if (!dbUser) {
           return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const accessibleToolIds = new Set<string>();

      const activeSubs = dbUser.subscriptions.filter((sub: any) => {
          return sub.status === 'active' && new Date(sub.endDate) > new Date();
      });

      activeSubs.forEach((sub: any) => {
          if (sub.packageId && sub.packageId.tools) {
              sub.packageId.tools.forEach((t: any) => {
                  accessibleToolIds.add(t._id.toString());
              });
          }
      });

      const accessibleTools = allTools.filter(t => accessibleToolIds.has(t._id.toString()));
      return NextResponse.json(accessibleTools);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
