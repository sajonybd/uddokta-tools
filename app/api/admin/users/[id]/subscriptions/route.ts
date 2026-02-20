import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import Subscription from "@/models/Subscription";
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
  const { packageId, durationDays, isTrial, itemType } = body;

  await dbConnect();

  try {
    const targetItem = itemType === 'Tool' 
        ? await Tool.findById(packageId)
        : await Package.findById(packageId);

    if (!targetItem) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (durationDays) {
        endDate.setDate(startDate.getDate() + Number(durationDays));
    } else {
        // Standard package duration logic
        if (targetItem.interval === 'lifetime') {
            endDate.setFullYear(startDate.getFullYear() + 100);
        } else if (targetItem.interval === 'yearly' || targetItem.price === 0 || targetItem.isTrial) {
            endDate.setFullYear(startDate.getFullYear() + 1);
        } else {
            endDate.setMonth(startDate.getMonth() + 1);
        }
    }

    // Check for existing active subscription
    const existingSub = await Subscription.findOne({
        user: id,
        packageId: targetItem._id,
        status: 'active'
    });

    if (existingSub) {
        const currentEnd = new Date(existingSub.endDate);
        const extendFrom = currentEnd > startDate ? currentEnd : startDate;
        const newEnd = new Date(extendFrom);
        newEnd.setDate(newEnd.getDate() + (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        existingSub.endDate = newEnd;
        await existingSub.save();
    } else {
        await Subscription.create({
            user: id,
            packageId: targetItem._id,
            itemType: itemType || 'Package',
            startDate: startDate,
            endDate: endDate,
            status: 'active',
            autoRenew: false
        });
    }

    // Return user with populated subscription details from the new collection
    const user = await User.findById(id).lean();
    const subscriptions = await Subscription.find({ user: id }).populate('packageId');
    
    return NextResponse.json({ ...user, subscriptions });

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
    const user = await User.findById(params.id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const subscriptions = await Subscription.find({ user: params.id }).populate('packageId');
    
    return NextResponse.json({ ...user, subscriptions });
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { subId } = body;

  await dbConnect();
  try {
      await Subscription.findByIdAndDelete(subId);
      
      const user = await User.findById(id).lean();
      const subscriptions = await Subscription.find({ user: id }).populate('packageId');
      return NextResponse.json({ ...user, subscriptions });
  } catch(e) {
      return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 });
  }
}

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = params;
  const body = await req.json();
  const { subId, endDate, status } = body;

  await dbConnect();
  try {
        await Subscription.findByIdAndUpdate(subId, { 
            endDate: new Date(endDate),
            status: status
        });

        const user = await User.findById(id).lean();
        const subscriptions = await Subscription.find({ user: id }).populate('packageId');
        return NextResponse.json({ ...user, subscriptions });
  } catch (e) {
      console.error(e);
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

