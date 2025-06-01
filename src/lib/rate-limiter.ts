import { adminDatabases, API_DB_ID, ID, Query } from './appwrite-client';

// Rate limiter configuration
const RATE_LIMITS = {
  basic: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000
  },
  premium: {
    requestsPerMinute: 300,
    requestsPerHour: 10000,
    requestsPerDay: 100000
  }
};

// Collection for rate limiting data
export const RATE_LIMIT_COLLECTION_ID = 'rate_limits';

export interface RateLimitRecord {
  $id?: string;
  keyId: string;
  userId: string;
  windowStart: string;
  windowType: 'minute' | 'hour' | 'day';
  requestCount: number;
  lastRequest: string;
}

// Get rate limit window start time
function getWindowStart(windowType: 'minute' | 'hour' | 'day'): Date {
  const now = new Date();
  
  switch (windowType) {
    case 'minute':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0);
    case 'hour':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    case 'day':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    default:
      return now;
  }
}

// Check if request is within rate limit
export async function checkRateLimit(
  keyId: string, 
  userId: string, 
  tier: 'basic' | 'premium' = 'basic'
): Promise<{ allowed: boolean; remaining: number; resetTime: Date; retryAfter?: number }> {
  try {
    const limits = RATE_LIMITS[tier];
    const now = new Date();
    
    // Check each time window (minute, hour, day)
    for (const [windowType, limit] of Object.entries({
      minute: limits.requestsPerMinute,
      hour: limits.requestsPerHour,
      day: limits.requestsPerDay
    })) {
      const windowStart = getWindowStart(windowType as 'minute' | 'hour' | 'day');
      const windowStartISO = windowStart.toISOString();
      
      try {
        // Get or create rate limit record for this window
        const response = await adminDatabases.listDocuments(
          API_DB_ID,
          RATE_LIMIT_COLLECTION_ID,
          [
            Query.equal('keyId', keyId),
            Query.equal('windowType', windowType),
            Query.equal('windowStart', windowStartISO),
            Query.limit(1)
          ]
        );
        
        let record: RateLimitRecord;
        
        if (response.documents.length > 0) {
          // Update existing record
          record = response.documents[0] as unknown as RateLimitRecord;
          
          if (record.requestCount >= limit) {
            // Rate limit exceeded
            const resetTime = new Date(windowStart);
            resetTime.setTime(resetTime.getTime() + getWindowDuration(windowType as 'minute' | 'hour' | 'day'));
            
            const retryAfter = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
            
            return {
              allowed: false,
              remaining: 0,
              resetTime,
              retryAfter
            };
          }
          
          // Increment counter
          await adminDatabases.updateDocument(
            API_DB_ID,
            RATE_LIMIT_COLLECTION_ID,
            record.$id!,
            {
              requestCount: record.requestCount + 1,
              lastRequest: now.toISOString()
            }
          );
          
          const remaining = limit - (record.requestCount + 1);
          const resetTime = new Date(windowStart);
          resetTime.setTime(resetTime.getTime() + getWindowDuration(windowType as 'minute' | 'hour' | 'day'));
          
          return {
            allowed: true,
            remaining,
            resetTime
          };
        } else {
          // Create new record
          record = {
            keyId,
            userId,
            windowStart: windowStartISO,
            windowType: windowType as 'minute' | 'hour' | 'day',
            requestCount: 1,
            lastRequest: now.toISOString()
          };
          
          await adminDatabases.createDocument(
            API_DB_ID,
            RATE_LIMIT_COLLECTION_ID,
            ID.unique(),
            record
          );
          
          const remaining = limit - 1;
          const resetTime = new Date(windowStart);
          resetTime.setTime(resetTime.getTime() + getWindowDuration(windowType as 'minute' | 'hour' | 'day'));
          
          return {
            allowed: true,
            remaining,
            resetTime
          };
        }
      } catch (error) {
        console.error(`Error checking ${windowType} rate limit:`, error);
        // On error, allow the request but log it
        continue;
      }
    }
    
    // If we get here, all windows passed
    return {
      allowed: true,
      remaining: limits.requestsPerMinute - 1,
      resetTime: new Date(Date.now() + 60000) // 1 minute from now
    };
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On error, allow the request to avoid blocking legitimate usage
    return {
      allowed: true,
      remaining: 100,
      resetTime: new Date(Date.now() + 60000)
    };
  }
}

// Get window duration in milliseconds
function getWindowDuration(windowType: 'minute' | 'hour' | 'day'): number {
  switch (windowType) {
    case 'minute':
      return 60 * 1000;
    case 'hour':
      return 60 * 60 * 1000;
    case 'day':
      return 24 * 60 * 60 * 1000;
    default:
      return 60 * 1000;
  }
}

// Clean up old rate limit records (can be called periodically)
export async function cleanupOldRateLimitRecords(): Promise<void> {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const response = await adminDatabases.listDocuments(
      API_DB_ID,
      RATE_LIMIT_COLLECTION_ID,
      [
        Query.lessThan('windowStart', threeDaysAgo.toISOString()),
        Query.limit(100)
      ]
    );
    
    for (const record of response.documents) {
      await adminDatabases.deleteDocument(
        API_DB_ID,
        RATE_LIMIT_COLLECTION_ID,
        record.$id
      );
    }
  } catch (error) {
    console.error('Error cleaning up rate limit records:', error);
  }
}

// Get user's membership tier (basic implementation)
export async function getUserMembershipTier(userId: string): Promise<'basic' | 'premium'> {
  try {
    // This would typically check your membership/subscription system
    // For now, we'll return 'basic' as default
    // You can enhance this to check actual membership status
    return 'basic';
  } catch (error) {
    console.error('Error getting user membership tier:', error);
    return 'basic';
  }
}