import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, ID, ANALYTICS_DB_ID, Query } from '@/lib/appwrite-client';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';

/**
 * Process raw scan events into daily statistics
 */
async function processScanEvents() {
  try {
    // Get all scan events (limited to latest 100 for performance)
    const scanEventsResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      [
        Query.orderDesc('timestamp'),
        Query.limit(100)
      ]
    );
    
    const scanEvents = scanEventsResponse.documents || [];
    console.log(`Processing ${scanEvents.length} scan events`);
    
    if (scanEvents.length === 0) {
      return { success: true, message: 'No scan events to process' };
    }
    
    // Group events by winery, date, and wine
    const wineryDateGroups: Record<string, Record<string, Record<string, any[]>>> = {};
    
    for (const event of scanEvents) {
      const timestamp = new Date(event.timestamp);
      const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const wineryId = event.wineryId;
      const wineId = event.wineId;
      
      // Initialize groups if they don't exist
      if (!wineryDateGroups[wineryId]) {
        wineryDateGroups[wineryId] = {};
      }
      
      if (!wineryDateGroups[wineryId][dateStr]) {
        wineryDateGroups[wineryId][dateStr] = {};
      }
      
      if (!wineryDateGroups[wineryId][dateStr][wineId]) {
        wineryDateGroups[wineryId][dateStr][wineId] = [];
      }
      
      // Add event to its group
      wineryDateGroups[wineryId][dateStr][wineId].push(event);
    }
    
    // Process each winery's data
    for (const [wineryId, dateGroups] of Object.entries(wineryDateGroups)) {
      for (const [dateStr, wineGroups] of Object.entries(dateGroups)) {
        // First, calculate winery-level statistics
        const allWineryEvents = Object.values(wineGroups).flat();
        
        // Create daily scan stats for winery
        await createOrUpdateDailyScanStats(dateStr, wineryId, null, allWineryEvents);
        
        // Create regional stats for winery
        await createRegionalStats(dateStr, wineryId, null, allWineryEvents);
        
        // Create language stats for winery
        await createLanguageStats(dateStr, wineryId, null, allWineryEvents);
        
        // Create hourly stats for winery
        await createHourlyStats(dateStr, wineryId, null, allWineryEvents);
        
        // Calculate wine rankings
        const wineRankings = calculateWineRankings(wineryId, allWineryEvents);
        await createWineRankings(dateStr, wineryId, wineRankings);
        
        // Then, calculate wine-level statistics for each wine
        for (const [wineId, wineEvents] of Object.entries(wineGroups)) {
          // Create daily scan stats for wine
          await createOrUpdateDailyScanStats(dateStr, wineryId, wineId, wineEvents);
          
          // Create regional stats for wine
          await createRegionalStats(dateStr, wineryId, wineId, wineEvents);
          
          // Create language stats for wine
          await createLanguageStats(dateStr, wineryId, wineId, wineEvents);
          
          // Create hourly stats for wine
          await createHourlyStats(dateStr, wineryId, wineId, wineEvents);
        }
      }
    }
    
    return { 
      success: true, 
      message: `Processed events for ${Object.keys(wineryDateGroups).length} wineries` 
    };
  } catch (error) {
    console.error('Error processing scan events:', error);
    return { success: false, error: 'Failed to process scan events' };
  }
}

/**
 * Create or update daily scan statistics
 */
