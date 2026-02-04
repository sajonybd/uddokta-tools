import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  try {
    const tools = await Tool.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // TODO: Add proper role check. Assuming session existence is enough for MVP or check email
  if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const tool = await Tool.create(body);
    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 });
  }
}
