import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Middleware check helper
const checkAdmin = async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (user?.role !== 'admin') throw new Error("Unauthorized");
    return user;
}

export async function GET(req: Request) {
  await dbConnect();
  try {
    await checkAdmin();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized or Error" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    await checkAdmin();
    const body = await req.json();
    const coupon = await Coupon.create(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
     return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
