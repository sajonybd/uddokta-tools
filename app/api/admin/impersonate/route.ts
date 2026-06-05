import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import ImpersonationToken from "@/models/ImpersonationToken";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token mapping
    await ImpersonationToken.create({
      token,
      userId,
    });

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    console.error("Impersonation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
