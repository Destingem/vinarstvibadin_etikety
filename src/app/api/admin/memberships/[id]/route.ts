import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { updateMembership, getMembershipByUserId } from '@/lib/appwrite';

const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

const MEMBERSHIP_PLANS = {
  STANDARD: { wineLimit: 20, price: 690 },
  PLUS: { wineLimit: 50, price: 1490 },
  NEOMEZENĚ: { wineLimit: -1, price: 6990 },
  ENTERPRISE: { wineLimit: -1, price: 0 }
};

async function isAdmin(email: string): Promise<boolean> {
  return ADMIN_EMAILS.includes(email);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }
    
    const verifiedToken = verifyJwtToken(token);
    if (!verifiedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = await getUserById(verifiedToken.userId);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, isActive, expiresAt } = await request.json();
    const resolvedParams = await params;
    const membershipId = resolvedParams.id;

    const updateData: any = {};

    if (plan && MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS]) {
      const planConfig = MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS];
      updateData.plan = plan;
      updateData.wineLimit = planConfig.wineLimit;
    }

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (expiresAt) {
      updateData.expiresAt = expiresAt;
    }

    const updatedMembership = await updateMembership(membershipId, updateData);

    if (!updatedMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json(updatedMembership);
  } catch (error) {
    console.error('Error updating membership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }
    
    const verifiedToken = verifyJwtToken(token);
    if (!verifiedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const user = await getUserById(verifiedToken.userId);
    if (!user || !(await isAdmin(user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const membershipId = resolvedParams.id;

    // Set membership as inactive instead of deleting
    const updatedMembership = await updateMembership(membershipId, {
      isActive: false
    });

    if (!updatedMembership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deactivating membership:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}