import { NextRequest, NextResponse } from 'next/server';
import { GeographicAnalyzer } from '@/lib/advanced-analytics';
import { adminDatabases, Query, ANALYTICS_DB_ID } from '@/lib/appwrite-client';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';
const REGIONAL_SCAN_STATS_COLLECTION_ID = 'regional_scan_stats';

export async function GET(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      await getUserById(decoded.userId);
    } catch (authError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wineryId = searchParams.get('wineryId');
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const analysisType = searchParams.get('type') || 'overview';

    if (!wineryId) {
      return NextResponse.json({ error: 'Winery ID is required' }, { status: 400 });
    }

    // Get scan events data
    const scanEvents = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.limit(5000)
      ]
    );

    switch (analysisType) {
      case 'overview':
        // Basic geographic distribution
        const countryStats = new Map<string, {
          scanCount: number;
          languages: Map<string, number>;
          devices: Map<string, number>;
          hourlyPattern: number[];
          dates: Map<string, number>;
        }>();

        scanEvents.documents.forEach(event => {
          const country = event.countryCode || 'UNKNOWN';
          
          if (!countryStats.has(country)) {
            countryStats.set(country, {
              scanCount: 0,
              languages: new Map(),
              devices: new Map(),
              hourlyPattern: new Array(24).fill(0),
              dates: new Map()
            });
          }

          const stats = countryStats.get(country)!;
          stats.scanCount++;
          
          // Language tracking
          const lang = event.languageUsed || 'unknown';
          stats.languages.set(lang, (stats.languages.get(lang) || 0) + 1);
          
          // Device tracking
          const device = event.deviceType || 'unknown';
          stats.devices.set(device, (stats.devices.get(device) || 0) + 1);
          
          // Hourly pattern
          const hour = event.hour || 0;
          if (hour >= 0 && hour < 24) {
            stats.hourlyPattern[hour]++;
          }
          
          // Daily tracking
          const date = event.date;
          stats.dates.set(date, (stats.dates.get(date) || 0) + 1);
        });

        // Convert to geographic data format
        const geographicData = Array.from(countryStats.entries()).map(([countryCode, stats]) => ({
          countryCode,
          scanCount: stats.scanCount,
          languages: Array.from(stats.languages.entries()).map(([language, count]) => ({ language, count })),
          devices: Array.from(stats.devices.entries()).map(([device, count]) => ({ device, count })),
          hourlyPattern: stats.hourlyPattern.map((count, hour) => ({ hour, count })),
          dates: Array.from(stats.dates.entries()).map(([date, count]) => ({ date, count }))
        }));

        // Analyze geographic insights
        const geographicInsights = GeographicAnalyzer.analyzeGeographicData(geographicData);
        const marketOpportunities = GeographicAnalyzer.identifyMarketOpportunities(geographicInsights);

        return NextResponse.json({
          overview: {
            totalCountries: geographicData.length,
            totalScans: scanEvents.documents.length,
            topCountries: geographicInsights
              .sort((a, b) => b.scanCount - a.scanCount)
              .slice(0, 10),
            marketOpportunities: marketOpportunities.slice(0, 5)
          },
          insights: geographicInsights,
          opportunities: marketOpportunities
        });

      case 'penetration':
        // Market penetration analysis
        const penetrationData = scanEvents.documents.reduce((acc, event) => {
          const country = event.countryCode || 'UNKNOWN';
          acc[country] = (acc[country] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const penetrationAnalysis = Object.entries(penetrationData).map(([countryCode, scanCount]) => {
          const population = GeographicAnalyzer['COUNTRY_POPULATIONS'][countryCode] || 1000000;
          const penetration = (scanCount / population) * 100000; // per 100k population
          
          return {
            countryCode,
            countryName: GeographicAnalyzer['COUNTRY_NAMES'][countryCode] || countryCode,
            scanCount,
            population,
            penetrationPer100k: penetration,
            marketSize: population / 100000, // Market size indicator
            potentialReach: Math.max(0, (population * 0.001) - scanCount) // Estimated untapped market
          };
        }).sort((a, b) => b.penetrationPer100k - a.penetrationPer100k);

        return NextResponse.json({
          penetration: penetrationAnalysis,
          summary: {
            totalMarkets: penetrationAnalysis.length,
            averagePenetration: penetrationAnalysis.reduce((sum, p) => sum + p.penetrationPer100k, 0) / penetrationAnalysis.length,
            topPenetrationMarket: penetrationAnalysis[0],
            underservedMarkets: penetrationAnalysis.filter(p => p.penetrationPer100k < 10).length
          }
        });

      case 'temporal':
        // Geographic temporal analysis
        const temporalData = new Map<string, Map<string, number>>();
        
        scanEvents.documents.forEach(event => {
          const country = event.countryCode || 'UNKNOWN';
          const date = event.date;
          
          if (!temporalData.has(country)) {
            temporalData.set(country, new Map());
          }
          
          const countryData = temporalData.get(country)!;
          countryData.set(date, (countryData.get(date) || 0) + 1);
        });

        const temporalAnalysis = Array.from(temporalData.entries()).map(([countryCode, dateData]) => {
          const dates = Array.from(dateData.entries())
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
          
          // Calculate growth trend
          const values = dates.map(d => d.count);
          const firstHalf = values.slice(0, Math.floor(values.length / 2));
          const secondHalf = values.slice(Math.floor(values.length / 2));
          
          const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
          const growthTrend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

          return {
            countryCode,
            countryName: GeographicAnalyzer['COUNTRY_NAMES'][countryCode] || countryCode,
            totalScans: values.reduce((sum, val) => sum + val, 0),
            averageDaily: values.reduce((sum, val) => sum + val, 0) / values.length,
            growthTrend,
            trendDirection: growthTrend > 5 ? 'strong_growth' : 
                           growthTrend > 0 ? 'growth' :
                           growthTrend > -5 ? 'stable' : 'decline',
            dateRange: { start: dates[0]?.date, end: dates[dates.length - 1]?.date },
            dailyData: dates
          };
        }).sort((a, b) => b.growthTrend - a.growthTrend);

        return NextResponse.json({
          temporal: temporalAnalysis,
          summary: {
            fastestGrowingMarket: temporalAnalysis[0],
            decliningMarkets: temporalAnalysis.filter(t => t.trendDirection === 'decline').length,
            stableMarkets: temporalAnalysis.filter(t => t.trendDirection === 'stable').length,
            growingMarkets: temporalAnalysis.filter(t => t.trendDirection.includes('growth')).length
          }
        });

      case 'expansion':
        // Market expansion recommendations
        const currentMarkets = new Set(scanEvents.documents.map(e => e.countryCode).filter(Boolean));
        
        // Potential expansion markets (neighboring countries with wine culture)
        const expansionTargets = [
          { code: 'AT', name: 'Rakousko', wineMarket: 'strong', proximity: 'high', barriers: 'low' },
          { code: 'DE', name: 'Německo', wineMarket: 'strong', proximity: 'medium', barriers: 'medium' },
          { code: 'PL', name: 'Polsko', wineMarket: 'growing', proximity: 'high', barriers: 'low' },
          { code: 'HU', name: 'Maďarsko', wineMarket: 'strong', proximity: 'high', barriers: 'low' },
          { code: 'SI', name: 'Slovinsko', wineMarket: 'medium', proximity: 'high', barriers: 'low' },
          { code: 'HR', name: 'Chorvatsko', wineMarket: 'medium', proximity: 'medium', barriers: 'medium' }
        ].filter(market => !currentMarkets.has(market.code));

        const expansionRecommendations = expansionTargets.map(market => {
          const score = 
            (market.wineMarket === 'strong' ? 3 : market.wineMarket === 'growing' ? 2 : 1) +
            (market.proximity === 'high' ? 2 : 1) +
            (market.barriers === 'low' ? 2 : market.barriers === 'medium' ? 1 : 0);

          return {
            ...market,
            recommendationScore: score,
            priority: score >= 6 ? 'high' : score >= 4 ? 'medium' : 'low',
            estimatedPotential: GeographicAnalyzer['COUNTRY_POPULATIONS'][market.code] * 0.0001, // Very rough estimate
            timeline: score >= 6 ? '3-6 months' : score >= 4 ? '6-12 months' : '12+ months'
          };
        }).sort((a, b) => b.recommendationScore - a.recommendationScore);

        return NextResponse.json({
          expansion: {
            currentMarkets: Array.from(currentMarkets),
            recommendations: expansionRecommendations,
            summary: {
              highPriorityTargets: expansionRecommendations.filter(r => r.priority === 'high').length,
              totalPotentialMarkets: expansionRecommendations.length,
              estimatedTotalPotential: expansionRecommendations.reduce((sum, r) => sum + r.estimatedPotential, 0)
            }
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Geographic analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate geographic analytics' },
      { status: 500 }
    );
  }
}