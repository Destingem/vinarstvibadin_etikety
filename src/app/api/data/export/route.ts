import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import prisma from '@/lib/prisma-client';
import * as AnalyticsService from '@/lib/analytics-service';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      const userId = decoded.userId;
      
      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const exportType = searchParams.get('type') || 'wines'; // Default to wines
      const startDate = searchParams.get('startDate') || '';
      const endDate = searchParams.get('endDate') || '';
      const format = searchParams.get('format') || 'json'; // Default to JSON
      
      // Set default dates if not provided (for analytics data)
      const today = new Date();
      const defaultEndDate = today.toISOString().split('T')[0];
      
      // Default start date is 30 days ago
      const defaultStartDate = new Date(today);
      defaultStartDate.setDate(defaultStartDate.getDate() - 30);
      const defaultStartDateString = defaultStartDate.toISOString().split('T')[0];
      
      // Use provided dates or defaults
      const effectiveStartDate = startDate || defaultStartDateString;
      const effectiveEndDate = endDate || defaultEndDate;
      
      // Determine what to export based on exportType
      if (exportType === 'wines') {
        // Get all wines for this winery
        const wines = await prisma.wine.findMany({
          where: {
            wineryId: userId
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        
        if (format === 'csv') {
          // Return CSV for wines
          const csvContent = generateWineCsv(wines);
          const fileName = `wines-export-${new Date().toISOString().split('T')[0]}.csv`;
          
          return new NextResponse(csvContent, {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename=${fileName}`
            }
          });
        } else {
          // Return JSON for wines
          return NextResponse.json({
            wines: wines,
            exportDate: new Date().toISOString(),
            version: '1.0'
          });
        }
      } else {
        // Analytics data export
        let data = [];
        let csvContent = '';
        let fileName = '';
        
        switch (exportType) {
          case 'analytics-daily':
            data = await AnalyticsService.getDailyScanStats(userId, effectiveStartDate, effectiveEndDate);
            csvContent = generateDailyStatsCsv(data);
            fileName = `daily-stats-${effectiveStartDate}-to-${effectiveEndDate}.csv`;
            break;
            
          case 'analytics-regional':
            data = await AnalyticsService.getRegionalStats(userId, effectiveStartDate, effectiveEndDate);
            csvContent = generateRegionalStatsCsv(data);
            fileName = `regional-stats-${effectiveStartDate}-to-${effectiveEndDate}.csv`;
            break;
            
          case 'analytics-language':
            data = await AnalyticsService.getLanguageStats(userId, effectiveStartDate, effectiveEndDate);
            csvContent = generateLanguageStatsCsv(data);
            fileName = `language-stats-${effectiveStartDate}-to-${effectiveEndDate}.csv`;
            break;
            
          case 'analytics-hourly':
            data = await AnalyticsService.getHourlyStats(userId, effectiveStartDate, effectiveEndDate);
            csvContent = generateHourlyStatsCsv(data);
            fileName = `hourly-stats-${effectiveStartDate}-to-${effectiveEndDate}.csv`;
            break;
            
          case 'analytics-wines':
            data = await AnalyticsService.getTopWines(userId, effectiveStartDate, effectiveEndDate);
            csvContent = generateWineRankingsCsv(data);
            fileName = `wine-rankings-${effectiveStartDate}-to-${effectiveEndDate}.csv`;
            break;
            
          default:
            return NextResponse.json(
              { message: 'Neplatný typ exportu' },
              { status: 400 }
            );
        }
        
        // Return the data in the requested format
        if (format === 'json') {
          return NextResponse.json(data);
        } else {
          // CSV format
          return new NextResponse(csvContent, {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename=${fileName}`
            }
          });
        }
      }
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { message: 'Export dat selhal' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV content for wine data
 */
function generateWineCsv(wines: any[]): string {
  // Define CSV header
  const header = 'ID,Name,Vintage,Batch,Alcohol Content,Region,Subregion,Village,Tract,Created At\n';
  
  // Generate CSV rows
  const rows = wines.map(wine => {
    return [
      wine.id,
      escapeCSVField(wine.name || ''),
      wine.vintage || '',
      escapeCSVField(wine.batch || ''),
      wine.alcoholContent || '',
      escapeCSVField(wine.wineRegion || ''),
      escapeCSVField(wine.wineSubregion || ''),
      escapeCSVField(wine.wineVillage || ''),
      escapeCSVField(wine.wineTract || ''),
      wine.createdAt
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Generate CSV content for daily statistics
 */
function generateDailyStatsCsv(data: any[]): string {
  // Define CSV header
  const header = 'Date,Scan Count,Unique Visitors,Mobile Count,Tablet Count,Desktop Count\n';
  
  // Generate CSV rows
  const rows = data.map(item => {
    return [
      item.date,
      item.scanCount || 0,
      item.uniqueVisitorsEstimate || 0,
      item.mobileCount || 0,
      item.tabletCount || 0,
      item.desktopCount || 0
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Generate CSV content for regional statistics
 */
function generateRegionalStatsCsv(data: any[]): string {
  // Define CSV header
  const header = 'Date,Country Code,Region Code,City,Scan Count\n';
  
  // Generate CSV rows
  const rows = data.map(item => {
    return [
      item.date,
      escapeCSVField(item.countryCode || ''),
      escapeCSVField(item.regionCode || ''),
      escapeCSVField(item.city || ''),
      item.scanCount || 0
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Generate CSV content for language statistics
 */
function generateLanguageStatsCsv(data: any[]): string {
  // Define CSV header
  const header = 'Date,Language,Scan Count\n';
  
  // Generate CSV rows
  const rows = data.map(item => {
    return [
      item.date,
      escapeCSVField(item.language || ''),
      item.scanCount || 0
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Generate CSV content for hourly statistics
 */
function generateHourlyStatsCsv(data: any[]): string {
  // Define CSV header
  const header = 'Date,Hour,Scan Count\n';
  
  // Generate CSV rows
  const rows = data.map(item => {
    return [
      item.date,
      item.hour,
      item.scanCount || 0
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Generate CSV content for wine rankings
 */
function generateWineRankingsCsv(data: any[]): string {
  // Define CSV header
  const header = 'Rank,Wine ID,Wine Name,Scan Count\n';
  
  // Generate CSV rows
  const rows = data.map(item => {
    return [
      item.rank,
      item.wineId,
      escapeCSVField(item.wineName || ''),
      item.scanCount || 0
    ].join(',');
  }).join('\n');
  
  return header + rows;
}

/**
 * Escape a field for CSV output (handle commas, quotes, etc.)
 */
function escapeCSVField(field: string): string {
  // If the field contains commas, quotes, or newlines, wrap it in quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Double up any quotes in the field
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}