async function createOrUpdateDailyScanStats(
  dateStr: string,
  wineryId: string,
  wineId: string | null,
  events: any[]
) {
  try {
    // Count device types
    const deviceCounts = {
      mobile: 0,
      tablet: 0,
      desktop: 0,
      unknown: 0
    };
    
    for (const event of events) {
      const type = event.deviceType?.toUpperCase() || 'UNKNOWN';
      if (type === 'MOBILE') deviceCounts.mobile++;
      else if (type === 'TABLET') deviceCounts.tablet++;
      else if (type === 'DESKTOP') deviceCounts.desktop++;
      else deviceCounts.unknown++;
    }
    
    // Estimate unique visitors by counting unique IP addresses
    const uniqueIPs = new Set();
    for (const event of events) {
      if (event.ipAddress) {
        uniqueIPs.add(event.ipAddress);
      }
    }
    
    // Check if there's an existing record
    const existingResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('wineryId', wineryId),
        wineId ? Query.equal('wineId', wineId) : Query.isNull('wineId'),
        Query.limit(1)
      ]
    );
    
    if (existingResponse.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        DAILY_SCAN_STATS_COLLECTION_ID,
        existingResponse.documents[0].$id,
        {
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueIPs.size,
          mobileCount: deviceCounts.mobile,
          tabletCount: deviceCounts.tablet,
          desktopCount: deviceCounts.desktop
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
          wineryId,
          wineId,
          scanCount: events.length,
          uniqueVisitorsEstimate: uniqueIPs.size,
          mobileCount: deviceCounts.mobile,
          tabletCount: deviceCounts.tablet,
          desktopCount: deviceCounts.desktop
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error creating daily scan stats:', error);
    return false;
  }
}

/**
 * Create or update regional statistics
 */
