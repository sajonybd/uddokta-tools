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

      // Admin sees everything as active
      if (user.role === 'admin') {
          return NextResponse.json(allTools.map(t => ({
              ...t.toObject(),
              access: { status: 'active', expiryDate: null }
          })));
      }

      // Filter for regular users
      const dbUser = await User.findById(user.id).populate({
          path: 'subscriptions.packageId',
          populate: { path: 'tools' }
      });

      if (!dbUser) {
           return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const toolAccess = new Map<string, { status: 'active' | 'expired', expiryDate: Date, packageId: string }>();

      if (dbUser.subscriptions) {
        dbUser.subscriptions.forEach((sub: any) => {
            if (!sub.packageId || !sub.packageId.tools) return;
            
            const isSubActive = sub.status === 'active' && new Date(sub.endDate) > new Date();
            const subStatus = isSubActive ? 'active' : 'expired';

            sub.packageId.tools.forEach((t: any) => {
                const tid = t._id.toString();
                const existing = toolAccess.get(tid);

                // Priority: Active > Expired. 
                // Within same status: Later Expiry > Earlier Expiry.

                if (!existing) {
                    toolAccess.set(tid, {
                        status: subStatus,
                        expiryDate: sub.endDate,
                        packageId: sub.packageId._id
                    });
                } else {
                    if (subStatus === 'active' && existing.status === 'expired') {
                        // Upgrade to active
                        toolAccess.set(tid, {
                            status: 'active',
                            expiryDate: sub.endDate,
                            packageId: sub.packageId._id
                        });
                    } else if (subStatus === existing.status) {
                        // Same status, take later expiry
                        if (new Date(sub.endDate) > new Date(existing.expiryDate)) {
                            toolAccess.set(tid, {
                                status: subStatus,
                                expiryDate: sub.endDate,
                                packageId: sub.packageId._id
                            });
                        }
                    }
                    // If existing is active and new is expired, keep existing.
                }
            });
        });
      }

      // Return tools user has history with, attached with access info
      const userTools = allTools
        .filter(t => toolAccess.has(t._id.toString()))
        .map(t => ({
            ...t.toObject(),
            access: toolAccess.get(t._id.toString())
        }));
      
      return NextResponse.json(userTools);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
