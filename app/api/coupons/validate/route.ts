import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Coupon from "@/models/Coupon";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Validation Logic Helper
const validateCouponRules = async (coupon: any, user: any, items: any[]) => {
  const now = new Date();
  
  // 1. Basic Status & Expiry
  if (coupon.status !== 'active') return "Coupon is inactive";
  if (new Date(coupon.expirationDate) < now) return "Coupon has expired";
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return "Coupon usage limit reached";

  // 2. User Type Rules
  if (coupon.rules.userType !== 'all') {
    if (!user) return "Login required for this coupon";

    // Fetch user details including past orders/subscriptions if not populated
    // Assumption: user object here is from session, need to fetch DB user for accurate history if needed
    // checking subscriptions for 'active' or 'old'.
    // checking 'new' means no subscriptions ever.
    
    // Simplification for MVP: We might need to look at User.subscriptions
    const dbUser = await User.findById(user.id);
    const hasActiveSub = dbUser.subscriptions.some((sub: any) => sub.status === 'active' && new Date(sub.endDate) > now);
    const hasPastSub = dbUser.subscriptions.length > 0; // If any sub exists, not 'new'.

    if (coupon.rules.userType === 'new' && hasPastSub) return "Coupon valid for new users only";
    if (coupon.rules.userType === 'active' && !hasActiveSub) return "Coupon valid for active subscribers only";
    if (coupon.rules.userType === 'old' && (hasActiveSub || !hasPastSub)) return "Coupon valid for returning users only";
  }

  // 3. Specific Emails
  if (coupon.rules.specificEmails && coupon.rules.specificEmails.length > 0) {
    if (!user || !coupon.rules.specificEmails.includes(user.email)) return "Coupon not valid for this account";
  }

  // 4. Min Order Value
  const cartTotal = items.reduce((sum, item) => sum + item.price, 0);
  if (coupon.rules.minOrderValue > 0 && cartTotal < coupon.rules.minOrderValue) {
    return `Minimum order value of ${coupon.rules.minOrderValue} required`;
  }

  // 5. Specific Packages / Tools
  // Items in cart are Packages.
  // Validate if coupon requires specific package OR specific tool (inside package)
  // Logic: "Validation passes if ANY item matches requirements?" OR "Discount only applies to matching items?"
  // USUALLY: Coupon applies if conditions met, but discount calculation depends on type.
  // Simple version: If specificPackages is set, ensure at least one package in cart matches?
  
  if (coupon.rules.specificPackages && coupon.rules.specificPackages.length > 0) {
     const packageIds = items.map(i => i._id.toString());
     const hasMatch = coupon.rules.specificPackages.some((id: any) => packageIds.includes(id.toString()));
     if (!hasMatch) return "Coupon not applicable to items in cart";
  }
  
  // Specific Tools logic is trickier because we need to know what tools are inside the packages in the cart.
  // We assume 'items' passed to this API includes populated tool info or we fetch it.
  // For now, let's skip deep specificTool check in this MVP validation unless items have 'tools' populated.

  return null; // No errors
};

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  let user = session?.user as any;

  try {
    const { code, items } = await req.json(); // items = [{ _id, price, ... }]

    if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

    const coupon = await Coupon.findOne({ code });
    if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });

    const validationError = await validateCouponRules(coupon, user, items);
    if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Calculate Discount
    let discount = 0;
    const cartTotal = items.reduce((sum: number, item: any) => sum + item.price, 0);

    if (coupon.discountType === 'flat') {
        discount = coupon.discountAmount;
    } else {
        discount = (cartTotal * coupon.discountAmount) / 100;
    }

    // Ensure discount doesn't exceed total
    if (discount > cartTotal) discount = cartTotal;

    return NextResponse.json({
        success: true,
        coupon: {
            code: coupon.code,
            discountType: coupon.discountType,
            discountAmount: coupon.discountAmount,
            _id: coupon._id
        },
        discountString: coupon.discountType === 'flat' ? `-$${coupon.discountAmount}` : `-${coupon.discountAmount}%`,
        estimatedDiscount: discount
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
