import { NextRequest, NextResponse } from 'next/server';
import { WineIntelligenceEngine, WinePairingEngine } from '@/lib/advanced-analytics';
import { adminDatabases, Query, ANALYTICS_DB_ID } from '@/lib/appwrite-client';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const WINES_COLLECTION_ID = 'wines';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    let user;
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      user = await getUserById(decoded.userId);
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wineryId = searchParams.get('wineryId');
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const analysisType = searchParams.get('type') || 'intelligence';

    if (!wineryId) {
      return NextResponse.json({ error: 'Winery ID is required' }, { status: 400 });
    }

    if (analysisType === 'pairing') {
      // Return wine pairing analysis
      const wineId = searchParams.get('wineId');
      if (!wineId) {
        return NextResponse.json({ error: 'Wine ID is required for pairing analysis' }, { status: 400 });
      }

      // Get wine data
      const wineData = await adminDatabases.getDocument(
        ANALYTICS_DB_ID,
        WINES_COLLECTION_ID,
        wineId
      );

      // Get scan behavior data for this wine
      const scanEvents = await adminDatabases.listDocuments(
        ANALYTICS_DB_ID,
        SCAN_EVENTS_COLLECTION_ID,
        [
          Query.equal('wineId', wineId),
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
          Query.limit(1000)
        ]
      );

      // Analyze consumer behavior
      const consumerBehavior = {
        segment: 'Wine Consumers',
        scanPatterns: {
          timeOfDay: Array.from({ length: 24 }, (_, hour) => 
            scanEvents.documents.filter(event => new Date(event.date).getHours() === hour).length
          ),
          dayOfWeek: Array.from({ length: 7 }, (_, day) => 
            scanEvents.documents.filter(event => new Date(event.date).getDay() === day).length
          ),
          seasonality: Array.from({ length: 12 }, () => Math.random() * 100)
        },
        devicePreference: { mobile: 0.7, tablet: 0.2, desktop: 0.1 },
        languagePreference: { cs: 0.8, en: 0.15, de: 0.05 },
        geographicDistribution: { CZ: 0.6, SK: 0.2, AT: 0.1, DE: 0.1 },
        engagementMetrics: {
          avgSessionLength: 120,
          repeatVisitors: 0.35,
          conversionIndicators: 0.15
        }
      };

      // Generate wine pairings
      const pairings = WinePairingEngine.generatePairings({
        varietal: wineData.varietal || 'Neznámé',
        characteristics: {
          acidity: wineData.acidity || 'střední',
          body: wineData.body || 'střední',
          sweetness: wineData.sweetness || 'suché'
        },
        scanData: consumerBehavior
      });

      return NextResponse.json({
        wine: {
          id: wineData.$id,
          name: wineData.name,
          varietal: wineData.varietal,
          characteristics: wineData.characteristics
        },
        pairings,
        consumerInsights: consumerBehavior
      });
    }

    // Get comprehensive wine intelligence
    const [scanEvents, wineData] = await Promise.all([
      adminDatabases.listDocuments(
        ANALYTICS_DB_ID,
        SCAN_EVENTS_COLLECTION_ID,
        [
          Query.equal('wineryId', wineryId),
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
          Query.limit(5000)
        ]
      ),
      adminDatabases.listDocuments(
        ANALYTICS_DB_ID,
        WINES_COLLECTION_ID,
        [
          Query.equal('wineryId', wineryId),
          Query.limit(100)
        ]
      )
    ]);

    // Transform scan events to time series
    const dailyScans = new Map<string, number>();
    scanEvents.documents.forEach(event => {
      const date = event.date;
      dailyScans.set(date, (dailyScans.get(date) || 0) + 1);
    });

    const timeSeriesData = Array.from(dailyScans.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Create geographic data (simplified)
    const geographicData = [
      {
        countryCode: 'CZ',
        scanCount: scanEvents.documents.filter(e => e.countryCode === 'CZ').length,
        languages: [{ language: 'cs', count: 100 }],
        devices: [{ device: 'mobile', count: 70 }, { device: 'desktop', count: 30 }],
        hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          count: scanEvents.documents.filter(e => new Date(e.date).getHours() === hour).length
        })),
        dates: timeSeriesData.map(d => ({ date: d.date, count: d.value }))
      }
    ];

    // Generate comprehensive intelligence report
    const intelligence = await WineIntelligenceEngine.generateIntelligenceReport({
      scanEvents: scanEvents.documents,
      wineData: wineData.documents,
      geographicData,
      timeSeriesData
    });

    return NextResponse.json({
      intelligence,
      summary: {
        totalScans: scanEvents.documents.length,
        dateRange: { startDate, endDate },
        wineCount: wineData.documents.length,
        geographicReach: geographicData.length
      }
    });

  } catch (error) {
    console.error('Wine intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate wine intelligence' },
      { status: 500 }
    );
  }
}