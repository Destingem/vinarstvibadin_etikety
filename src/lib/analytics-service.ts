/**
 * Analytics Service - Handles interaction with the analytics API endpoints
 */
import { adminDatabases, ID, Query, ANALYTICS_DB_ID } from '@/lib/appwrite-client';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';

// Types
export interface ScanEvent {
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  deviceType: string;
  operatingSystem?: string;
  browserLanguage?: string;
  countryCode?: string;
  regionCode?: string;
  city?: string;
  languageUsed?: string;
  referrer?: string;
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
    const result = await adminDatabases.createDocument(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      ID.unique(),
      scanData
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

/**
 * Generate sample data for testing when no real data exists
 */
export function generateSampleData(wineryId: string, dateRange: string) {
  // Create date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (dateRange) {
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
  
  // Generate daily scan data
  const dailyScans = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const scanCount = Math.floor(Math.random() * 50) + 5; // Random between 5-55
    
    dailyScans.push({
      date: currentDate.toISOString().split('T')[0],
      scanCount
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Generate device distribution
  const totalScans = dailyScans.reduce((sum, day) => sum + day.scanCount, 0);
  const mobilePercentage = Math.floor(Math.random() * 20) + 65; // 65-85%
  const tabletPercentage = Math.floor(Math.random() * 10) + 5; // 5-15%
  const desktopPercentage = 100 - mobilePercentage - tabletPercentage;
  
  const scansByDevice = {
    mobile: Math.floor(totalScans * mobilePercentage / 100),
    tablet: Math.floor(totalScans * tabletPercentage / 100),
    desktop: Math.floor(totalScans * desktopPercentage / 100),
    unknown: 0
  };
  
  // Generate top regions
  const topRegions = [
    { countryCode: 'CZ', countryName: 'Česká republika', scanCount: Math.floor(totalScans * 0.65), percentage: 65 },
    { countryCode: 'SK', countryName: 'Slovensko', scanCount: Math.floor(totalScans * 0.15), percentage: 15 },
    { countryCode: 'AT', countryName: 'Rakousko', scanCount: Math.floor(totalScans * 0.08), percentage: 8 },
    { countryCode: 'DE', countryName: 'Německo', scanCount: Math.floor(totalScans * 0.07), percentage: 7 },
    { countryCode: 'PL', countryName: 'Polsko', scanCount: Math.floor(totalScans * 0.05), percentage: 5 }
  ];
  
  // Generate language stats
  const languages = [
    { languageCode: 'cs', languageName: 'Čeština', scanCount: Math.floor(totalScans * 0.7), percentage: 70 },
    { languageCode: 'en', languageName: 'Angličtina', scanCount: Math.floor(totalScans * 0.15), percentage: 15 },
    { languageCode: 'de', languageName: 'Němčina', scanCount: Math.floor(totalScans * 0.1), percentage: 10 },
    { languageCode: 'sk', languageName: 'Slovenština', scanCount: Math.floor(totalScans * 0.05), percentage: 5 }
  ];
  
  // Generate hourly distribution
  const timeDistribution = [];
  for (let hour = 0; hour < 24; hour++) {
    let percentage = 1; // Base percentage
    
    // Higher percentages during typical waking/dining hours
    if (hour >= 11 && hour <= 14) percentage = 7; // Lunch hours
    else if (hour >= 17 && hour <= 21) percentage = 10; // Dinner/evening hours
    else if (hour >= 8 && hour < 11) percentage = 5; // Morning hours
    else if (hour >= 14 && hour < 17) percentage = 4; // Afternoon hours
    else if (hour >= 21 && hour < 24) percentage = 3; // Late evening
    else percentage = 0.5; // Early morning (very low)
    
    timeDistribution.push({
      hour,
      scanCount: Math.floor(totalScans * percentage / 100),
      percentage
    });
  }
  
  // Generate sample top wines
  const topWines = [
    { wineId: 'wine1', wineName: 'Pálava pozdní sběr 2023', scanCount: Math.floor(totalScans * 0.25), rank: 1 },
    { wineId: 'wine2', wineName: 'Ryzlink vlašský 2023', scanCount: Math.floor(totalScans * 0.2), rank: 2 },
    { wineId: 'wine3', wineName: 'Rulandské šedé 2022', scanCount: Math.floor(totalScans * 0.15), rank: 3 },
    { wineId: 'wine4', wineName: 'Frankovka 2022', scanCount: Math.floor(totalScans * 0.1), rank: 4 },
    { wineId: 'wine5', wineName: 'Tramín červený 2023', scanCount: Math.floor(totalScans * 0.05), rank: 5 }
  ];
  
  // Generate scan trend
  const scanTrend = {
    percentChange: Math.floor(Math.random() * 40) - 10, // -10% to +30%
    isPositive: Math.random() > 0.3 // 70% chance of positive trend
  };
  
  // Generate sample OS data
  const operatingSystems = [
    { name: 'iOS 16.5', count: Math.floor(totalScans * 0.35), percentage: 35 },
    { name: 'Android 13', count: Math.floor(totalScans * 0.30), percentage: 30 },
    { name: 'Windows 11', count: Math.floor(totalScans * 0.15), percentage: 15 },
    { name: 'macOS 12.6', count: Math.floor(totalScans * 0.10), percentage: 10 },
    { name: 'Android 12', count: Math.floor(totalScans * 0.05), percentage: 5 },
    { name: 'Other', count: Math.floor(totalScans * 0.05), percentage: 5 }
  ];
  
  // Return the sample data
  return {
    totalScans,
    totalUniqueVisitors: Math.floor(totalScans * 0.8), // ~80% of total are unique
    scansByDevice,
    operatingSystems,
    scanTrend,
    topWines,
    topRegions,
    languages,
    timeDistribution,
    dailyScans
  };
}