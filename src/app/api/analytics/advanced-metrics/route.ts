import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, ANALYTICS_DB_ID, Query } from '@/lib/appwrite-client';
import { getAdvancedMetrics } from '@/lib/analytics-fingerprint';
import { getRequestSessionUser } from '@/server/auth/session';

const SCAN_EVENTS_COLLECTION_ID = 'scan_events';

/**
 * Calculate date range based on the specified period
 */
function getDateRange(range: string): { startDate: string; endDate: string } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  
  switch (range) {
    case '7days':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90days':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }
  
  startDate.setHours(0, 0, 0, 0);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get('range') || '30days';
    const user = await getRequestSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Neautorizováno', message: 'Pro zobrazení analytiky se přihlaste' },
        { status: 401 }
      );
    }
    
    const { startDate, endDate } = getDateRange(range);
    
    // Get raw scan events for fingerprinting analysis
    try {
      const scanEvents = await adminDatabases.listDocuments(
        ANALYTICS_DB_ID,
        SCAN_EVENTS_COLLECTION_ID,
        [
          Query.equal('wineryId', user.id),
          Query.greaterThanEqual('date', startDate.split('T')[0]),
          Query.lessThanEqual('date', endDate.split('T')[0]),
          Query.limit(5000) // Increased limit for comprehensive analysis
        ]
      );
      
      if (scanEvents.documents.length === 0) {
        return NextResponse.json({
          uniqueVisitors: 0,
          returnRate: 0,
          avgSessionDuration: "0:00",
          bounceRate: 0,
          isRealData: false
        });
      }
      
      // Convert to our fingerprint format
      const fingerprintData = scanEvents.documents.map((doc: any) => ({
        wineryId: doc.wineryId,
        hour: doc.hour || 12, // Default hour if missing
        countryCode: doc.countryCode,
        operatingSystem: doc.operatingSystem,
        languageUsed: doc.languageUsed,
        deviceType: doc.deviceType,
        date: doc.date,
        wineId: doc.wineId
      }));
      
      // Calculate advanced metrics using fingerprinting
      const metrics = getAdvancedMetrics(fingerprintData);
      
      return NextResponse.json({
        ...metrics,
        isRealData: true,
        dataPoints: scanEvents.documents.length
      });
      
    } catch (error) {
      console.error('Error fetching scan events for advanced metrics:', error);
      return NextResponse.json({
        uniqueVisitors: 0,
        returnRate: 0,
        avgSessionDuration: "0:00",
        bounceRate: 0,
        isRealData: false
      });
    }
    
  } catch (error) {
    console.error('Error in advanced metrics endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to calculate advanced metrics' },
      { status: 500 }
    );
  }
}
