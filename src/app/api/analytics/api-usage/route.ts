import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { adminDatabases, API_DB_ID, Query } from '@/lib/appwrite-client';
import { API_USAGE_COLLECTION_ID } from '@/lib/api-middleware';

// GET /api/analytics/api-usage - Get API usage statistics for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30days';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    try {
      // Get usage data for the user
      const usageResponse = await adminDatabases.listDocuments(
        API_DB_ID,
        API_USAGE_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('timestamp', startDate.toISOString()),
          Query.lessThanEqual('timestamp', endDate.toISOString()),
          Query.orderDesc('timestamp'),
          Query.limit(1000) // Limit to prevent large responses
        ]
      );
      
      const usageData = usageResponse.documents;
      
      // Calculate statistics
      const totalRequests = usageData.length;
      const successfulRequests = usageData.filter(req => req.statusCode >= 200 && req.statusCode < 400).length;
      const errorRequests = usageData.filter(req => req.statusCode >= 400).length;
      const averageResponseTime = usageData.length > 0 
        ? usageData.reduce((sum, req) => sum + req.responseTime, 0) / usageData.length 
        : 0;
      
      // Group by endpoint
      const endpointStats = usageData.reduce((acc, req) => {
        const endpoint = req.endpoint;
        if (!acc[endpoint]) {
          acc[endpoint] = {
            endpoint,
            count: 0,
            successCount: 0,
            errorCount: 0,
            averageResponseTime: 0,
            totalResponseTime: 0
          };
        }
        acc[endpoint].count++;
        acc[endpoint].totalResponseTime += req.responseTime;
        acc[endpoint].averageResponseTime = acc[endpoint].totalResponseTime / acc[endpoint].count;
        
        if (req.statusCode >= 200 && req.statusCode < 400) {
          acc[endpoint].successCount++;
        } else {
          acc[endpoint].errorCount++;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      // Group by date for timeline
      const dailyStats = usageData.reduce((acc, req) => {
        const date = req.date;
        if (!acc[date]) {
          acc[date] = {
            date,
            count: 0,
            successCount: 0,
            errorCount: 0
          };
        }
        acc[date].count++;
        
        if (req.statusCode >= 200 && req.statusCode < 400) {
          acc[date].successCount++;
        } else {
          acc[date].errorCount++;
        }
        
        return acc;
      }, {} as Record<string, any>);
      
      // Group by hour for hourly distribution
      const hourlyStats = usageData.reduce((acc, req) => {
        const hour = req.hour;
        if (!acc[hour]) {
          acc[hour] = 0;
        }
        acc[hour]++;
        return acc;
      }, {} as Record<number, number>);
      
      // Convert to arrays and sort
      const endpointStatsArray = Object.values(endpointStats).sort((a: any, b: any) => b.count - a.count);
      const dailyStatsArray = Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));
      
      return NextResponse.json({
        summary: {
          totalRequests,
          successfulRequests,
          errorRequests,
          successRate: totalRequests > 0 ? (successfulRequests / totalRequests * 100).toFixed(2) : '0',
          averageResponseTime: Math.round(averageResponseTime),
          range
        },
        endpoints: endpointStatsArray,
        timeline: dailyStatsArray,
        hourlyDistribution: hourlyStats,
        recentRequests: usageData.slice(0, 20) // Last 20 requests
      });
    } catch (error) {
      console.error('Error getting usage data:', error);
      // If collection doesn't exist or no data, return empty stats
      return NextResponse.json({
        summary: {
          totalRequests: 0,
          successfulRequests: 0,
          errorRequests: 0,
          successRate: '0',
          averageResponseTime: 0,
          range
        },
        endpoints: [],
        timeline: [],
        hourlyDistribution: {},
        recentRequests: []
      });
    }
  } catch (error) {
    console.error('Error getting API usage statistics:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání statistik API' },
      { status: 500 }
    );
  }
}