import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPage from "@/models/CustomPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  const pages = await CustomPage.find({}).sort({ createdAt: -1 });
  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const body = await req.json();
    const page = await CustomPage.create(body);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }
}
