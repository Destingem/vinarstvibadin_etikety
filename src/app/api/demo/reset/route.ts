import { NextRequest, NextResponse } from 'next/server';
import { createUser, updateUserPrefs } from '@/lib/auth-server';
import { getMembershipByUserId, createMembership, updateMembership } from '@/lib/appwrite';
import { getAppwriteAdminHeaders, getAppwriteUrl } from '@/lib/appwrite-env';

const DEMO_EMAIL = 'demo@etiketa.wine';
const DEMO_PASSWORD = 'demo123456';
const DEMO_NAME = 'Demo Vinařství';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting demo account reset...');
    
    // Check if demo user already exists
    let demoUserId = '';
    
    try {
      // Try to find existing demo user
      const response = await fetch(getAppwriteUrl('/users'), {
        headers: getAppwriteAdminHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        const demoUser = data.users?.find((user: any) => user.email === DEMO_EMAIL);
        
        if (demoUser) {
          demoUserId = demoUser.$id;
          console.log('Found existing demo user:', demoUserId);
          
          // Delete existing demo user to recreate fresh
          try {
            await fetch(getAppwriteUrl(`/users/${demoUserId}`), {
              method: 'DELETE',
              headers: getAppwriteAdminHeaders(),
            });
            console.log('Deleted existing demo user');
          } catch (deleteError) {
            console.error('Error deleting demo user:', deleteError);
          }
        }
      }
    } catch (error) {
      console.error('Error checking for existing demo user:', error);
    }
    
    // Create new demo user
    try {
      const newDemoUser = await createUser(DEMO_EMAIL, DEMO_PASSWORD, DEMO_NAME);
      demoUserId = newDemoUser.$id;
      console.log('Created new demo user:', demoUserId);
    } catch (error) {
      console.error('Error creating demo user:', error);
      return NextResponse.json({ error: 'Failed to create demo user' }, { status: 500 });
    }
    
    // Create/update demo membership with NEOMEZENĚ plan
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now
    
    try {
      // Check if membership exists
      const existingMembership = await getMembershipByUserId(demoUserId);
      
      if (existingMembership) {
        // Update existing membership
        await updateMembership(existingMembership.$id!, {
          plan: 'NEOMEZENĚ',
          wineLimit: -1,
          currentWineCount: 0,
          expiresAt: expiresAt.toISOString(),
          isActive: true,
          resetYear: new Date().getFullYear()
        });
        console.log('Updated demo membership');
      } else {
        // Create new membership
        await createMembership({
          appwriteUserId: demoUserId,
          plan: 'NEOMEZENĚ',
          wineLimit: -1,
          currentWineCount: 0,
          expiresAt: expiresAt.toISOString(),
          isActive: true,
          resetYear: new Date().getFullYear()
        });
        console.log('Created demo membership');
      }
    } catch (error) {
      console.error('Error creating/updating demo membership:', error);
      return NextResponse.json({ error: 'Failed to create demo membership' }, { status: 500 });
    }
    
    // Set the last reset time in user preferences
    try {
      await updateUserPrefs({
        lastReset: new Date().toISOString(),
        isDemo: true
      }, demoUserId);
    } catch (error) {
      console.error('Error updating demo user preferences:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Demo account has been reset',
      demoCredentials: {
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        userId: demoUserId
      }
    });
    
  } catch (error) {
    console.error('Error resetting demo account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check demo account status
export async function GET() {
  try {
    // Find demo user
    const response = await fetch(getAppwriteUrl('/users'), {
      headers: getAppwriteAdminHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    const demoUser = data.users?.find((user: any) => user.email === DEMO_EMAIL);
    
    if (!demoUser) {
      return NextResponse.json({
        exists: false,
        message: 'Demo account does not exist'
      });
    }
    
    const lastReset = demoUser.prefs?.lastReset;
    const hoursSinceReset = lastReset 
      ? (new Date().getTime() - new Date(lastReset).getTime()) / (1000 * 60 * 60)
      : null;
    
    return NextResponse.json({
      exists: true,
      userId: demoUser.$id,
      email: demoUser.email,
      lastReset,
      hoursSinceReset,
      needsReset: !lastReset || (hoursSinceReset !== null && hoursSinceReset > 1)
    });
    
  } catch (error) {
    console.error('Error checking demo account status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
