import { NextRequest, NextResponse } from 'next/server';
import { adminDatabases, ANALYTICS_DB_ID, Query } from '@/lib/appwrite-client';
import { getRequestSessionUser } from '@/server/auth/session';
import { 
  TrendAnalyzer, 
  PredictionEngine, 
  AnomalyDetector, 
  GeographicAnalyzer,
  TimeSeriesDataPoint 
} from '@/lib/advanced-analytics';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const DAILY_SCAN_STATS_COLLECTION_ID = 'daily_scan_stats';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';
const LANGUAGE_SCAN_STATS_COLLECTION_ID = 'language_scan_stats';
const HOURLY_SCAN_STATS_COLLECTION_ID = 'hourly_scan_stats';

/**
 * Calculate date range based on the specified period
 */
function getDateRange(range: string): { startDate: string; endDate: string } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  
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
    case '180days':
      startDate.setDate(startDate.getDate() - 180);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setDate(startDate.getDate() - 90); // Default to 90 days for better analysis
  }
  
  startDate.setHours(0, 0, 0, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Get time series data for trend analysis
 */
async function getTimeSeriesData(userId: string, startDate: string, endDate: string): Promise<TimeSeriesDataPoint[]> {
  try {
    const response = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', userId),
        Query.isNull('wineId'), // Winery-level data
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(1000)
      ]
    );
    
    return response.documents.map(doc => ({
      date: doc.date,
      value: doc.scanCount || 0,
      metadata: {
        uniqueVisitors: doc.uniqueVisitorsEstimate || 0,
        mobileCount: doc.mobileCount || 0,
        tabletCount: doc.tabletCount || 0,
        desktopCount: doc.desktopCount || 0
      }
    }));
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return [];
  }
}

/**
 * Get geographic data for analysis
 */
async function getGeographicData(userId: string, startDate: string, endDate: string) {
  try {
    // Get regional stats
    const regionalResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      REGIONAL_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', userId),
        Query.isNull('wineId'),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(1000)
      ]
    );

    // Get language stats
    const languageResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      LANGUAGE_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', userId),
        Query.isNull('wineId'),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(1000)
      ]
    );

    // Get hourly stats
    const hourlyResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      HOURLY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', userId),
        Query.isNull('wineId'),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(1000)
      ]
    );

    // Get daily stats for dates
    const dailyResponse = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      DAILY_SCAN_STATS_COLLECTION_ID,
      [
        Query.equal('wineryId', userId),
        Query.isNull('wineId'),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(1000)
      ]
    );

    // Group data by country
    const countryData: Record<string, any> = {};
    
    // Process regional data
    regionalResponse.documents.forEach(doc => {
      const country = doc.countryCode || 'UNKNOWN';
      if (!countryData[country]) {
        countryData[country] = {
          countryCode: country,
          scanCount: 0,
          languages: [],
          devices: [],
          hourlyPattern: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
          dates: []
        };
      }
      countryData[country].scanCount += doc.scanCount || 0;
    });

    // Process language data
    languageResponse.documents.forEach(doc => {
      const country = 'CZ'; // Would need to correlate with regional data in real implementation
      if (countryData[country]) {
        const existing = countryData[country].languages.find((l: any) => l.language === doc.language);
        if (existing) {
          existing.count += doc.scanCount || 0;
        } else {
          countryData[country].languages.push({
            language: doc.language,
            count: doc.scanCount || 0
          });
        }
      }
    });

    // Process hourly data
    hourlyResponse.documents.forEach(doc => {
      const country = 'CZ'; // Would need to correlate with regional data
      if (countryData[country] && doc.hour !== undefined) {
        countryData[country].hourlyPattern[doc.hour].count += doc.scanCount || 0;
      }
    });

    // Process daily data
    dailyResponse.documents.forEach(doc => {
      const country = 'CZ'; // Would need to correlate with regional data
      if (countryData[country]) {
        countryData[country].dates.push({
          date: doc.date,
          count: doc.scanCount || 0
        });
      }
    });

    // Add device data (simplified - would need to get from scan events)
    Object.values(countryData).forEach((data: any) => {
      data.devices = [
        { device: 'mobile', count: Math.floor(data.scanCount * 0.7) },
        { device: 'desktop', count: Math.floor(data.scanCount * 0.25) },
        { device: 'tablet', count: Math.floor(data.scanCount * 0.05) }
      ];
    });

    return Object.values(countryData);
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    return [];
  }
}