async function createRegionalStats(
  dateStr: string,
  wineryId: string,
  wineId: string | null,
  events: any[]
) {
  try {
    // Group by regions
    const regions: Record<string, Record<string, Record<string, number>>> = {};
    
    for (const event of events) {
      const countryCode = event.countryCode || 'unknown';
      const regionCode = event.regionCode || 'unknown';
      const city = event.city || 'unknown';
      
      if (!regions[countryCode]) {
        regions[countryCode] = {};
      }
      
      if (!regions[countryCode][regionCode]) {
        regions[countryCode][regionCode] = {};
      }
      
      if (!regions[countryCode][regionCode][city]) {
        regions[countryCode][regionCode][city] = 0;
      }
      
      regions[countryCode][regionCode][city]++;
    }
    
    // Create records for each region
    for (const [countryCode, countryData] of Object.entries(regions)) {
      for (const [regionCode, regionData] of Object.entries(countryData)) {
        for (const [city, count] of Object.entries(regionData)) {
          // Check if there's an existing record
          const existingResponse = await adminDatabases.listDocuments(
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
          
          if (existingResponse.documents.length > 0) {
            // Update existing record
            await adminDatabases.updateDocument(
              ANALYTICS_DB_ID,
              REGIONAL_SCAN_STATS_COLLECTION_ID,
              existingResponse.documents[0].$id,
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
                wineryId,
                wineId,
                countryCode,
                regionCode,
                city,
                scanCount: count
              }
            );
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating regional stats:', error);
    return false;
  }
}

/**
 * Create or update language statistics
 */
async function createLanguageStats(
  dateStr: string,
  wineryId: string,
  wineId: string | null,
  events: any[]
) {
  try {
    // Group by language
    const languages: Record<string, number> = {};
    
    for (const event of events) {
      let language = 'unknown';
      
      // Try to get language from languageUsed, then from browserLanguage
      if (event.languageUsed) {
        language = event.languageUsed.split('-')[0].toLowerCase(); // Convert "en-US" to "en"
      } else if (event.browserLanguage) {
        language = event.browserLanguage.split('-')[0].toLowerCase();
      }
      
      if (!languages[language]) {
        languages[language] = 0;
      }
      
      languages[language]++;
    }
    
    // Delete all existing language records for this date/winery/wine combination
    // This ensures we don't have duplicate entries for the same language
    try {
      const existingRecords = await adminDatabases.listDocuments(
        ANALYTICS_DB_ID,
        LANGUAGE_SCAN_STATS_COLLECTION_ID,
        [
          Query.equal('date', dateStr),
          Query.equal('wineryId', wineryId),
          wineId ? Query.equal('wineId', wineId) : Query.isNull('wineId'),
          Query.limit(100)
        ]
      );
      
      // Delete existing records
      for (const record of existingRecords.documents) {
        await adminDatabases.deleteDocument(
          ANALYTICS_DB_ID,
          LANGUAGE_SCAN_STATS_COLLECTION_ID,
          record.$id
        );
      }
    } catch (deleteError) {
      console.error('Error deleting existing language records:', deleteError);
      // Continue with creating new records
    }
    
    // Create fresh records for each language
    for (const [language, count] of Object.entries(languages)) {
      // Create new record
      await adminDatabases.createDocument(
        ANALYTICS_DB_ID,
        LANGUAGE_SCAN_STATS_COLLECTION_ID,
        ID.unique(),
        {
          date: dateStr,
          wineryId,
          wineId,
          language,
          scanCount: count
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error creating language stats:', error);
    return false;
  }
}

/**
 * Create or update hourly statistics
 */
async function createHourlyStats(
  dateStr: string,
  wineryId: string,
  wineId: string | null,
  events: any[]
) {
  try {
    // Group by hour
    const hours: Record<number, number> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }
    
    for (const event of events) {
      const timestamp = new Date(event.timestamp);
      const hour = timestamp.getHours();
      hours[hour]++;
    }
    
    // Create records for each hour
    for (const [hourStr, count] of Object.entries(hours)) {
      // Skip hours with no events
      if (count === 0) continue;
      
      const hour = parseInt(hourStr, 10);
      
      // Check if there's an existing record
      const existingResponse = await adminDatabases.listDocuments(
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
      
      if (existingResponse.documents.length > 0) {
        // Update existing record
        await adminDatabases.updateDocument(
          ANALYTICS_DB_ID,
          HOURLY_SCAN_STATS_COLLECTION_ID,
          existingResponse.documents[0].$id,
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
            hour,
            wineryId,
            wineId,
            scanCount: count
          }
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error creating hourly stats:', error);
    return false;
  }
}

/**
 * Calculate wine popularity rankings
 */
function calculateWineRankings(wineryId: string, events: any[]) {
  // Group by wine
  const wineScans: Record<string, { 
    count: number; 
    name: string; 
    batch?: string;
    vintage?: string;
  }> = {};
  
  for (const event of events) {
    const wineId = event.wineId;
    const wineName = event.wineName || 'Unknown Wine';
    const wineBatch = event.wineBatch || '';
    const wineVintage = event.wineVintage || '';
    
    if (!wineScans[wineId]) {
      wineScans[wineId] = { 
        count: 0, 
        name: wineName,
        batch: wineBatch,
        vintage: wineVintage
      };
    }
    
    wineScans[wineId].count++;
  }
  
  // Convert to array and sort
  const rankings = Object.entries(wineScans)
    .map(([wineId, data]) => ({
      wineId,
      wineName: data.name,
      scanCount: data.count,
      wineBatch: data.batch,
      wineVintage: data.vintage,
      rank: 0 // Will be set below
    }))
    .sort((a, b) => b.scanCount - a.scanCount);
  
  // Assign ranks
  rankings.forEach((wine, index) => {
    wine.rank = index + 1;
  });
  
  return rankings;
}

/**
 * Create or update wine popularity rankings
 */
async function createWineRankings(
  dateStr: string,
  wineryId: string,
  rankings: any[]
) {
  try {
    if (rankings.length === 0) return true;
    
    // Convert rankings to strings for storage
    const rankingsAsStrings = rankings.map(item => JSON.stringify(item));
    
    // Check if there's an existing record
    const existingResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      WINE_POPULARITY_RANKINGS_COLLECTION_ID,
      [
        Query.equal('date', dateStr),
        Query.equal('periodType', 'daily'),
        Query.equal('wineryId', wineryId),
        Query.limit(1)
      ]
    );
    
    if (existingResponse.documents.length > 0) {
      // Update existing record
      await adminDatabases.updateDocument(
        ANALYTICS_DB_ID,
        WINE_POPULARITY_RANKINGS_COLLECTION_ID,
        existingResponse.documents[0].$id,
        {
          rankings: rankingsAsStrings
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
          periodType: 'daily',
          wineryId,
          rankings: rankingsAsStrings
        }
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error creating wine rankings:', error);
    return false;
  }
}

/**
 * API endpoint to process raw scan events
 */
export async function POST(request: NextRequest) {
  try {
    // Process all scan events
    const result = await processScanEvents();
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in process-events endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process scan events' },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to check the status of the processor
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'active',
      message: 'Analytics processing service is running. Use POST to trigger processing.' 
    },
    { status: 200 }
  );
}