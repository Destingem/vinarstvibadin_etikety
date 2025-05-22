import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, ID, Query, ANALYTICS_DB_ID } from '@/lib/appwrite-client';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';

/**
 * Normalize a date to the start of the day
 */
function normalizeDate(date: Date): string {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).toISOString();
}

/**
 * Get the start and end time for a given day
 */
function getDayTimeRange(dateStr: string): { startTime: string; endTime: string } {
  const date = new Date(dateStr);
  const startTime = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  ).toISOString();
  
  const endDate = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  );
  const endTime = endDate.toISOString();
  
  return { startTime, endTime };
}

/**
 * Group scan events by device type
 */
function groupByDeviceType(events: any[]): { 
  mobileCount: number; 
  tabletCount: number; 
  desktopCount: number;
  unknownCount: number;
} {
  const result = {
    mobileCount: 0,
    tabletCount: 0,
    desktopCount: 0,
    unknownCount: 0
  };
  
  for (const event of events) {
    const deviceType = event.deviceType || 'UNKNOWN';
    
    if (deviceType === 'MOBILE') result.mobileCount++;
    else if (deviceType === 'TABLET') result.tabletCount++;
    else if (deviceType === 'DESKTOP') result.desktopCount++;
    else result.unknownCount++;
  }
  
  return result;
}

/**
 * Group scan events by language
 */
function groupByLanguage(events: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  for (const event of events) {
    const language = event.languageUsed || event.browserLanguage?.substring(0, 2) || 'unknown';
    const languageKey = language.substring(0, 2).toLowerCase(); // Normalize to 2-letter code
    
    if (!result[languageKey]) {
      result[languageKey] = 0;
    }
    
    result[languageKey]++;
  }
  
  return result;
}

/**
 * Group scan events by hour of day
 */
function groupByHour(events: any[]): Record<number, number> {
  const result: Record<number, number> = {};
  
  // Initialize all hours to 0
  for (let i = 0; i < 24; i++) {
    result[i] = 0;
  }
  
  for (const event of events) {
    const timestamp = new Date(event.timestamp);
    const hour = timestamp.getUTCHours();
    result[hour]++;
  }
  
  return result;
}

/**
 * Group scan events by region
 */
function groupByRegion(events: any[]): Record<string, { 
  total: number; 
  regions: Record<string, { 
    total: number; 
    cities: Record<string, number> 
  }> 
}> {
  const result: Record<string, { 
    total: number; 
    regions: Record<string, { 
      total: number; 
      cities: Record<string, number> 
    }> 
  }> = {};
  
  for (const event of events) {
    const countryCode = event.countryCode || 'unknown';
    const regionCode = event.regionCode || 'unknown';
    const city = event.city || 'unknown';
    
    // Initialize country if needed
    if (!result[countryCode]) {
      result[countryCode] = { total: 0, regions: {} };
    }
    
    // Initialize region if needed
    if (!result[countryCode].regions[regionCode]) {
      result[countryCode].regions[regionCode] = { total: 0, cities: {} };
    }
    
    // Initialize city if needed
    if (!result[countryCode].regions[regionCode].cities[city]) {
      result[countryCode].regions[regionCode].cities[city] = 0;
    }
    
    // Increment counts
    result[countryCode].total++;
    result[countryCode].regions[regionCode].total++;
    result[countryCode].regions[regionCode].cities[city]++;
  }
  
  return result;
}

/**
 * Calculate wine popularity rankings
 */
function calculateWineRankings(events: any[]): Record<string, { count: number; name: string }> {
  const wineScans: Record<string, { count: number; name: string }> = {};
  
  for (const event of events) {
    const wineId = event.wineId;
    const wineName = event.wineName || 'Unknown Wine';
    
    if (!wineScans[wineId]) {
      wineScans[wineId] = { count: 0, name: wineName };
    }
    
    wineScans[wineId].count++;
  }
  
  return wineScans;
}

/**
 * Estimate the number of unique visitors based on IP addresses
 */
