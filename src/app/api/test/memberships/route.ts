import { NextRequest, NextResponse } from 'next/server';
import { createMembership, getMembershipByUserId, getAllMemberships } from '@/lib/appwrite';

export async function GET() {
  try {
    // Test getting all memberships
    const { memberships, total } = await getAllMemberships(5, 0);
    
    return NextResponse.json({
      success: true,
      message: 'Membership collection is working',
      data: {
        total,
        memberships: memberships.map(m => ({
          id: m.$id,
          appwriteUserId: m.appwriteUserId,
          plan: m.plan,
          wineLimit: m.wineLimit,
          currentWineCount: m.currentWineCount,
          expiresAt: m.expiresAt,
          isActive: m.isActive,
          resetYear: m.resetYear,
          createdAt: m.$createdAt,
          updatedAt: m.$updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error testing membership collection:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to access membership collection',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { appwriteUserId, plan } = await request.json();
    
    if (!appwriteUserId || !plan) {
      return NextResponse.json({ error: 'Missing appwriteUserId or plan' }, { status: 400 });
    }
    
    const MEMBERSHIP_PLANS = {
      STANDARD: { wineLimit: 20 },
      PLUS: { wineLimit: 50 },
      NEOMEZENĚ: { wineLimit: -1 },
      ENTERPRISE: { wineLimit: -1 }
    };
    
    const planConfig = MEMBERSHIP_PLANS[plan as keyof typeof MEMBERSHIP_PLANS];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }
    
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    const membership = await createMembership({
      appwriteUserId,
      plan: plan as any,
      wineLimit: planConfig.wineLimit,
      currentWineCount: 0,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      resetYear: new Date().getFullYear()
    });
    
    if (!membership) {
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test membership created',
      membership
    });
    
  } catch (error) {
    console.error('Error creating test membership:', error);
    return NextResponse.json({ 
      error: 'Failed to create test membership',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}