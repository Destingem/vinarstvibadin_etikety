import { NextRequest, NextResponse } from 'next/server';
import { getWinesByUserId } from '@/lib/appwrite-client';
import * as AnalyticsService from '@/lib/analytics-service';
import { getRequestSessionUser } from '@/server/auth/session';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }

    const userId = sessionUser.id;
    const searchParams = request.nextUrl.searchParams;
    const exportType = searchParams.get('type') || 'wines';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const format = searchParams.get('format') || 'json';

    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];

    const defaultStartDate = new Date(today);
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    const defaultStartDateString = defaultStartDate.toISOString().split('T')[0];

    const effectiveStartDate = startDate || defaultStartDateString;
    const effectiveEndDate = endDate || defaultEndDate;

    if (exportType === 'wines') {
      const wines = await getWinesByUserId(userId);

      if (format === 'csv') {
        const csvContent = generateWineCsv(wines);
        const fileName = `wines-export-${new Date().toISOString().split('T')[0]}.csv`;

        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename=${fileName}`,
          },
        });
      }

      return NextResponse.json({
        wines,
        exportDate: new Date().toISOString(),
        version: '1.0',
      });
    }

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

    if (format === 'json') {
      return NextResponse.json(data);
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${fileName}`,
      },
    });
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
      wine.$id,
      escapeCSVField(wine.name || ''),
      wine.vintage || '',
      escapeCSVField(wine.batch || ''),
      wine.alcoholContent || '',
      escapeCSVField(wine.wineRegion || ''),
      escapeCSVField(wine.wineSubregion || ''),
      escapeCSVField(wine.wineVillage || ''),
      escapeCSVField(wine.wineTract || ''),
      wine.$createdAt
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