function estimateUniqueVisitors(events: any[]): number {
  const uniqueIps = new Set();
  
  for (const event of events) {
    if (event.ipAddress) {
      uniqueIps.add(event.ipAddress);
    }
  }
  
  return uniqueIps.size;
}

/**
 * Aggregate scan events for a specific day
 */
async function aggregateDailyStats(dateStr: string) {
  try {
    console.log(`Aggregating statistics for date: ${dateStr}`);
    
    // Get time range for the specified day
    const { startTime, endTime } = getDayTimeRange(dateStr);
    
    // Fetch all scan events for the specified day
    const eventsResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      [
        Query.greaterThanEqual('timestamp', startTime),
        Query.lessThan('timestamp', endTime),
        Query.limit(5000) // Limit to 5000 records per day
      ]
    );
    
    const events = eventsResponse.documents;
    console.log(`Found ${events.length} scan events for date: ${dateStr}`);
    
    if (events.length === 0) {
      return { success: true, message: 'No events to aggregate' };
    }
    
    // Group events by winery
    const wineriesMap: Record<string, any[]> = {};
    for (const event of events) {
      const wineryId = event.wineryId;
      
      if (!wineriesMap[wineryId]) {
        wineriesMap[wineryId] = [];
      }
      
      wineriesMap[wineryId].push(event);
    }
    
    // Process each winery's data
    for (const [wineryId, wineryEvents] of Object.entries(wineriesMap)) {
      await processWineryData(dateStr, wineryId, wineryEvents);
    }
    
    return { success: true, message: `Aggregated data for ${Object.keys(wineriesMap).length} wineries` };
  } catch (error) {
    console.error('Error aggregating daily stats:', error);
    return { success: false, error: 'Failed to aggregate daily stats' };
  }
}

/**
 * Process and store aggregated data for a specific winery
 */
async function processWineryData(dateStr: string, wineryId: string, events: any[]) {
  try {
    // Get a sample winery name from events
    const wineryName = events[0]?.wineryName || 'Unknown Winery';
    console.log(`Processing ${events.length} events for winery: ${wineryName} (${wineryId})`);
    
    // 1. Create/update winery-level daily stats
    const deviceCounts = groupByDeviceType(events);
    const uniqueVisitors = estimateUniqueVisitors(events);
    
    // Check if there's an existing daily stats record for this winery
    const existingDailyStats = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('wineryId', wineryId),
        Query.isNull('wineId'),
        Query.limit(1)
      ]
    );
    
    if (existingDailyStats.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        DAILY_SCAN_STATS_COLLECTION_ID,
        existingDailyStats.documents[0].$id,
        {
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueVisitors,
          mobileCount: deviceCounts.mobileCount,
          tabletCount: deviceCounts.tabletCount,
          desktopCount: deviceCounts.desktopCount
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        DAILY_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          wineryId: wineryId,
          wineId: null, // null for winery-level aggregates
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueVisitors,
          mobileCount: deviceCounts.mobileCount,
          tabletCount: deviceCounts.tabletCount,
          desktopCount: deviceCounts.desktopCount
        }
      );
    }
    
    // 2. Create/update wine-level daily stats
    const wineEventsMap: Record<string, any[]> = {};
    for (const event of events) {
      const wineId = event.wineId;
      
      if (!wineEventsMap[wineId]) {
        wineEventsMap[wineId] = [];
      }
      
      wineEventsMap[wineId].push(event);
    }
    
    // Process each wine's data
    for (const [wineId, wineEvents] of Object.entries(wineEventsMap)) {
      await processWineData(dateStr, wineryId, wineId, wineEvents);
    }
    
    // 3. Process language statistics
    const languageStats = groupByLanguage(events);
    for (const [language, count] of Object.entries(languageStats)) {
      await updateLanguageStats(dateStr, wineryId, null, language, count);
    }
    
    // 4. Process hourly statistics
    const hourlyStats = groupByHour(events);
    for (const [hourStr, count] of Object.entries(hourlyStats)) {
      if (count > 0) {
        const hour = parseInt(hourStr, 10);
        await updateHourlyStats(dateStr, hour, wineryId, null, count);
      }
    }
    
    // 5. Process regional statistics
    const regionalStats = groupByRegion(events);
    for (const [countryCode, countryData] of Object.entries(regionalStats)) {
      for (const [regionCode, regionData] of Object.entries(countryData.regions)) {
        for (const [city, cityCount] of Object.entries(regionData.cities)) {
          await updateRegionalStats(dateStr, wineryId, null, countryCode, regionCode, city, cityCount);
        }
      }
    }
    
    // 6. Calculate wine popularity rankings
    const wineRankings = calculateWineRankings(events);
    
    // Convert to array and sort by scan count
    const rankingsArray = Object.entries(wineRankings).map(([wineId, data]) => ({
      wineId,
      wineName: data.name,
      scanCount: data.count,
      rank: 0 // Will be set below
    }));
    
    // Sort by scan count (descending)
    rankingsArray.sort((a, b) => b.scanCount - a.scanCount);
    
    // Set ranks
    rankingsArray.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    // Store rankings
    await updateWineRankings(dateStr, 'daily', wineryId, rankingsArray);
    
    console.log(`Successfully processed data for winery: ${wineryName}`);
    return true;
  } catch (error) {
    console.error(`Error processing winery data for ${wineryId}:`, error);
    return false;
  }
}

