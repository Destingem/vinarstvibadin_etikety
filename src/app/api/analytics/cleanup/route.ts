import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, ANALYTICS_DB_ID, Query } from '@/lib/appwrite-client';
import { env } from '@/lib/env';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';

/**
 * GDPR-compliant data retention policy:
 * - Raw scan events: Keep for 12 months
 * - Aggregated statistics: Keep for 3 years (anonymized)
 * - Wine popularity rankings: Keep indefinitely (anonymized)
 */

/**
 * Calculate date boundaries for data retention
 */
function getRetentionDates() {
  const now = new Date();
  
  // Raw events: 12 months
  const rawDataCutoff = new Date(now);
  rawDataCutoff.setMonth(rawDataCutoff.getMonth() - 12);
  
  // Aggregated data: 3 years
  const aggregatedDataCutoff = new Date(now);
  aggregatedDataCutoff.setFullYear(aggregatedDataCutoff.getFullYear() - 3);
  
  return {
    rawDataCutoff: rawDataCutoff.toISOString().split('T')[0], // YYYY-MM-DD
    aggregatedDataCutoff: aggregatedDataCutoff.toISOString().split('T')[0] // YYYY-MM-DD
  };
}

/**
 * Clean up old raw scan events (older than 12 months)
 */
async function cleanupRawScanEvents(cutoffDate: string): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors = 0;
  
  try {
    console.log(`Cleaning up raw scan events older than ${cutoffDate}`);
    
    // Query for old events in batches
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await adminDatabases.listDocuments(
          ANALYTICS_DB_ID,
          SCAN_EVENTS_COLLECTION_ID,
          [
            Query.lessThan('date', cutoffDate),
            Query.limit(100) // Process in batches of 100
          ]
        );
        
        if (response.documents.length === 0) {
          hasMore = false;
          break;
        }
        
        // Delete each document
        for (const doc of response.documents) {
          try {
            await adminDatabases.deleteDocument(
              ANALYTICS_DB_ID,
              SCAN_EVENTS_COLLECTION_ID,
              doc.$id
            );
            deleted++;
          } catch (deleteError) {
            console.error(`Error deleting scan event ${doc.$id}:`, deleteError);
            errors++;
          }
        }
        
        // If we got fewer than the limit, we're done
        if (response.documents.length < 100) {
          hasMore = false;
        }
        
        // Add a small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (queryError) {
        console.error('Error querying scan events for cleanup:', queryError);
        errors++;
        hasMore = false;
      }
    }
    
    console.log(`Raw scan events cleanup completed: ${deleted} deleted, ${errors} errors`);
    
  } catch (error) {
    console.error('Error in raw scan events cleanup:', error);
    errors++;
  }
  
  return { deleted, errors };
}

/**
 * Clean up old aggregated statistics (older than 3 years)
 */
