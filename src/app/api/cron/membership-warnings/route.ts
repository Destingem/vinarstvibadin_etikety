import { NextRequest, NextResponse } from 'next/server';
import { getAllMemberships } from '@/lib/appwrite';
import { isExpiringWithinDays, sendExpirationWarning } from '@/lib/membership-notifications';

// This endpoint can be called by a cron service to send expiration warnings
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get('Authorization');
    const expectedToken = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('Cron job triggered: Checking for memberships needing expiration warnings...');
    
    const warningDays = [30, 14, 7, 3, 1]; // Send warnings at these intervals
    let processedCount = 0;
    let warningsSent = 0;
    let offset = 0;
    const limit = 50;
    
    while (true) {
      // Get active memberships in batches
      const { memberships, total } = await getAllMemberships(limit, offset);
      
      if (memberships.length === 0) {
        break;
      }
      
      // Process each membership
      for (const membership of memberships) {
        processedCount++;
        
        // Only process active memberships
        if (!membership.isActive) {
          continue;
        }
        
        // Check if membership is expiring within any of our warning periods
        for (const days of warningDays) {
          // Only process memberships with valid IDs
          if (membership.$id && isExpiringWithinDays(membership as any, days)) {
            
            // Check if we've already sent a warning for this period
            // In a real implementation, you'd want to track this in the database
            // For now, we'll just send warnings for memberships expiring in exactly these days
            
            const expiresAt = new Date(membership.expiresAt);
            const today = new Date();
            const diffTime = expiresAt.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === days) {
              try {
                const success = await sendExpirationWarning(membership as any, days);
                if (success) {
                  warningsSent++;
                  console.log(`Sent ${days}-day expiration warning for user ${membership.appwriteUserId}`);
                }
              } catch (error) {
                console.error(`Error sending warning for membership ${membership.$id}:`, error);
              }
              
              break; // Only send one warning per membership per run
            }
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
      message: 'Membership warning check completed',
      processedCount,
      warningsSent,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in membership warning cron job:', error);
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