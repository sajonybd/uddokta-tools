import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { firebaseIdToken } = await req.json();

    if (!firebaseIdToken) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    const { adminAuth } = await import("@/lib/firebase-admin");
    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return NextResponse.json({ message: "No phone number in token" }, { status: 400 });
    }

    await dbConnect();

    // Check if phone number is already used by someone else
    const existingUserWithPhone = await User.findOne({ phone: phoneNumber });
    if (existingUserWithPhone && existingUserWithPhone._id.toString() !== session.user.id) {
      return NextResponse.json({ message: "Phone number already in use by another account" }, { status: 400 });
    }

    // Update current user
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    user.phone = phoneNumber;
    user.phoneVerified = true;
    await user.save();

    return NextResponse.json({ message: "Phone verified successfully", phone: phoneNumber }, { status: 200 });
  } catch (error: any) {
    console.error("Phone verify error:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