/**
 * Process and store aggregated data for a specific wine
 */
async function processWineData(dateStr: string, wineryId: string, wineId: string, events: any[]) {
  try {
    // Get a sample wine name from events
    const wineName = events[0]?.wineName || 'Unknown Wine';
    console.log(`Processing ${events.length} events for wine: ${wineName} (${wineId})`);
    
    // Calculate device counts
    const deviceCounts = groupByDeviceType(events);
    const uniqueVisitors = estimateUniqueVisitors(events);
    
    // Check if there's an existing daily stats record for this wine
    const existingDailyStats = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('wineryId', wineryId),
        Query.equal('wineId', wineId),
        Query.limit(1)
      ]
    );
    
    if (existingDailyStats.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        DAILY_SCAN_STATS_COLLECTION_ID,
        existingDailyStats.documents[0].$id,
        {
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueVisitors,
          mobileCount: deviceCounts.mobileCount,
          tabletCount: deviceCounts.tabletCount,
          desktopCount: deviceCounts.desktopCount
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        DAILY_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          wineryId: wineryId,
          wineId: wineId,
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueVisitors,
          mobileCount: deviceCounts.mobileCount,
          tabletCount: deviceCounts.tabletCount,
          desktopCount: deviceCounts.desktopCount
        }
      );
    }
    
    // Process language statistics
    const languageStats = groupByLanguage(events);
    for (const [language, count] of Object.entries(languageStats)) {
      await updateLanguageStats(dateStr, wineryId, wineId, language, count);
    }
    
    // Process hourly statistics
    const hourlyStats = groupByHour(events);
    for (const [hourStr, count] of Object.entries(hourlyStats)) {
      if (count > 0) {
        const hour = parseInt(hourStr, 10);
        await updateHourlyStats(dateStr, hour, wineryId, wineId, count);
      }
    }
    
    // Process regional statistics
    const regionalStats = groupByRegion(events);
    for (const [countryCode, countryData] of Object.entries(regionalStats)) {
      for (const [regionCode, regionData] of Object.entries(countryData.regions)) {
        for (const [city, cityCount] of Object.entries(regionData.cities)) {
          await updateRegionalStats(dateStr, wineryId, wineId, countryCode, regionCode, city, cityCount);
        }
      }
    }
    
    console.log(`Successfully processed data for wine: ${wineName}`);
    return true;
  } catch (error) {
    console.error(`Error processing wine data for ${wineId}:`, error);
    return false;
  }
}

/**
 * Update language statistics
 */
