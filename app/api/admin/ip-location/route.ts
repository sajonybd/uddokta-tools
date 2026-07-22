import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import IPLocation from "@/models/IPLocation";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    if (!ip) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    await dbConnect();

    // 1. Check if the IP is already cached in the database
    let location = await IPLocation.findOne({ ip });

    if (location) {
      return NextResponse.json({
        status: "success",
        city: location.city,
        country: location.country,
        cached: true,
      });
    }

    // 2. If not found, fetch from the external API
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const json = await res.json();

    if (json.status === "success") {
      // 3. Save to database for future requests
      location = await IPLocation.create({
        ip,
        city: json.city,
        country: json.country,
      });

      return NextResponse.json({
        status: "success",
        city: location.city,
        country: location.country,
        cached: false,
      });
    } else {
      return NextResponse.json({ status: "fail", message: json.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error("IP Location Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
