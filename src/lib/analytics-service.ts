/**
 * Analytics Service - Handles interaction with the analytics API endpoints
 */
import { adminDatabases, ID, Query, ANALYTICS_DB_ID, Permission, Role } from '@/lib/appwrite-client';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';

// Types - GDPR Compliant
export interface ScanEvent {
  date: string; // YYYY-MM-DD format
  hour: number; // 0-23
  deviceType: string;
  operatingSystem?: string;
  browserLanguage?: string;
  countryCode?: string;
  languageUsed?: string;
  wineId: string;
  wineName: string;
  wineBatch?: string;
  wineVintage?: string;
  wineryId: string;
  wineryName: string;
  winerySlug: string;
}

/**
 * Record a QR code scan event
 */
export async function recordScanEvent(scanData: ScanEvent) {
  try {
    // Create scan event with proper permissions
    // Wine owner can read their analytics + public access for aggregation
    const result = await adminDatabases.createDocument(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      ID.unique(),
      scanData
      // Document permissions removed for Appwrite v1.7.4 compatibility
    );
    
    return { success: true, id: result.$id };
  } catch (error) {
    console.error('Error recording scan event:', error);
    return { success: false, error: 'Failed to record scan event' };
  }
}

/**
 * Get daily scan statistics for a specific winery
 */
export async function getDailyScanStats(wineryId: string, startDate: string, endDate: string) {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.isNull('wineId'), // Only winery-level aggregates
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(100) // Reasonable limit
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    throw error;
  }
}

/**
 * Get regional statistics for a winery
 */
export async function getRegionalStats(wineryId: string, startDate: string, endDate: string) {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      REGIONAL_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.isNull('wineId'), // Only winery-level aggregates
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(100)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching regional stats:', error);
    throw error;
  }
}

/**
 * Get language statistics for a winery
 */
export async function getLanguageStats(wineryId: string, startDate: string, endDate: string) {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      LANGUAGE_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.isNull('wineId'), // Only winery-level aggregates
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(100)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching language stats:', error);
    throw error;
  }
}

/**
 * Get hourly distribution statistics for a winery
 */
export async function getHourlyStats(wineryId: string, startDate: string, endDate: string) {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      HOURLY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.isNull('wineId'), // Only winery-level aggregates
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(100)
      ]
    );
    
    return response.documents;
  } catch (error) {
    console.error('Error fetching hourly stats:', error);
    throw error;
  }
}

/**
 * Get top wine rankings for a winery
 */
export async function getTopWines(wineryId: string, startDate: string, endDate: string) {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      WINE_POPULARITY_RANKINGS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.equal('periodType', 'daily'), // Daily rankings
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderDesc('date'), // Get the most recent ranking
        Query.limit(1)
      ]
    );
    
    if (response.documents.length > 0) {
      // Parse the string array back to objects
      const rankingsArray = response.documents[0].rankings || [];
      const parsedRankings = rankingsArray.map((item: string) => {
        try {
          return JSON.parse(item);
        } catch (e) {
          console.error('Error parsing ranking item:', e);
          return null;
        }
      }).filter((item: any): item is any => item !== null);
      
      return parsedRankings;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching top wines:', error);
    throw error;
  }
}