async function cleanupAggregatedStats(cutoffDate: string): Promise<{ deleted: number; errors: number }> {
  let totalDeleted = 0;
  let totalErrors = 0;
  
  const collections = [
    DAILY_SCAN_STATS_COLLECTION_ID,
    REGIONAL_SCAN_STATS_COLLECTION_ID,
    LANGUAGE_SCAN_STATS_COLLECTION_ID,
    HOURLY_SCAN_STATS_COLLECTION_ID
  ];
  
  for (const collectionId of collections) {
    try {
      console.log(`Cleaning up ${collectionId} older than ${cutoffDate}`);
      
      let hasMore = true;
      let deleted = 0;
      let errors = 0;
      
      while (hasMore) {
        try {
          const response = await adminDatabases.listDocuments(
            ANALYTICS_DB_ID,
            collectionId,
            [
              Query.lessThan('date', cutoffDate),
              Query.limit(100)
            ]
          );
          
          if (response.documents.length === 0) {
            hasMore = false;
            break;
          }
          
          // Delete each document
          for (const doc of response.documents) {
            try {
              await adminDatabases.deleteDocument(
                ANALYTICS_DB_ID,
                collectionId,
                doc.$id
              );
              deleted++;
            } catch (deleteError) {
              console.error(`Error deleting ${collectionId} document ${doc.$id}:`, deleteError);
              errors++;
            }
          }
          
          if (response.documents.length < 100) {
            hasMore = false;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (queryError) {
          console.error(`Error querying ${collectionId} for cleanup:`, queryError);
          errors++;
          hasMore = false;
        }
      }
      
      console.log(`${collectionId} cleanup completed: ${deleted} deleted, ${errors} errors`);
      totalDeleted += deleted;
      totalErrors += errors;
      
    } catch (error) {
      console.error(`Error in ${collectionId} cleanup:`, error);
      totalErrors++;
    }
  }
  
  return { deleted: totalDeleted, errors: totalErrors };
}

/**
 * Clean up old wine popularity rankings (older than 3 years)
 * Note: We keep rankings longer as they're useful for historical analysis
 */
async function cleanupWineRankings(cutoffDate: string): Promise<{ deleted: number; errors: number }> {
  let deleted = 0;
  let errors = 0;
  
  try {
    console.log(`Cleaning up wine rankings older than ${cutoffDate}`);
    
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await adminDatabases.listDocuments(
          ANALYTICS_DB_ID,
          WINE_POPULARITY_RANKINGS_COLLECTION_ID,
          [
            Query.lessThan('date', cutoffDate),
            Query.limit(100)
          ]
        );
        
        if (response.documents.length === 0) {
          hasMore = false;
          break;
        }
        
        for (const doc of response.documents) {
          try {
            await adminDatabases.deleteDocument(
              ANALYTICS_DB_ID,
              WINE_POPULARITY_RANKINGS_COLLECTION_ID,
              doc.$id
            );
            deleted++;
          } catch (deleteError) {
            console.error(`Error deleting wine ranking ${doc.$id}:`, deleteError);
            errors++;
          }
        }
        
        if (response.documents.length < 100) {
          hasMore = false;
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (queryError) {
        console.error('Error querying wine rankings for cleanup:', queryError);
        errors++;
        hasMore = false;
      }
    }
    
    console.log(`Wine rankings cleanup completed: ${deleted} deleted, ${errors} errors`);
    
  } catch (error) {
    console.error('Error in wine rankings cleanup:', error);
    errors++;
  }
  
  return { deleted, errors };
}

/**
 * Main cleanup function
 */
async function performDataCleanup() {
  const startTime = Date.now();
  const { rawDataCutoff, aggregatedDataCutoff } = getRetentionDates();
  
  console.log(`Starting GDPR-compliant data cleanup...`);
  console.log(`Raw data cutoff: ${rawDataCutoff}`);
  console.log(`Aggregated data cutoff: ${aggregatedDataCutoff}`);
  
  const results = {
    rawEvents: { deleted: 0, errors: 0 },
    aggregatedStats: { deleted: 0, errors: 0 },
    wineRankings: { deleted: 0, errors: 0 },
    duration: 0
  };
  
  try {
    // Clean up raw scan events (12 months retention)
    results.rawEvents = await cleanupRawScanEvents(rawDataCutoff);
    
    // Clean up aggregated statistics (3 years retention)
    results.aggregatedStats = await cleanupAggregatedStats(aggregatedDataCutoff);
    
    // Clean up wine rankings (3 years retention)
    results.wineRankings = await cleanupWineRankings(aggregatedDataCutoff);
    
    results.duration = Date.now() - startTime;
    
    console.log(`Data cleanup completed in ${results.duration}ms`);
    console.log(`Total deleted: ${results.rawEvents.deleted + results.aggregatedStats.deleted + results.wineRankings.deleted}`);
    console.log(`Total errors: ${results.rawEvents.errors + results.aggregatedStats.errors + results.wineRankings.errors}`);
    
    return {
      success: true,
      message: 'Data cleanup completed successfully',
      results
    };
    
  } catch (error) {
    console.error('Error during data cleanup:', error);
    results.duration = Date.now() - startTime;
    
    return {
      success: false,
      message: 'Data cleanup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      results
    };
  }
}

/**
 * GET endpoint for checking cleanup status
 */
export async function GET() {
  const { rawDataCutoff, aggregatedDataCutoff } = getRetentionDates();
  
  return NextResponse.json({
    status: 'active',
    message: 'GDPR-compliant data cleanup service',
    retentionPolicy: {
      rawEvents: '12 months',
      aggregatedStats: '3 years',
      wineRankings: '3 years'
    },
    cutoffDates: {
      rawDataCutoff,
      aggregatedDataCutoff
    },
    usage: 'POST with valid CRON_SECRET to trigger cleanup'
  });
}

/**
 * POST endpoint for triggering data cleanup
 * This should be called by a cron job or manually by administrators
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get('authorization');
    const providedKey = body.key || authHeader?.replace('Bearer ', '');
    
    const expectedKey = env.CRON_SECRET;
    
    if (!expectedKey) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      );
    }
    
    if (providedKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid or missing secret key' },
        { status: 401 }
      );
    }
    
    console.log('Data cleanup triggered via API');
    
    // Perform the cleanup
    const result = await performDataCleanup();
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500
    });
    
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process cleanup request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}