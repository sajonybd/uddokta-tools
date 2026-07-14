import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { getNextUserId } = await import("@/lib/user-utils");
    const customId = await getNextUserId();

    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const referredByCookie = cookieStore.get("referredBy")?.value;
    let referredByUserId = undefined;

    if (referredByCookie) {
      const referrer = await User.findOne({ customId: Number(referredByCookie) });
      if (referrer) {
        referredByUserId = referrer._id;
      }
    }

    await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      provider: "credentials",
      customId,
      referredBy: referredByUserId,
      phoneVerified: false,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
