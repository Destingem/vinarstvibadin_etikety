import { adminDatabases, ANALYTICS_DB_ID, Query } from './appwrite-client';

const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';
const WINE_POPULARITY_RANKINGS_COLLECTION_ID = 'wine_popularity_rankings';
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';

type AnalyticsSummary = {
  totalScans: number;
  totalUniqueVisitors: number;
  scansByDevice: {
    mobile: number;
    tablet: number;
    desktop: number;
    unknown: number;
  };
  operatingSystems: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  scanTrend: {
    percentChange: number;
    isPositive: boolean;
  };
  topWines: Array<{
    wineId: string;
    wineName: string;
    scanCount: number;
    rank: number;
    wineBatch?: string;
    wineVintage?: string;
  }>;
  topRegions: Array<{
    countryCode: string;
    countryName: string;
    scanCount: number;
    percentage: number;
  }>;
  languages: Array<{
    languageCode: string;
    languageName: string;
    language?: string;
    scanCount: number;
    percentage: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    scanCount: number;
    percentage: number;
  }>;
  dailyScans: Array<{
    date: string;
    scanCount: number;
  }>;
};

function getDateRange(range: string): { startDate: string; endDate: string; days: number } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date();
  let days = 30;

  switch (range) {
    case '7days':
      days = 7;
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30days':
      days = 30;
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90days':
      days = 90;
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'year':
      days = 365;
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  startDate.setHours(0, 0, 0, 0);

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    days,
  };
}

function emptyAnalyticsSummary(): AnalyticsSummary {
  return {
    totalScans: 0,
    totalUniqueVisitors: 0,
    scansByDevice: {
      mobile: 0,
      tablet: 0,
      desktop: 0,
      unknown: 0,
    },
    operatingSystems: [],
    scanTrend: {
      percentChange: 0,
      isPositive: false,
    },
    topWines: [],
    topRegions: [],
    languages: [],
    timeDistribution: [],
    dailyScans: [],
  };
}

function toPercentage(count: number, total: number) {
  return total > 0 ? Math.round((count / total) * 100) : 0;
}

