import { NextRequest, NextResponse } from 'next/server';
import { getAllMemberships, updateMembership } from '@/lib/appwrite';

// This endpoint can be called by a cron service to handle expired memberships
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Cron job triggered: Checking for expired memberships...');
    
    const now = new Date();
    let processedCount = 0;
    let expiredCount = 0;
    let offset = 0;
    const limit = 50; // Process in batches
    
    while (true) {
      // Get memberships in batches
      const { memberships, total } = await getAllMemberships(limit, offset);
      
      if (memberships.length === 0) {
        break;
      }
      
      // Process each membership
      for (const membership of memberships) {
        processedCount++;
        
        // Check if membership is expired
        const expiresAt = new Date(membership.expiresAt);
        const isExpired = expiresAt < now;
        
        // If membership is expired but still active, deactivate it
        if (isExpired && membership.isActive) {
          try {
            await updateMembership(membership.$id!, {
              isActive: false
            });
            
            expiredCount++;
            console.log(`Deactivated expired membership for user ${membership.appwriteUserId}`);
            
            // Optionally, you could send an email notification here
            // await sendExpirationNotification(membership);
            
          } catch (error) {
            console.error(`Error deactivating membership ${membership.$id}:`, error);
          }
        }
        
        // Check if it's a new year and reset wine count for active memberships
        const currentYear = new Date().getFullYear();
        if (membership.isActive && !isExpired && membership.resetYear < currentYear) {
          try {
            await updateMembership(membership.$id!, {
              currentWineCount: 0,
              resetYear: currentYear
            });
            
            console.log(`Reset wine count for user ${membership.appwriteUserId} for year ${currentYear}`);
            
          } catch (error) {
            console.error(`Error resetting wine count for membership ${membership.$id}:`, error);
          }
        }
      }
      
      // Check if we've processed all memberships
      if (offset + limit >= total) {
        break;
      }
      
      offset += limit;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Membership expiration check completed',
      processedCount,
      expiredCount,
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error in membership expiration cron job:', error);
    return NextResponse.json({ 
      error: 'Cron job failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also allow POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}