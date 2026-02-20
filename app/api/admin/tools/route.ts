import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
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
    const tools = await Tool.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tools);
  } catch (error: any) {
    console.error("Admin Tools API Error:", error);
    return NextResponse.json({ error: error.message || "Fetch failed" }, { status: 500 });
  }
}
