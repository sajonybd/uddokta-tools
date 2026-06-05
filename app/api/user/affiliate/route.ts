import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AffiliateEarning from '@/models/AffiliateEarning';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';
import User from '@/models/User';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const now = new Date();

    // 1. Calculate Earnings Metrics
    const earnings = await AffiliateEarning.find({ referrer: userId });
    
    let totalEarned = 0;
    let matureBalance = 0;
    let pendingBalance = 0;

    earnings.forEach((earning) => {
      totalEarned += earning.amount;
      if (new Date(earning.availableAt) <= now) {
        matureBalance += earning.amount;
      } else {
        pendingBalance += earning.amount;
      }
    });

    // Rounding to 2 decimal places
    totalEarned = parseFloat(totalEarned.toFixed(2));
    matureBalance = parseFloat(matureBalance.toFixed(2));
    pendingBalance = parseFloat(pendingBalance.toFixed(2));

    // 2. Calculate Withdrawal Metrics
    const withdrawals = await AffiliateWithdrawal.find({ user: userId });
    
    let totalWithdrawn = 0;
    let pendingWithdrawals = 0;

    withdrawals.forEach((wd) => {
      if (wd.status === 'approved') {
        totalWithdrawn += wd.amount;
      } else if (wd.status === 'pending') {
        pendingWithdrawals += wd.amount;
      }
    });

    totalWithdrawn = parseFloat(totalWithdrawn.toFixed(2));
    pendingWithdrawals = parseFloat(pendingWithdrawals.toFixed(2));

    const availableToWithdraw = parseFloat((matureBalance - totalWithdrawn - pendingWithdrawals).toFixed(2));

    // 3. Fetch logs
    const earningsLog = await AffiliateEarning.find({ referrer: userId })
      .populate('referredUser', 'name email customId')
      .populate('order', 'status finalAmount')
      .sort({ createdAt: -1 });

    const withdrawalLog = await AffiliateWithdrawal.find({ user: userId })
      .sort({ createdAt: -1 });

    const referredUsers = await User.find({ referredBy: userId }, 'name createdAt customId')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      metrics: {
        totalEarned,
        matureBalance,
        pendingBalance,
        totalWithdrawn,
        pendingWithdrawals,
        availableToWithdraw: availableToWithdraw < 0 ? 0 : availableToWithdraw,
      },
      earningsLog,
      withdrawalLog,
      referredUsers,
    });
  } catch (error) {
    console.error('Error fetching user affiliate data:', error);
    return NextResponse.json({ error: 'Failed to fetch affiliate data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { amount, paymentMethod, paymentDetails } = await req.json();

    const requestAmount = parseFloat(amount);
    if (isNaN(requestAmount) || requestAmount <= 0) {
      return NextResponse.json({ error: 'Invalid withdrawal amount' }, { status: 400 });
    }

    if (!['bank', 'bkash', 'rocket', 'nagad'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    if (!paymentDetails || paymentDetails.trim() === '') {
      return NextResponse.json({ error: 'Payment details are required' }, { status: 400 });
    }

    // Calculate available balance to verify
    const now = new Date();
    const earnings = await AffiliateEarning.find({ referrer: userId });
    
    let matureBalance = 0;
    earnings.forEach((earning) => {
      if (new Date(earning.availableAt) <= now) {
        matureBalance += earning.amount;
      }
    });

    const withdrawals = await AffiliateWithdrawal.find({ user: userId });
    let totalWithdrawn = 0;
    let pendingWithdrawals = 0;
    withdrawals.forEach((wd) => {
      if (wd.status === 'approved') {
        totalWithdrawn += wd.amount;
      } else if (wd.status === 'pending') {
        pendingWithdrawals += wd.amount;
      }
    });

    const availableToWithdraw = parseFloat((matureBalance - totalWithdrawn - pendingWithdrawals).toFixed(2));

    if (requestAmount > availableToWithdraw) {
      return NextResponse.json({ error: 'Insufficient available balance' }, { status: 400 });
    }

    const withdrawalRequest = await AffiliateWithdrawal.create({
      user: userId,
      amount: requestAmount,
      paymentMethod,
      paymentDetails,
      status: 'pending',
    });

    return NextResponse.json({ success: true, withdrawal: withdrawalRequest });
  } catch (error) {
    console.error('Error submitting withdrawal request:', error);
    return NextResponse.json({ error: 'Failed to submit withdrawal request' }, { status: 500 });
  }
}
