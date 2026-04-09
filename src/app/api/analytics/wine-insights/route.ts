import { NextRequest, NextResponse } from 'next/server';
import { WineIntelligenceEngine } from '@/lib/wine-intelligence-engine';
import { adminDatabases, Query, ANALYTICS_DB_ID } from '@/lib/appwrite-client';
import { getRequestSessionUser } from '@/server/auth/session';

// Collection IDs
const SCAN_EVENTS_COLLECTION_ID = 'scan_events';

export async function GET(request: NextRequest) {
  try {
    const user = await getRequestSessionUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const wineryId = user.id;
    const wineId = searchParams.get('wineId');
    const analysisType = searchParams.get('type') || 'wine-performance';
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    // Get scan events data
    const query = [
      Query.equal('wineryId', wineryId),
      Query.greaterThanEqual('date', startDate),
      Query.lessThanEqual('date', endDate),
      Query.orderDesc('date'),
      Query.limit(10000) // Increased limit for comprehensive analysis
    ];

    // Add wine filter if specific wine requested
    if (wineId && analysisType === 'wine-performance') {
      query.push(Query.equal('wineId', wineId));
    }

    const scanEvents = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      query
    );

    if (scanEvents.documents.length === 0) {
      return NextResponse.json({
        error: 'No scan data available for analysis',
        suggestion: 'Generate QR codes and encourage customers to scan them to collect analytics data'
      }, { status: 404 });
    }

    switch (analysisType) {
      case 'wine-performance':
        if (!wineId) {
          return NextResponse.json({ error: 'Wine ID is required for wine performance analysis' }, { status: 400 });
        }

        try {
          const wineIntelligence = WineIntelligenceEngine.analyzeWinePerformance(wineId, scanEvents.documents as any);
          
          return NextResponse.json({
            analysis: wineIntelligence,
            dataPoints: scanEvents.documents.filter(d => d.wineId === wineId).length,
            period: { startDate, endDate },
            recommendations: generateActionableRecommendations(wineIntelligence)
          });
        } catch (error) {
          return NextResponse.json({
            error: 'Insufficient data for wine performance analysis',
            message: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 400 });
        }

      case 'market-segments':
        try {
          const marketSegments = WineIntelligenceEngine.identifyMarketSegments(scanEvents.documents as any);
          
          // Calculate segment values and ROI potential
          const segmentsWithROI = marketSegments.map(segment => ({
            ...segment,
            roi: calculateSegmentROI(segment),
            marketingRecommendations: generateMarketingRecommendations(segment)
          }));

          return NextResponse.json({
            segments: segmentsWithROI,
            summary: {
              totalSegments: segmentsWithROI.length,
              premiumSegments: segmentsWithROI.filter(s => s.value === 'premium').length,
              totalCustomers: scanEvents.documents.length,
              marketValue: calculateTotalMarketValue(segmentsWithROI)
            },
            strategicInsights: generateStrategicInsights(segmentsWithROI)
          });
        } catch (error) {
          return NextResponse.json({
            error: 'Failed to analyze market segments',
            message: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 });
        }

      case 'competitive-intelligence':
        // Analyze competitive position based on scan patterns
        const competitiveAnalysis = analyzeCompetitivePosition(scanEvents.documents as any);
        
        return NextResponse.json({
          competitive: competitiveAnalysis,
          benchmarks: generateBenchmarks(scanEvents.documents as any),
          opportunities: identifyCompetitiveOpportunities(scanEvents.documents as any)
        });

      case 'pricing-intelligence':
        // Advanced pricing recommendations based on all available data
        const pricingIntelligence = analyzePricingOpportunities(scanEvents.documents as any);
        
        return NextResponse.json({
          pricing: pricingIntelligence,
          portfolio: analyzePortfolioPricing(scanEvents.documents as any),
          timeline: generatePricingTimeline(scanEvents.documents as any)
        });

      case 'comprehensive':
        // Full intelligence report
        const wines = [...new Set(scanEvents.documents.map(d => d.wineId))];
        const wineAnalyses = wines.slice(0, 10).map(id => {
          try {
            return WineIntelligenceEngine.analyzeWinePerformance(id, scanEvents.documents as any);
          } catch {
            return null;
          }
        }).filter(Boolean);

        const marketSegments = WineIntelligenceEngine.identifyMarketSegments(scanEvents.documents as any);
        const competitive = analyzeCompetitivePosition(scanEvents.documents as any);
        const pricing = analyzePricingOpportunities(scanEvents.documents as any);

        return NextResponse.json({
          comprehensive: {
            wineAnalyses,
            marketSegments,
            competitive,
            pricing,
            summary: {
              totalScans: scanEvents.documents.length,
              totalWines: wines.length,
              analysisConfidence: calculateOverallConfidence(scanEvents.documents as any),
              keyOpportunities: identifyKeyOpportunities(wineAnalyses, marketSegments, pricing)
            }
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Wine insights API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate wine insights' },
      { status: 500 }
    );
  }

}

// Helper functions for advanced analysis
function generateActionableRecommendations(intelligence: any): string[] {
    const recommendations: string[] = [];
    
    if (intelligence.businessIntelligence.priceOptimization.suggestedPriceMultiplier > 1.1) {
      recommendations.push(
        `Zvyšte cenu o ${((intelligence.businessIntelligence.priceOptimization.suggestedPriceMultiplier - 1) * 100).toFixed(0)}% - ${intelligence.businessIntelligence.priceOptimization.reasoning}`
      );
    }

    intelligence.businessIntelligence.marketingInsights.forEach((insight: string) => {
      recommendations.push(`Marketing: ${insight}`);
    });

    if (intelligence.behavior.geographicSpread > 2) {
      recommendations.push('Rozšiřte export do dalších zemí - mezinárodní zájem detekován');
    }

    return recommendations;
  }

function calculateSegmentROI(segment: any): number {
    const baseROI = segment.value === 'premium' ? 1.5 : segment.value === 'standard' ? 1.0 : 0.7;
    const sizeMultiplier = Math.min(segment.size / 100, 2); // Cap at 2x for very large segments
    return Math.round(baseROI * sizeMultiplier * 100) / 100;
  }

function generateMarketingRecommendations(segment: any): string[] {
    const recommendations: string[] = [];
    
    if (segment.characteristics.devices.includes('MOBILE')) {
      recommendations.push('Mobilní-optimalizované kampaně');
    }
    
    if (segment.characteristics.operatingSystems.some((os: string) => os.includes('iOS'))) {
      recommendations.push('Prémiové iOS reklamní formáty');
    }
    
    if (segment.characteristics.timePatterns.includes('večer')) {
      recommendations.push('Večerní social media kampaně');
    }

    return recommendations;
  }

function calculateTotalMarketValue(segments: any[]): number {
    return segments.reduce((total, segment) => total + (segment.size * segment.roi), 0);
  }

function generateStrategicInsights(segments: any[]): string[] {
    const insights: string[] = [];
    
    const premiumSegments = segments.filter(s => s.value === 'premium');
    if (premiumSegments.length > 0) {
      insights.push(`${premiumSegments.length} prémiových segmentů identifikováno s vysokým potenciálem ROI`);
    }

    const internationalSegment = segments.find(s => s.name.includes('Mezinárodní'));
    if (internationalSegment) {
      insights.push(`Mezinárodní exportní příležitost: ${internationalSegment.size} zákazníků`);
    }

    return insights;
  }

function analyzeCompetitivePosition(scans: any[]) {
    const uniqueCountries = new Set(scans.map(s => s.countryCode).filter(Boolean)).size;
    const deviceDiversity = new Set(scans.map(s => s.deviceType)).size;
    const peakTimes = scans.reduce((acc, scan) => {
      acc[scan.hour] = (acc[scan.hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      geographicReach: uniqueCountries,
      technologicalAdoption: deviceDiversity,
      marketTiming: Object.entries(peakTimes).sort(([,a], [,b]) => (b as number) - (a as number)).slice(0, 3),
      competitiveStrength: uniqueCountries * deviceDiversity * scans.length
    };
  }

function generateBenchmarks(scans: any[]) {
    return {
      scansPerDay: scans.length / 30,
      internationalPercentage: (scans.filter(s => s.countryCode !== 'CZ').length / scans.length) * 100,
      mobileAdoption: (scans.filter(s => s.deviceType === 'MOBILE').length / scans.length) * 100,
      peakEfficiency: Math.max(...Object.values(scans.reduce((acc: any, scan: any) => {
        acc[scan.hour] = (acc[scan.hour] || 0) + 1;
        return acc;
      }, {})) as number[])
    };
  }

function identifyCompetitiveOpportunities(scans: any[]): string[] {
    const opportunities: string[] = [];
    
    const internationalRatio = scans.filter(s => s.countryCode !== 'CZ').length / scans.length;
    if (internationalRatio < 0.2) {
      opportunities.push('Potenciál pro mezinárodní expanzi - nízká současná penetrace');
    }

    const iosRatio = scans.filter(s => s.operatingSystem?.includes('iOS')).length / scans.length;
    if (iosRatio > 0.6) {
      opportunities.push('Silná pozice v prémiové iOS segmentu - využijte pro premium positioning');
    }

    return opportunities;
  }

function analyzePricingOpportunities(scans: any[]) {
    // Country-specific pricing tolerance factors (1.0 = baseline Czech Republic)
    const countryPricingTolerance: Record<string, number> = {
      'CH': 2.5,  // Switzerland - very high purchasing power relative to CZ
      'NO': 2.3,  // Norway - high purchasing power  
      'LU': 2.1,  // Luxembourg - high income
      'US': 1.8,  // United States - premium market
      'JP': 1.7,  // Japan - premium appreciation
      'SG': 1.6,  // Singapore - affluent market
      'AU': 1.5,  // Australia - strong wine market
      'DK': 1.4,  // Denmark - high purchasing power
      'SE': 1.4,  // Sweden - strong economy
      'NL': 1.4,  // Netherlands - affluent market
      'DE': 1.3,  // Germany - strong economy, neighboring market
      'AT': 1.3,  // Austria - neighboring premium market
      'CN': 1.3,  // China - growing premium segment
      'CA': 1.2,  // Canada - stable premium market
      'UK': 1.2,  // United Kingdom - premium market
      'FR': 1.1,  // France - wine culture, moderate premium tolerance
      'IT': 1.0,  // Italy - wine culture, similar to CZ
      'CZ': 1.0,  // Czech Republic - baseline
      'SI': 0.95, // Slovenia - similar market, slightly lower
      'ES': 0.9,  // Spain - wine culture but more price conscious
      'SK': 0.85, // Slovakia - similar market, lower purchasing power
      'PL': 0.8,  // Poland - price sensitive market
      'HU': 0.75, // Hungary - developing market
      'HR': 0.7,  // Croatia - developing market
      'RS': 0.65, // Serbia - price sensitive
      'RO': 0.6,  // Romania - developing market
      'BG': 0.55, // Bulgaria - price conscious
      'RU': 0.5,  // Russia - variable market, sanctions impact
      'UA': 0.4,  // Ukraine - economic challenges
      'BY': 0.4,  // Belarus - limited purchasing power
    };

    // OS premium indicators
    const osPremiumFactor: Record<string, number> = {
      'iOS': 1.3, 'macOS': 1.4, 'Windows': 1.0, 'Android': 0.9, 'Linux': 1.1, 'Unknown': 0.8
    };

    // Temporal sophistication patterns
    const getTemporalScore = (hour: number): number => {
      if (hour >= 18 && hour <= 22) return 1.3; // Premium evening
      if (hour >= 12 && hour <= 14) return 1.1; // Business lunch
      if (hour >= 15 && hour <= 17) return 1.2; // Afternoon leisure
      if (hour >= 8 && hour <= 11) return 0.9;  // Morning
      if (hour >= 23 || hour <= 7) return 0.8;  // Late night/early morning
      return 1.0;
    };

    // Seasonal patterns
    const getSeasonalMultiplier = (date: string): number => {
      const month = new Date(date).getMonth() + 1;
      const factors = { 1: 0.8, 2: 0.7, 3: 0.9, 4: 1.1, 5: 1.2, 6: 1.4, 7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 1.1, 12: 1.3 };
      return factors[month as keyof typeof factors] || 1.0;
    };

    const wineScans = scans.reduce((acc, scan) => {
      acc[scan.wineId] = (acc[scan.wineId] || []);
      acc[scan.wineId].push(scan);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(wineScans).map(([wineId, wineScans]) => {
      const typedWineScans = wineScans as any[];
      // Geographic pricing tolerance
      const countryScores = typedWineScans.map(s => countryPricingTolerance[s.countryCode] || 1.0);
      const avgCountryTolerance = countryScores.reduce((sum, score) => sum + score, 0) / countryScores.length;
      
      // Operating system premium indicators
      const osScores = typedWineScans.map(s => {
        const os = s.operatingSystem || 'Unknown';
        const foundKey = Object.keys(osPremiumFactor).find(key => os.includes(key));
        return foundKey ? osPremiumFactor[foundKey] : osPremiumFactor.Unknown;
      });
      const avgOsPremium = osScores.reduce((sum, score) => sum + score, 0) / osScores.length;
      
      // Temporal sophistication
      const temporalScores = typedWineScans.map(s => getTemporalScore(s.hour));
      const avgTemporalScore = temporalScores.reduce((sum, score) => sum + score, 0) / temporalScores.length;
      
      // Seasonal patterns
      const seasonalScores = typedWineScans.map(s => getSeasonalMultiplier(s.date));
      const avgSeasonalScore = seasonalScores.reduce((sum, score) => sum + score, 0) / seasonalScores.length;
      
      // User loyalty and repeat behavior
      const ipCounts = typedWineScans.reduce((acc: Record<string, number>, scan) => {
        if (scan.ipAddress) acc[scan.ipAddress] = (acc[scan.ipAddress] || 0) + 1;
        return acc;
      }, {});
      const repeatUsers = Object.values(ipCounts).filter(count => count > 1).length;
      const loyaltyScore = Object.keys(ipCounts).length > 0 ? (repeatUsers / Object.keys(ipCounts).length) : 0;
      
      // International appeal
      const uniqueCountries = new Set(typedWineScans.map(s => s.countryCode).filter(Boolean)).size;
      
      // Language diversity
      const uniqueLanguages = new Set(typedWineScans.map(s => s.languageUsed).filter(Boolean)).size;
      
      // Weekend vs weekday patterns
      const weekendScans = typedWineScans.filter(s => [0, 6].includes(new Date(s.date).getDay())).length;
      const weekendRatio = weekendScans / typedWineScans.length;
      
      // Volume-based confidence
      const volumeConfidence = Math.min(typedWineScans.length / 100, 1);
      
      // Comprehensive premium score calculation
      const premiumScore = (
        avgCountryTolerance * 0.25 +     // Geographic purchasing power
        avgOsPremium * 0.20 +            // Device/OS sophistication  
        avgTemporalScore * 0.15 +        // Consumption timing
        avgSeasonalScore * 0.10 +        // Seasonal patterns
        (1 + loyaltyScore * 0.2) * 0.10 + // Customer loyalty
        Math.min(1 + (uniqueCountries - 1) * 0.05, 1.3) * 0.10 + // International appeal
        Math.min(1 + (uniqueLanguages - 1) * 0.03, 1.15) * 0.05 + // Language diversity
        (1 + weekendRatio * 0.1) * 0.05   // Leisure consumption
      ) / 8;
      
      // Price multiplier with confidence weighting
      const baseMultiplier = 0.8 + (premiumScore * 0.6);
      const confidenceAdjustedMultiplier = baseMultiplier * volumeConfidence + (1.0 * (1 - volumeConfidence));
      
      return {
        wineId,
        wineName: typedWineScans[0].wineName,
        scanCount: typedWineScans.length,
        premiumScore: Math.round(premiumScore * 100) / 100,
        suggestedPriceMultiplier: Math.round(confidenceAdjustedMultiplier * 100) / 100,
        reasoning: generateComprehensivePricingReasoning({
          avgCountryTolerance, avgOsPremium, avgTemporalScore, avgSeasonalScore,
          loyaltyScore, uniqueCountries, uniqueLanguages, weekendRatio, volumeConfidence
        }),
        confidence: volumeConfidence,
        metrics: {
          countryTolerance: Math.round(avgCountryTolerance * 100) / 100,
          osPremium: Math.round(avgOsPremium * 100) / 100,
          temporalScore: Math.round(avgTemporalScore * 100) / 100,
          seasonalScore: Math.round(avgSeasonalScore * 100) / 100,
          loyaltyScore: Math.round(loyaltyScore * 100) / 100,
          internationalAppeal: uniqueCountries,
          languageDiversity: uniqueLanguages
        }
      };
    }).sort((a, b) => b.premiumScore - a.premiumScore);
  }

function generateComprehensivePricingReasoning(metrics: {
    avgCountryTolerance: number;
    avgOsPremium: number;
    avgTemporalScore: number;
    avgSeasonalScore: number;
    loyaltyScore: number;
    uniqueCountries: number;
    uniqueLanguages: number;
    weekendRatio: number;
    volumeConfidence: number;
  }): string {
    const reasons: string[] = [];
    
    // Country tolerance analysis
    if (metrics.avgCountryTolerance > 1.2) {
      reasons.push('vysoká kupní síla (geografická)');
    } else if (metrics.avgCountryTolerance < 0.8) {
      reasons.push('cenově citlivý trh');
    }
    
    // OS sophistication
    if (metrics.avgOsPremium > 1.2) {
      reasons.push('prémiové zařízení/OS');
    }
    
    // Temporal patterns
    if (metrics.avgTemporalScore > 1.2) {
      reasons.push('prémiové časové vzorce');
    }
    
    // Seasonal advantage
    if (metrics.avgSeasonalScore > 1.1) {
      reasons.push('sezónní výhoda');
    }
    
    // Customer loyalty
    if (metrics.loyaltyScore > 0.3) {
      reasons.push('vysoká loajalita zákazníků');
    }
    
    // International appeal
    if (metrics.uniqueCountries > 3) {
      reasons.push('mezinárodní atraktivita');
    }
    
    // Language diversity
    if (metrics.uniqueLanguages > 2) {
      reasons.push('jazyková diverzita');
    }
    
    // Weekend leisure consumption
    if (metrics.weekendRatio > 0.4) {
      reasons.push('rekreační konzumace');
    }
    
    // Data confidence warning
    if (metrics.volumeConfidence < 0.5) {
      reasons.push('(omezená data)');
    }
    
    return reasons.length > 0 ? reasons.join(', ') : 'standardní profil';
  }

  function generatePricingReasoning(iosRatio: number, eveningRatio: number, internationalRatio: number): string {
    // Legacy function kept for compatibility
    const reasons: string[] = [];
    
    if (iosRatio > 0.5) reasons.push('vysoká iOS adopce');
    if (eveningRatio > 0.4) reasons.push('prémiové večerní konzumace');
    if (internationalRatio > 0.3) reasons.push('mezinárodní zájem');
    
    return reasons.length > 0 ? reasons.join(', ') : 'standardní profil';
  }

function analyzePortfolioPricing(scans: any[]) {
    const pricing = analyzePricingOpportunities(scans);
    
    return {
      premiumWines: pricing.filter(w => w.premiumScore > 0.7).length,
      standardWines: pricing.filter(w => w.premiumScore >= 0.3 && w.premiumScore <= 0.7).length,
      budgetWines: pricing.filter(w => w.premiumScore < 0.3).length,
      averagePremiumScore: pricing.reduce((sum, w) => sum + w.premiumScore, 0) / pricing.length,
      topPerformers: pricing.slice(0, 3)
    };
  }

function generatePricingTimeline(scans: any[]): Array<{timeframe: string, action: string, expected_impact: string}> {
    return [
      {
        timeframe: 'Okamžitě',
        action: 'Implementujte prémiové ceny pro top iOS vína',
        expected_impact: '+8-15% revenue'
      },
      {
        timeframe: '1-2 týdny',
        action: 'A/B testujte ceny v mezinárodních trzích',
        expected_impact: '+5-10% mezinárodní sales'
      },
      {
        timeframe: '1 měsíc',
        action: 'Spusťte prémiové večerní kampaně',
        expected_impact: '+12-20% večerní prodeje'
      }
    ];
  }

function calculateOverallConfidence(scans: any[]): number {
    const dataPoints = scans.length;
    const timeSpread = new Set(scans.map(s => s.date)).size;
    const diversity = new Set(scans.map(s => `${s.deviceType}-${s.countryCode}`)).size;
    
    const confidence = Math.min(
      (dataPoints / 1000) * 0.4 +
      (timeSpread / 30) * 0.3 +
      (diversity / 10) * 0.3,
      0.95
    );
    
    return Math.round(confidence * 100) / 100;
  }

function identifyKeyOpportunities(wines: any[], segments: any[], pricing: any[]): string[] {
    const opportunities: string[] = [];
    
    const premiumWines = wines.filter(w => 
      w.businessIntelligence.priceOptimization.suggestedPriceMultiplier > 1.1
    );
    
    if (premiumWines.length > 0) {
      opportunities.push(`${premiumWines.length} vín má potenciál pro zvýšení ceny`);
    }
    
    const premiumSegments = segments.filter(s => s.value === 'premium');
    if (premiumSegments.length > 0) {
      opportunities.push(`${premiumSegments.length} prémiových segmentů pro cílený marketing`);
    }
    
    return opportunities;
  }
