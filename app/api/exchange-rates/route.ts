
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ExchangeRate from "@/models/ExchangeRate";

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const rates = await ExchangeRate.find({});
    // Convert array to object: { BDT: 120, INR: 85 }
    const ratesMap: Record<string, number> = {};
    rates.forEach((r: any) => {
        ratesMap[r.currency] = r.rate;
    });
    
    // Ensure USD is 1
    ratesMap['USD'] = 1;

    return NextResponse.json(ratesMap);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch rates" }, { status: 500 });
  }
}