async function updateLanguageStats(
  dateStr: string, 
  wineryId: string, 
  wineId: string | null, 
  language: string, 
  count: number
) {
  try {
    // Check if there's an existing record
    const existingStats = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      LANGUAGE_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('wineryId', wineryId),
        wineId ? Query.equal('wineId', wineId) : Query.isNull('wineId'),
        Query.equal('language', language),
        Query.limit(1)
      ]
    );
    
    if (existingStats.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        LANGUAGE_SCAN_STATS_COLLECTION_ID,
        existingStats.documents[0].$id,
        {
          scanCount: count
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        LANGUAGE_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          wineryId: wineryId,
          wineId: wineId,
          language: language,
          scanCount: count
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating language stats:', error);
    return false;
  }
}

/**
 * Update hourly statistics
 */
async function updateHourlyStats(
  dateStr: string, 
  hour: number, 
  wineryId: string, 
  wineId: string | null, 
  count: number
) {
  try {
    // Check if there's an existing record
    const existingStats = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      HOURLY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('hour', hour),
        Query.equal('wineryId', wineryId),
        wineId ? Query.equal('wineId', wineId) : Query.isNull('wineId'),
        Query.limit(1)
      ]
    );
    
    if (existingStats.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        HOURLY_SCAN_STATS_COLLECTION_ID,
        existingStats.documents[0].$id,
        {
          scanCount: count
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        HOURLY_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          hour: hour,
          wineryId: wineryId,
          wineId: wineId,
          scanCount: count
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating hourly stats:', error);
    return false;
  }
}

/**
 * Update regional statistics
 */
async function updateRegionalStats(
  dateStr: string, 
  wineryId: string, 
  wineId: string | null, 
  countryCode: string,
  regionCode: string,
  city: string,
  count: number
) {
  try {
    // Check if there's an existing record
    const existingStats = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      REGIONAL_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('wineryId', wineryId),
        wineId ? Query.equal('wineId', wineId) : Query.isNull('wineId'),
        Query.equal('countryCode', countryCode),
        Query.equal('regionCode', regionCode),
        Query.equal('city', city),
        Query.limit(1)
      ]
    );
    
    if (existingStats.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        REGIONAL_SCAN_STATS_COLLECTION_ID,
        existingStats.documents[0].$id,
        {
          scanCount: count
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        REGIONAL_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          wineryId: wineryId,
          wineId: wineId,
          countryCode: countryCode,
          regionCode: regionCode,
          city: city,
          scanCount: count
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating regional stats:', error);
    return false;
  }
}

/**
 * Update wine popularity rankings
 */
async function updateWineRankings(
  dateStr: string, 
  periodType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  wineryId: string, 
  rankings: Array<{ wineId: string; wineName: string; scanCount: number; rank: number }>
) {
  try {
    // Convert rankings to array of stringified objects for Appwrite storage
    // Since Appwrite stores this as a string array instead of JSON
    const rankingsAsStringArray = rankings.map(item => JSON.stringify(item));
    
    // Check if there's an existing record
    const existingRankings = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      WINE_POPULARITY_RANKINGS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('periodType', periodType),
        Query.equal('wineryId', wineryId),
        Query.limit(1)
      ]
    );
    
    if (existingRankings.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        WINE_POPULARITY_RANKINGS_COLLECTION_ID,
        existingRankings.documents[0].$id,
        {
          rankings: rankingsAsStringArray
        }
      );
    } else {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        WINE_POPULARITY_RANKINGS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          periodType: periodType,
          wineryId: wineryId,
          rankings: rankingsAsStringArray
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error updating wine rankings:', error);
    return false;
  }
}

/**
 * API endpoint for manually triggering data aggregation for a specific date
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request data
    const data = await request.json();
    
    // Get the date to aggregate (default to yesterday)
    let dateToAggregate = data.date;
    
    if (!dateToAggregate) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      dateToAggregate = normalizeDate(yesterday);
    }
    
    // Run the aggregation
    const result = await aggregateDailyStats(dateToAggregate);
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in aggregation endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to aggregate analytics data' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint for checking the status of the aggregation service
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'active',
      message: 'Analytics aggregation service is running. Use POST with a date parameter to trigger aggregation.' 
    },
    { status: 200 }
  );
}