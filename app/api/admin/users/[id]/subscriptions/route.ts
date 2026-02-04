import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Package from "@/models/Package";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { packageId, durationDays, isTrial } = body;

  await dbConnect();

  try {
    const pkg = await Package.findById(packageId);
    if (!pkg) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (isTrial && pkg.isTrial) {
         // Use provided duration or package default trial duration
         const days = durationDays || pkg.trialDurationDays || 7;
         endDate.setDate(startDate.getDate() + days);
    } else {
        // Standard package duration logic
        if (pkg.interval === 'monthly') {
            endDate.setMonth(startDate.getMonth() + 1);
        } else if (pkg.interval === 'yearly') {
            endDate.setFullYear(startDate.getFullYear() + 1);
        } else if (pkg.interval === 'lifetime') {
            endDate.setFullYear(startDate.getFullYear() + 100);
        }
    }

    const newSubscription = {
        packageId: pkg._id,
        startDate: startDate,
        endDate: endDate,
        status: 'active',
        autoRenew: false // Default to false for manual assignment
    };

    const user = await User.findByIdAndUpdate(
        id,
        { $push: { subscriptions: newSubscription } },
        { new: true }
    );

    return NextResponse.json(user);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign subscription" }, { status: 500 });
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
  
    if (!session || (session.user as any).role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    // Return user with populated subscription details
    const user = await User.findById(params.id).populate('subscriptions.packageId');
    
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    return NextResponse.json(user);
}
