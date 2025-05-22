import { NextRequest, NextResponse } from 'next/server';
import * as AnalyticsService from '@/lib/analytics-service';
import { adminDatabases, ANALYTICS_DB_ID, Query } from '@/lib/appwrite-client';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';

/**
 * Calculate date range based on the specified period
 */
function getDateRange(range: string): { startDate: string; endDate: string } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  
  // Set the appropriate date range
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
      // Default to 30 days
      startDate.setDate(startDate.getDate() - 30);
  }
  
  startDate.setHours(0, 0, 0, 0);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
}

/**
 * API endpoint to get analytics dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const range = searchParams.get('range') || '30days';
    
    // Verify that userId is provided
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // Get date ranges for current and previous periods
    const { startDate, endDate } = getDateRange(range as string);
    
    // Calculate the previous period's date range (same duration, immediately before)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - (new Date(endDate).getDate() - new Date(startDate).getDate()));
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    // Try to get real analytics data
    try {
      // Check if we have any daily stats (the most essential data)
      let dailyStats = [];
      
      try {
        dailyStats = await AnalyticsService.getDailyScanStats(
          userId, 
          startDate, 
          endDate
        );
      } catch (error) {
        console.error('Error fetching daily stats:', error);
      }
      
      // If we have real data, try to build the complete dashboard
      if (dailyStats.length > 0) {
        // Get previous period stats for trend calculation
        let previousDailyStats = [];
        try {
          previousDailyStats = await AnalyticsService.getDailyScanStats(
            userId, 
            previousStartDate.toISOString(), 
            previousEndDate.toISOString()
          );
        } catch (error) {
          console.error('Error fetching previous daily stats:', error);
        }
        
        // Calculate basic metrics
        const totalScans = dailyStats.reduce((sum, doc) => sum + (doc.scanCount || 0), 0);
        const totalUniqueVisitors = dailyStats.reduce((sum, doc) => sum + (doc.uniqueVisitorsEstimate || 0), 0);
        
        // Calculate trend
        const currentPeriodTotal = dailyStats.reduce((sum, doc) => sum + (doc.scanCount || 0), 0);
        const previousPeriodTotal = previousDailyStats.reduce((sum, doc) => sum + (doc.scanCount || 0), 0);
        
        let percentChange = 0;
        let isPositive = false;
        
        if (previousPeriodTotal > 0) {
          percentChange = Math.round(((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100);
          isPositive = percentChange > 0;
        }
        
        const scanTrend = { percentChange, isPositive };
        
        // Calculate device breakdown
        const scansByDevice = {
          mobile: dailyStats.reduce((sum, doc) => sum + (doc.mobileCount || 0), 0),
          tablet: dailyStats.reduce((sum, doc) => sum + (doc.tabletCount || 0), 0),
          desktop: dailyStats.reduce((sum, doc) => sum + (doc.desktopCount || 0), 0),
          unknown: 0
        };
        
        // Format daily data for charts
        const dailyScans = dailyStats.map(doc => ({
          date: doc.date.substring(0, 10), // YYYY-MM-DD format
          scanCount: doc.scanCount || 0
        }));
        
        // Try to get additional statistics
        let topRegions = [];
        let languages = [];
        let timeDistribution = [];
        let topWines = [];
        
        try {
          topRegions = await AnalyticsService.getRegionalStats(userId, startDate, endDate);
        } catch (error) {
          console.error('Error fetching regional stats:', error);
        }
        
        try {
          languages = await AnalyticsService.getLanguageStats(userId, startDate, endDate);
        } catch (error) {
          console.error('Error fetching language stats:', error);
        }
        
        try {
          timeDistribution = await AnalyticsService.getHourlyStats(userId, startDate, endDate);
        } catch (error) {
          console.error('Error fetching hourly stats:', error);
        }
        
        try {
          topWines = await AnalyticsService.getTopWines(userId, startDate, endDate);
          topWines = topWines.slice(0, 5); // Limit to top 5
        } catch (error) {
          console.error('Error fetching top wines:', error);
        }
        
        // Get operating system statistics
        let operatingSystems: Array<{name: string, count: number, percentage: number}> = [];
        try {
          // Get raw scan events to extract OS data
          const scanEvents = await adminDatabases.listDocuments(
            ANALYTICS_DB_ID,
            SCAN_EVENTS_COLLECTION_ID,
            [
              Query.equal('wineryId', userId),
              Query.greaterThanEqual('timestamp', startDate),
              Query.lessThanEqual('timestamp', endDate),
              Query.limit(1000) // Reasonable limit
            ]
          );
          
          // Group by OS
          const osMap: Record<string, number> = {};
          for (const event of scanEvents.documents) {
            const os = event.operatingSystem || 'Unknown';
            if (!osMap[os]) {
              osMap[os] = 0;
            }
            osMap[os]++;
          }
          
          // Convert to array and calculate percentages
          operatingSystems = Object.entries(osMap)
            .map(([name, count]) => ({
              name,
              count,
              percentage: Math.round((count / totalScans) * 100)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 OS
        } catch (error) {
          console.error('Error calculating OS statistics:', error);
          // Provide fallback OS data
          operatingSystems = [
            { name: 'Unknown', count: totalScans, percentage: 100 }
          ];
        }
        
        // Return the analytics data
        return NextResponse.json({
          totalScans,
          totalUniqueVisitors,
          scansByDevice,
          operatingSystems,
          scanTrend,
          topWines,
          topRegions,
          languages,
          timeDistribution,
          dailyScans,
          isSampleData: false
        });
      } else {
        // If no real data exists yet, generate sample data
        console.log('No real analytics data found, generating sample data');
        const sampleData = AnalyticsService.generateSampleData(userId, range);
        return NextResponse.json({
          ...sampleData,
          isSampleData: true // Flag to indicate this is sample data
        });
      }
    } catch (error) {
      console.error('Error generating analytics dashboard:', error);
      
      // Fallback to sample data if anything goes wrong
      console.log('Error fetching real data, falling back to sample data');
      const sampleData = AnalyticsService.generateSampleData(userId, range);
      return NextResponse.json({
        ...sampleData,
        isSampleData: true
      });
    }
  } catch (error) {
    console.error('Error in analytics dashboard endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics dashboard' },
      { status: 500 }
    );
  }
}