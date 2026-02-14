import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids)) {
        return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    await Package.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ message: "Packages deleted successfully" });
  } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
  }
}
