import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import AffiliateEarning from '@/models/AffiliateEarning';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';
import User from '@/models/User';

const checkAdmin = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (user?.role !== 'admin') throw new Error('Unauthorized');
  return user;
};

export async function GET() {
  await dbConnect();

  try {
    await checkAdmin();

    const withdrawals = await AffiliateWithdrawal.find({})
      .populate('user', 'name email customId')
      .sort({ createdAt: -1 });

    const earnings = await AffiliateEarning.find({})
      .populate('referrer', 'name email customId')
      .populate('referredUser', 'name email customId')
      .populate('order', 'status finalAmount')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      withdrawals,
      earnings,
    });
  } catch (error) {
    console.error('Error fetching admin affiliate data:', error);
    return NextResponse.json({ error: 'Unauthorized or error fetching affiliate data' }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  await dbConnect();

  try {
    await checkAdmin();

    const { withdrawalId, status, adminNote } = await req.json();

    if (!withdrawalId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const withdrawal = await AffiliateWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    if (withdrawal.status !== 'pending') {
      return NextResponse.json({ error: 'Withdrawal request is already processed' }, { status: 400 });
    }

    withdrawal.status = status;
    if (adminNote !== undefined) {
      withdrawal.adminNote = adminNote;
    }

    await withdrawal.save();

    return NextResponse.json({ success: true, withdrawal });
  } catch (error) {
    console.error('Error processing withdrawal status:', error);
    return NextResponse.json({ error: 'Failed to process withdrawal request' }, { status: 500 });
  }
}