/**
 * Generate market intelligence insights
 */
function generateMarketIntelligence(timeSeriesData: TimeSeriesDataPoint[], geographicData: any[]) {
  const totalScans = timeSeriesData.reduce((sum, point) => sum + point.value, 0);
  const avgDailyScans = totalScans / timeSeriesData.length;
  
  const insights = [];
  
  // Performance insights
  if (avgDailyScans > 100) {
    insights.push({
      type: 'performance',
      level: 'high',
      title: 'Vysoká aktivita',
      description: `Průměrně ${avgDailyScans.toFixed(1)} skenů denně - nadprůměrná angažovanost zákazníků.`,
      recommendation: 'Využijte vysokou aktivitu pro spuštění nových produktů nebo kampaní.'
    });
  } else if (avgDailyScans < 10) {
    insights.push({
      type: 'performance',
      level: 'low',
      title: 'Nízká aktivita',
      description: `Pouze ${avgDailyScans.toFixed(1)} skenů denně - potenciál pro růst.`,
      recommendation: 'Zvažte marketingové kampaně nebo zlepšení viditelnosti QR kódů.'
    });
  }
  
  // Geographic insights
  const topCountry = geographicData.reduce((max, country) => 
    country.scanCount > (max?.scanCount || 0) ? country : max, null);
  
  if (topCountry) {
    insights.push({
      type: 'geographic',
      level: 'info',
      title: `Hlavní trh: ${topCountry.countryCode}`,
      description: `${((topCountry.scanCount / totalScans) * 100).toFixed(1)}% všech skenů pochází z ${topCountry.countryCode}.`,
      recommendation: 'Zvažte lokalizaci obsahu a cílené kampaně pro tento trh.'
    });
  }
  
  // Seasonality insights
  const recentWeek = timeSeriesData.slice(-7);
  const previousWeek = timeSeriesData.slice(-14, -7);
  
  if (recentWeek.length === 7 && previousWeek.length === 7) {
    const recentAvg = recentWeek.reduce((sum, p) => sum + p.value, 0) / 7;
    const previousAvg = previousWeek.reduce((sum, p) => sum + p.value, 0) / 7;
    const weeklyChange = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (weeklyChange > 20) {
      insights.push({
        type: 'trend',
        level: 'positive',
        title: 'Rostoucí trend',
        description: `Aktivita vzrostla o ${weeklyChange.toFixed(1)}% oproti minulému týdnu.`,
        recommendation: 'Analyzujte faktory úspěchu a replikujte je v budoucích kampaních.'
      });
    } else if (weeklyChange < -20) {
      insights.push({
        type: 'trend',
        level: 'warning',
        title: 'Klesající trend',
        description: `Aktivita klesla o ${Math.abs(weeklyChange).toFixed(1)}% oproti minulému týdnu.`,
        recommendation: 'Prověřte dostupnost QR kódů a zvažte obnovení marketingových aktivit.'
      });
    }
  }
  
  return insights;
}

/**
 * Generate competitive analysis (simplified)
 */
function generateCompetitiveAnalysis(timeSeriesData: TimeSeriesDataPoint[]) {
  const totalScans = timeSeriesData.reduce((sum, point) => sum + point.value, 0);
  const avgDailyScans = totalScans / timeSeriesData.length;
  
  // Benchmarks based on industry averages (these would be real data in production)
  const industryBenchmarks = {
    small: 5,    // 0-50 wines
    medium: 25,  // 51-200 wines  
    large: 100   // 200+ wines
  };
  
  let marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  let relativePerformance: number;
  
  if (avgDailyScans > industryBenchmarks.large) {
    marketPosition = 'leader';
    relativePerformance = avgDailyScans / industryBenchmarks.large;
  } else if (avgDailyScans > industryBenchmarks.medium) {
    marketPosition = 'challenger';
    relativePerformance = avgDailyScans / industryBenchmarks.medium;
  } else if (avgDailyScans > industryBenchmarks.small) {
    marketPosition = 'follower';
    relativePerformance = avgDailyScans / industryBenchmarks.small;
  } else {
    marketPosition = 'niche';
    relativePerformance = avgDailyScans / industryBenchmarks.small;
  }
  
  const uniqueStrengths = [];
  const opportunityAreas = [];
  
  // Analyze strengths and opportunities based on data patterns
  const recentGrowth = timeSeriesData.length > 30 ? 
    ((timeSeriesData.slice(-7).reduce((sum, p) => sum + p.value, 0) / 7) - 
     (timeSeriesData.slice(-30, -23).reduce((sum, p) => sum + p.value, 0) / 7)) / 
    (timeSeriesData.slice(-30, -23).reduce((sum, p) => sum + p.value, 0) / 7) * 100 : 0;
  
  if (recentGrowth > 10) {
    uniqueStrengths.push('Silný růstový momentum');
  }
  
  if (avgDailyScans > industryBenchmarks.medium) {
    uniqueStrengths.push('Nadprůměrná aktivita zákazníků');
  }
  
  if (recentGrowth < -5) {
    opportunityAreas.push('Stabilizace růstu');
  }
  
  if (avgDailyScans < industryBenchmarks.small) {
    opportunityAreas.push('Zvýšení povědomí o značce');
  }
  
  return {
    marketPosition,
    relativePerformance,
    uniqueStrengths,
    opportunityAreas,
    threatLevel: recentGrowth < -20 ? 'high' as const : 
                recentGrowth < -10 ? 'medium' as const : 'low' as const
  };
}

