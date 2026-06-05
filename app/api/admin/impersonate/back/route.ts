import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ImpersonationToken from "@/models/ImpersonationToken";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const isImpersonated = (session?.user as any)?.isImpersonated;
    const originalAdminId = (session?.user as any)?.originalAdminId;

    if (!session || !isImpersonated || !originalAdminId) {
      return NextResponse.json({ error: "Unauthorized: Not in impersonation mode" }, { status: 401 });
    }

    await dbConnect();

    // Verify original admin exists and has admin privileges
    const adminUser = await User.findById(originalAdminId);
    if (!adminUser) {
      return NextResponse.json({ error: "Original administrator user not found" }, { status: 404 });
    }

    if (adminUser.role !== "admin") {
      return NextResponse.json({ error: "Original user is not an administrator" }, { status: 403 });
    }

    if (adminUser.status === "blocked") {
      return NextResponse.json({ error: "Administrator account is blocked" }, { status: 403 });
    }

    // Generate a secure random token for returning to admin
    const token = crypto.randomBytes(32).toString("hex");

    // Save token mapping (admin returns to admin, so no adminUserId is needed on the return token)
    await ImpersonationToken.create({
      token,
      userId: adminUser._id,
    });

    return NextResponse.json({
      success: true,
      token,
      email: adminUser.email,
    });
  } catch (error: any) {
    console.error("Error switching back to admin:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
