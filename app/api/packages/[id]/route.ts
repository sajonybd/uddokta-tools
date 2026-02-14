import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  await dbConnect();
  try {
    const pkg = await Package.findById(params.id).populate('tools');
    if (!pkg) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const body = await req.json();
  try {
    const pkg = await Package.findByIdAndUpdate(params.id, body, { new: true });
    
    // Sync to Tool if Single Package
    if (pkg && pkg.tools && pkg.tools.length === 1) {
        await Tool.findByIdAndUpdate(pkg.tools[0], {
            price: pkg.price,
            interval: pkg.interval,
            packageId: pkg._id
        });
    }

    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  await dbConnect();
  try {
    await Package.findByIdAndDelete(params.id);
    return NextResponse.json({ message: "Package deleted" });
  } catch (error) {
      return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