async function runAdvancedAnalysis(userId: string, range: string, analysisType: string) {
  const { startDate, endDate } = getDateRange(range);

  const timeSeriesData = await getTimeSeriesData(userId, startDate, endDate);

  if (timeSeriesData.length < 7) {
    return NextResponse.json(
      {
        error: 'Insufficient data for advanced analysis',
        message: 'Potřebujeme alespoň 7 dní dat pro pokročilou analýzu.',
        suggestion: 'Zkuste kratší časový rozsah nebo počkejte na více dat.'
      },
      { status: 400 }
    );
  }

  const result: any = {};

  if (analysisType === 'comprehensive' || analysisType === 'trends') {
    try {
      result.trends = TrendAnalyzer.analyzeTrends(timeSeriesData);
    } catch (error) {
      console.error('Error in trend analysis:', error);
      result.trends = null;
    }
  }

  if (analysisType === 'comprehensive' || analysisType === 'predictions') {
    try {
      result.predictions = PredictionEngine.predict(timeSeriesData);
    } catch (error) {
      console.error('Error in prediction:', error);
      result.predictions = null;
    }
  }

  if (analysisType === 'comprehensive' || analysisType === 'anomalies') {
    try {
      result.anomalies = AnomalyDetector.detect(timeSeriesData);
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      result.anomalies = null;
    }
  }

  if (analysisType === 'comprehensive' || analysisType === 'geographic') {
    try {
      const geographicData = await getGeographicData(userId, startDate, endDate);
      result.geographic = GeographicAnalyzer.analyzeGeographicData(geographicData);
    } catch (error) {
      console.error('Error in geographic analysis:', error);
      result.geographic = null;
    }
  }

  if (analysisType === 'comprehensive' || analysisType === 'intelligence') {
    try {
      const geographicData = await getGeographicData(userId, startDate, endDate);
      result.marketIntelligence = generateMarketIntelligence(timeSeriesData, geographicData);
      result.competitiveAnalysis = generateCompetitiveAnalysis(timeSeriesData);
    } catch (error) {
      console.error('Error in market intelligence:', error);
      result.marketIntelligence = null;
      result.competitiveAnalysis = null;
    }
  }

  result.meta = {
    dataPoints: timeSeriesData.length,
    dateRange: { startDate, endDate },
    analysisTimestamp: new Date().toISOString(),
    confidence: timeSeriesData.length >= 30 ? 'high' : timeSeriesData.length >= 14 ? 'medium' : 'low'
  };

  return NextResponse.json(result);
}

/**
 * Advanced Analytics API endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getRequestSessionUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const range = request.nextUrl.searchParams.get('range') || '90days';
    const analysisType = request.nextUrl.searchParams.get('type') || 'comprehensive';

    return runAdvancedAnalysis(user.id, range, analysisType);
    
  } catch (error) {
    console.error('Error in advanced analytics endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to perform advanced analytics' },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for triggering analysis refresh
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getRequestSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const range = body.range || '90days';

    return runAdvancedAnalysis(user.id, range, 'comprehensive');
    
  } catch (error) {
    console.error('Error in advanced analytics POST endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to refresh advanced analytics' },
      { status: 500 }
    );
  }
}