function parseRankings(rankings: unknown[], totalScans: number) {
  return rankings
    .map((item: any, index) => {
      if (!item) {
        return null;
      }

      const wineId = item.wineId || item.$id || `wine-${index + 1}`;
      const scanCount = Number(item.scanCount ?? item.count ?? 0);

      return {
        wineId,
        wineName: item.wineName || item.name || 'Víno',
        scanCount,
        rank: Number(item.rank ?? index + 1),
        wineBatch: item.wineBatch,
        wineVintage: item.wineVintage,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.scanCount - a.scanCount)
    .map((item: any, index: number) => ({
      ...item,
      rank: item.rank || index + 1,
      percentage: toPercentage(item.scanCount, totalScans),
    }));
}

function parseSummaryRows(rows: any[], totalScans: number, keyName: 'country' | 'language') {
  return rows.map((row: any) => {
    if (keyName === 'country') {
      const countryCode = row.countryCode || row.code || 'unknown';
      return {
        countryCode,
        countryName: row.countryName || countryCode,
        scanCount: Number(row.scanCount ?? row.total ?? 0),
        percentage: Number(row.percentage ?? toPercentage(Number(row.scanCount ?? row.total ?? 0), totalScans)),
      };
    }

    const languageCode = row.languageCode || row.language || row.code || 'unknown';
    return {
      languageCode,
      languageName: row.languageName || languageCode,
      language: row.language || languageCode,
      scanCount: Number(row.scanCount ?? row.total ?? 0),
      percentage: Number(row.percentage ?? toPercentage(Number(row.scanCount ?? row.total ?? 0), totalScans)),
    };
  });
}

async function loadRangeDocs(collectionId: string, userId: string, startDate: string, endDate: string) {
  const response = await adminDatabases.listDocuments(ANALYTICS_DB_ID, collectionId, [
    Query.equal('wineryId', userId),
    Query.greaterThanEqual('date', startDate),
    Query.lessThanEqual('date', endDate),
    Query.limit(500),
  ]);

  return response.documents;
}

/**
 * Get analytics summary for a specific user/winery
 */
export async function getAnalyticsSummary(userId: string, range: string = '30days') {
  try {
    const { startDate, endDate, days } = getDateRange(range);
    const previousEndDate = new Date(startDate);
    previousEndDate.setMilliseconds(-1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const [dailyStats, previousDailyStats, regionalStats, languageStats, hourlyStats, rankingDocs] = await Promise.all([
      loadRangeDocs(DAILY_SCAN_STATS_COLLECTION_ID, userId, startDate, endDate),
      loadRangeDocs(DAILY_SCAN_STATS_COLLECTION_ID, userId, previousStartDate.toISOString(), previousEndDate.toISOString()),
      loadRangeDocs(REGIONAL_SCAN_STATS_COLLECTION_ID, userId, startDate, endDate),
      loadRangeDocs(LANGUAGE_SCAN_STATS_COLLECTION_ID, userId, startDate, endDate),
      loadRangeDocs(HOURLY_SCAN_STATS_COLLECTION_ID, userId, startDate, endDate),
      adminDatabases.listDocuments(ANALYTICS_DB_ID, WINE_POPULARITY_RANKINGS_COLLECTION_ID, [
        Query.equal('wineryId', userId),
        Query.equal('periodType', 'daily'),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderDesc('date'),
        Query.limit(1),
      ]),
    ]);

    if (dailyStats.length === 0) {
      return emptyAnalyticsSummary();
    }

    const totalScans = dailyStats.reduce((sum, doc) => sum + Number(doc.scanCount ?? 0), 0);
    const totalUniqueVisitors = dailyStats.reduce((sum, doc) => sum + Number(doc.uniqueVisitorsEstimate ?? 0), 0);
    const previousPeriodTotal = previousDailyStats.reduce((sum, doc) => sum + Number(doc.scanCount ?? 0), 0);
    const percentChange = previousPeriodTotal > 0 ? Math.round(((totalScans - previousPeriodTotal) / previousPeriodTotal) * 100) : 0;

    const scansByDevice = dailyStats.reduce(
      (acc, doc) => {
        acc.mobile += Number(doc.mobileCount ?? 0);
        acc.tablet += Number(doc.tabletCount ?? 0);
        acc.desktop += Number(doc.desktopCount ?? 0);
        acc.unknown += Number(doc.unknownCount ?? 0);
        return acc;
      },
      { mobile: 0, tablet: 0, desktop: 0, unknown: 0 }
    );

    const operatingSystems = await adminDatabases
      .listDocuments(ANALYTICS_DB_ID, SCAN_EVENTS_COLLECTION_ID, [
        Query.equal('wineryId', userId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(1000),
      ])
      .then((response) => {
        const counts: Record<string, number> = {};
        for (const event of response.documents) {
          const name = event.operatingSystem || 'Neznámý';
          counts[name] = (counts[name] || 0) + 1;
        }

        return Object.entries(counts)
          .map(([name, count]) => ({
            name,
            count,
            percentage: toPercentage(count, totalScans),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      })
      .catch(() => []);

    const topWinesDocs = rankingDocs.documents.length > 0 ? rankingDocs.documents[0].rankings || [] : [];
    const topWines = parseRankings(Array.isArray(topWinesDocs) ? topWinesDocs : [], totalScans).slice(0, 5);
    const topRegions = parseSummaryRows(regionalStats, totalScans, 'country');
    const languages = parseSummaryRows(languageStats, totalScans, 'language');
    const timeDistribution = hourlyStats
      .map((row: any) => ({
        hour: Number(row.hour ?? 0),
        scanCount: Number(row.scanCount ?? 0),
        percentage: Number(row.percentage ?? toPercentage(Number(row.scanCount ?? 0), totalScans)),
      }))
      .sort((a, b) => a.hour - b.hour);

    return {
      totalScans,
      totalUniqueVisitors,
      scansByDevice,
      operatingSystems,
      scanTrend: {
        percentChange,
        isPositive: percentChange > 0,
      },
      topWines,
      topRegions,
      languages,
      timeDistribution,
      dailyScans: dailyStats
        .map((row: any) => ({
          date: String(row.date || '').slice(0, 10),
          scanCount: Number(row.scanCount ?? 0),
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return emptyAnalyticsSummary();
  }
}

/**
 * Get analytics for a specific wine
 */
export async function getWineAnalytics(wineId: string, range: string = '30days') {
  try {
    const { startDate, endDate, days } = getDateRange(range);
    const previousEndDate = new Date(startDate);
    previousEndDate.setMilliseconds(-1);
    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const [currentEvents, previousEvents] = await Promise.all([
      adminDatabases.listDocuments(ANALYTICS_DB_ID, SCAN_EVENTS_COLLECTION_ID, [
        Query.equal('wineId', wineId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(5000),
      ]),
      adminDatabases.listDocuments(ANALYTICS_DB_ID, SCAN_EVENTS_COLLECTION_ID, [
        Query.equal('wineId', wineId),
        Query.greaterThanEqual('date', previousStartDate.toISOString()),
        Query.lessThanEqual('date', previousEndDate.toISOString()),
        Query.limit(5000),
      ]),
    ]);

    if (currentEvents.documents.length === 0) {
      return emptyAnalyticsSummary();
    }

    const events = currentEvents.documents as any[];
    const previous = previousEvents.documents as any[];
    const totalScans = events.length;
    const totalUniqueVisitors = new Set(
      events.map((event) =>
        [
          event.countryCode || 'unknown',
          event.deviceType || 'unknown',
          event.hour ?? 'unknown',
          event.languageUsed || event.browserLanguage || 'unknown',
        ].join('|')
      )
    ).size;
    const previousTotalScans = previous.length;
    const percentChange = previousTotalScans > 0 ? Math.round(((totalScans - previousTotalScans) / previousTotalScans) * 100) : 0;

    const scansByDevice = events.reduce(
      (acc, event) => {
        const deviceType = String(event.deviceType || 'UNKNOWN').toUpperCase();
        if (deviceType === 'MOBILE') acc.mobile += 1;
        else if (deviceType === 'TABLET') acc.tablet += 1;
        else if (deviceType === 'DESKTOP') acc.desktop += 1;
        else acc.unknown += 1;
        return acc;
      },
      { mobile: 0, tablet: 0, desktop: 0, unknown: 0 }
    );

    const countryNames: Record<string, string> = {
      CZ: 'Česká republika',
      SK: 'Slovensko',
      DE: 'Německo',
      AT: 'Rakousko',
      PL: 'Polsko',
      HU: 'Maďarsko',
      FR: 'Francie',
      IT: 'Itálie',
      ES: 'Španělsko',
      US: 'Spojené státy',
      GB: 'Velká Británie',
    };

    const languageNames: Record<string, string> = {
      cs: 'Čeština',
      en: 'Angličtina',
      de: 'Němčina',
      sk: 'Slovenština',
      pl: 'Polština',
      fr: 'Francouzština',
      it: 'Italština',
      es: 'Španělština',
      unknown: 'Neznámý jazyk',
    };

    const byCountry: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    const byHour: Record<number, number> = {};
    const byOS: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (let hour = 0; hour < 24; hour += 1) {
      byHour[hour] = 0;
    }

    for (const event of events) {
      const countryCode = String(event.countryCode || 'unknown').toUpperCase();
      byCountry[countryCode] = (byCountry[countryCode] || 0) + 1;

      const languageCode = String((event.languageUsed || event.browserLanguage || 'unknown').slice(0, 2)).toLowerCase();
      byLanguage[languageCode] = (byLanguage[languageCode] || 0) + 1;

      const hour = Number.isFinite(Number(event.hour)) ? Number(event.hour) : 0;
      byHour[hour] = (byHour[hour] || 0) + 1;

      const osName = String(event.operatingSystem || 'Neznámý');
      byOS[osName] = (byOS[osName] || 0) + 1;

      const date = String(event.date || '').slice(0, 10);
      byDate[date] = (byDate[date] || 0) + 1;
    }

    const topRegions = Object.entries(byCountry)
      .map(([countryCode, scanCount]) => ({
        countryCode,
        countryName: countryNames[countryCode] || countryCode,
        scanCount,
        percentage: toPercentage(scanCount, totalScans),
      }))
      .sort((a, b) => b.scanCount - a.scanCount);

    const languages = Object.entries(byLanguage)
      .map(([languageCode, scanCount]) => ({
        languageCode,
        languageName: languageNames[languageCode] || languageCode,
        language: languageCode,
        scanCount,
        percentage: toPercentage(scanCount, totalScans),
      }))
      .sort((a, b) => b.scanCount - a.scanCount);

    const timeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      scanCount: byHour[hour] || 0,
      percentage: toPercentage(byHour[hour] || 0, totalScans),
    }));

    const operatingSystems = Object.entries(byOS)
      .map(([name, count]) => ({
        name,
        count,
        percentage: toPercentage(count, totalScans),
      }))
      .sort((a, b) => b.count - a.count);

    const wineName = events[0]?.wineName || 'Víno';
    const wineBatch = events[0]?.wineBatch;
    const wineVintage = events[0]?.wineVintage;

    return {
      totalScans,
      totalUniqueVisitors,
      scansByDevice,
      operatingSystems,
      scanTrend: {
        percentChange,
        isPositive: percentChange > 0,
      },
      topWines: [
        {
          wineId,
          wineName,
          scanCount: totalScans,
          rank: 1,
          wineBatch,
          wineVintage,
        },
      ],
      topRegions,
      languages,
      timeDistribution,
      dailyScans: Object.entries(byDate)
        .map(([date, scanCount]) => ({
          date,
          scanCount,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  } catch (error) {
    console.error('Error getting wine analytics:', error);
    return emptyAnalyticsSummary();
  }
}
