
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ExchangeRate from "@/models/ExchangeRate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  try {
      const body = await req.json();
      const { rates } = body; // Expect { BDT: 120, INR: 85 }

      const promises = Object.entries(rates).map(async ([currency, rate]) => {
          if (currency === 'USD') return; // Skip USD
          
          return ExchangeRate.findOneAndUpdate(
              { currency },
              { rate, updatedAt: new Date() },
              { upsert: true, new: true }
          );
      });

      await Promise.all(promises);
      
      return NextResponse.json({ success: true });
  } catch (err) {
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function GET() {
    // Re-use public logic or just return raw array
    await dbConnect();
    const rates = await ExchangeRate.find({});
    return NextResponse.json(rates);
}
