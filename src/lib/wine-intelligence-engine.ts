/**
 * Wine Intelligence Engine - Palantir Gotham Style Analytics
 * Extracts actionable business intelligence from wine scan data
 */

export interface ScanEvent {
  ipAddress?: string;
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
  date: string;
  hour: number;
}

export interface WineIntelligence {
  wine: {
    id: string;
    name: string;
    vintage: string;
    batch: string;
  };
  demographics: {
    primaryDevice: string;
    primaryOS: string;
    primaryLanguage: string;
    primaryCountry: string;
    deviceDistribution: Record<string, number>;
    osDistribution: Record<string, number>;
  };
  behavior: {
    peakHours: number[];
    peakDays: string[];
    scanFrequency: number;
    geographicSpread: number;
    loyaltyScore: number;
  };
  businessIntelligence: {
    priceOptimization: {
      suggestedPriceMultiplier: number;
      reasoning: string;
      confidence: number;
    };
    marketingInsights: string[];
    competitiveAdvantages: string[];
    riskFactors: string[];
  };
  predictions: {
    nextWeekScans: number;
    nextMonthScans: number;
    seasonalTrends: Array<{
      month: string;
      expectedMultiplier: number;
    }>;
  };
}

export interface MarketSegment {
  name: string;
  characteristics: {
    devices: string[];
    operatingSystems: string[];
    countries: string[];
    languages: string[];
    timePatterns: string[];
  };
  size: number;
  value: 'premium' | 'standard' | 'budget';
  wines: Array<{
    wineId: string;
    wineName: string;
    scanCount: number;
    dominance: number; // 0-1, how much this segment loves this wine
  }>;
  insights: string[];
}

/**
 * Advanced Wine Intelligence Engine
 */
export class WineIntelligenceEngine {
  
  /**
   * Analyze individual wine performance and extract business intelligence
   */
  static analyzeWinePerformance(wineId: string, scanEvents: ScanEvent[]): WineIntelligence {
    const wineScans = scanEvents.filter(event => event.wineId === wineId);
    
    if (wineScans.length === 0) {
      throw new Error('No scan data available for this wine');
    }

    const wine = {
      id: wineId,
      name: wineScans[0].wineName,
      vintage: wineScans[0].wineVintage || 'N/A',
      batch: wineScans[0].wineBatch || 'N/A'
    };

    // Demographic Analysis
    const demographics = this.analyzeDemographics(wineScans);
    
    // Behavioral Analysis
    const behavior = this.analyzeBehavior(wineScans);
    
    // Business Intelligence
    const businessIntelligence = this.generateBusinessIntelligence(wineScans, demographics, behavior);
    
    // Predictions
    const predictions = this.generatePredictions(wineScans, behavior);

    return {
      wine,
      demographics,
      behavior,
      businessIntelligence,
      predictions
    };
  }

  /**
   * Analyze demographic patterns in scan data
   */
  private static analyzeDemographics(scans: ScanEvent[]) {
    const deviceCounts = this.countOccurrences(scans.map(s => s.deviceType));
    const osCounts = this.countOccurrences(scans.map(s => s.operatingSystem).filter(Boolean));
    const languageCounts = this.countOccurrences(scans.map(s => s.languageUsed).filter(Boolean));
    const countryCounts = this.countOccurrences(scans.map(s => s.countryCode).filter(Boolean));

    return {
      primaryDevice: this.getPrimary(deviceCounts),
      primaryOS: this.getPrimary(osCounts),
      primaryLanguage: this.getPrimary(languageCounts),
      primaryCountry: this.getPrimary(countryCounts),
      deviceDistribution: this.toPercentages(deviceCounts),
      osDistribution: this.toPercentages(osCounts)
    };
  }

  /**
   * Analyze behavioral patterns
   */
  private static analyzeBehavior(scans: ScanEvent[]) {
    const hourCounts = this.countOccurrences(scans.map(s => s.hour));
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    const dateCounts = this.countOccurrences(scans.map(s => s.date));
    const uniqueCountries = new Set(scans.map(s => s.countryCode).filter(Boolean)).size;
    
    // Calculate loyalty score based on repeat scanning patterns
    const ipCounts = this.countOccurrences(scans.map(s => s.ipAddress).filter(Boolean));
    const repeatScanners = Object.values(ipCounts).filter(count => count > 1).length;
    const loyaltyScore = repeatScanners / Object.keys(ipCounts).length;

    return {
      peakHours,
      peakDays: Object.keys(dateCounts),
      scanFrequency: scans.length / Math.max(Object.keys(dateCounts).length, 1),
      geographicSpread: uniqueCountries,
      loyaltyScore: isNaN(loyaltyScore) ? 0 : loyaltyScore
    };
  }

  /**
   * Generate business intelligence and pricing recommendations
   */
  private static generateBusinessIntelligence(
    scans: ScanEvent[], 
    demographics: any, 
    behavior: any
  ) {
    const insights: string[] = [];
    const competitiveAdvantages: string[] = [];
    const riskFactors: string[] = [];
    
    // Premium market indicators
    const isPremiumMarket = this.detectPremiumMarket(scans, demographics);
    let priceMultiplier = 1.0;
    let reasoning = 'Standardní cena doporučena';
    let confidence = 0.7;

    if (isPremiumMarket.score > 0.7) {
      priceMultiplier = 1.15 + (isPremiumMarket.score - 0.7) * 0.5;
      reasoning = `Prémiová poptávka detekována: ${isPremiumMarket.reasons.join(', ')}`;
      confidence = isPremiumMarket.score;
      insights.push('Vysoká koncentrace prémiových uživatelů');
      competitiveAdvantages.push('Silná pozice v prémiové segmentu');
    }

    // Device-based insights
    if (demographics.primaryDevice === 'MOBILE' && demographics.primaryOS?.includes('iOS')) {
      insights.push('Dominance iOS uživatelů naznačuje vyšší kupní sílu');
      priceMultiplier *= 1.08;
      reasoning += ' + iOS premium efekt';
    }

    // Geographic insights
    if (behavior.geographicSpread > 3) {
      insights.push('Mezinárodní atraktivita vína');
      competitiveAdvantages.push('Široký geografický dosah');
      priceMultiplier *= 1.05;
    } else if (behavior.geographicSpread === 1) {
      riskFactors.push('Omezený geografický dosah');
    }

    // Temporal insights
    if (behavior.peakHours.some((hour: number) => hour >= 17 && hour <= 21)) {
      insights.push('Populární pro večerní konzumaci');
      competitiveAdvantages.push('Vhodné pro prémiové večerní příležitosti');
    }

    // Loyalty insights
    if (behavior.loyaltyScore > 0.3) {
      insights.push('Vysoká zákazníková loajalita');
      competitiveAdvantages.push('Silná zákaznická základna');
      priceMultiplier *= 1.03;
    }

    return {
      priceOptimization: {
        suggestedPriceMultiplier: Math.round(priceMultiplier * 100) / 100,
        reasoning,
        confidence: Math.min(confidence, 0.95)
      },
      marketingInsights: insights,
      competitiveAdvantages,
      riskFactors
    };
  }

  /**
   * Detect premium market characteristics
   */
  private static detectPremiumMarket(scans: ScanEvent[], demographics: any): {
    score: number;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let score = 0;

    // iOS dominance indicates higher purchasing power
    if (demographics.primaryOS?.includes('iOS')) {
      score += 0.3;
      reasons.push('iOS dominance');
    }

    // Evening scanning patterns indicate premium consumption
    const eveningScans = scans.filter(s => s.hour >= 17 && s.hour <= 21).length;
    if (eveningScans / scans.length > 0.4) {
      score += 0.2;
      reasons.push('prémiové večerní konzumace');
    }

    // Multiple languages suggest international/educated audience
    const uniqueLanguages = new Set(scans.map(s => s.languageUsed).filter(Boolean)).size;
    if (uniqueLanguages > 2) {
      score += 0.15;
      reasons.push('mezinárodní publikum');
    }

    // Weekend scanning patterns
    const dates = scans.map(s => new Date(s.date));
    const weekendScans = dates.filter(d => d.getDay() === 0 || d.getDay() === 6).length;
    if (weekendScans / dates.length > 0.3) {
      score += 0.1;
      reasons.push('víkendové konzumace');
    }

    return { score: Math.min(score, 1), reasons };
  }

  /**
   * Generate predictive analytics
   */
  private static generatePredictions(scans: ScanEvent[], behavior: any) {
    const dailyAverage = behavior.scanFrequency;
    const trend = this.calculateTrend(scans);
    
    const nextWeekScans = Math.round(dailyAverage * 7 * (1 + trend));
    const nextMonthScans = Math.round(dailyAverage * 30 * (1 + trend * 0.7));

    // Seasonal patterns based on wine consumption patterns
    const seasonalTrends = [
      { month: 'Leden', expectedMultiplier: 0.8 },
      { month: 'Únor', expectedMultiplier: 0.7 },
      { month: 'Březen', expectedMultiplier: 0.9 },
      { month: 'Duben', expectedMultiplier: 1.1 },
      { month: 'Květen', expectedMultiplier: 1.2 },
      { month: 'Červen', expectedMultiplier: 1.4 },
      { month: 'Červenec', expectedMultiplier: 1.3 },
      { month: 'Srpen', expectedMultiplier: 1.2 },
      { month: 'Září', expectedMultiplier: 1.1 },
      { month: 'Říjen', expectedMultiplier: 1.0 },
      { month: 'Listopad', expectedMultiplier: 1.1 },
      { month: 'Prosinec', expectedMultiplier: 1.3 }
    ];

    return {
      nextWeekScans: Math.max(0, nextWeekScans),
      nextMonthScans: Math.max(0, nextMonthScans),
      seasonalTrends
    };
  }

  /**
   * Identify market segments based on user behavior patterns
   */
  static identifyMarketSegments(scanEvents: ScanEvent[]): MarketSegment[] {
    const segments: MarketSegment[] = [];

    // Premium iOS Segment
    const premiumiOSScans = scanEvents.filter(s => 
      s.operatingSystem?.includes('iOS') && 
      s.deviceType === 'MOBILE' &&
      (s.hour >= 17 && s.hour <= 21)
    );

    if (premiumiOSScans.length > 0) {
      segments.push(this.createSegment(
        'Prémiový iOS segment',
        premiumiOSScans,
        'premium',
        ['Večerní konzumace', 'Vysoká kupní síla', 'Technologicky pokročilí']
      ));
    }

    // International Segment
    const internationalScans = scanEvents.filter(s => 
      s.countryCode && s.countryCode !== 'CZ'
    );

    if (internationalScans.length > 0) {
      segments.push(this.createSegment(
        'Mezinárodní segment',
        internationalScans,
        'standard',
        ['Exportní potenciál', 'Kulturní diverzita', 'Růstové příležitosti']
      ));
    }

    // Desktop Professional Segment
    const desktopScans = scanEvents.filter(s => 
      s.deviceType === 'DESKTOP' &&
      (s.hour >= 9 && s.hour <= 17)
    );

    if (desktopScans.length > 0) {
      segments.push(this.createSegment(
        'Profesionální segment',
        desktopScans,
        'standard',
        ['Pracovní prostředí', 'B2B potenciál', 'Korporátní события']
      ));
    }

    return segments;
  }

  /**
   * Create market segment analysis
   */
  private static createSegment(
    name: string, 
    scans: ScanEvent[], 
    value: 'premium' | 'standard' | 'budget',
    insights: string[]
  ): MarketSegment {
    const devices = [...new Set(scans.map(s => s.deviceType))];
    const operatingSystems = [...new Set(scans.map(s => s.operatingSystem).filter((os): os is string => Boolean(os)))];
    const countries = [...new Set(scans.map(s => s.countryCode).filter((cc): cc is string => Boolean(cc)))];
    const languages = [...new Set(scans.map(s => s.languageUsed).filter((lang): lang is string => Boolean(lang)))];

    // Analyze time patterns
    const hourCounts = this.countOccurrences(scans.map(s => s.hour));
    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => {
        const h = parseInt(hour);
        if (h >= 6 && h < 12) return 'ráno';
        if (h >= 12 && h < 17) return 'odpoledne';
        if (h >= 17 && h < 21) return 'večer';
        return 'noc';
      });

    // Top wines in this segment
    const wineCounts = this.countOccurrences(scans.map(s => s.wineId));
    const wines = Object.entries(wineCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([wineId, scanCount]) => {
        const wineScans = scans.filter(s => s.wineId === wineId);
        return {
          wineId,
          wineName: wineScans[0]?.wineName || 'Unknown',
          scanCount,
          dominance: scanCount / scans.length
        };
      });

    return {
      name,
      characteristics: {
        devices,
        operatingSystems,
        countries,
        languages,
        timePatterns: [...new Set(peakHours)]
      },
      size: scans.length,
      value,
      wines,
      insights
    };
  }

  /**
   * Utility functions
   */
  private static countOccurrences<T>(items: T[]): Record<string, number> {
    return items.reduce((acc, item) => {
      const key = String(item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static getPrimary(counts: Record<string, number>): string {
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
  }

  private static toPercentages(counts: Record<string, number>): Record<string, number> {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    return Object.fromEntries(
      Object.entries(counts).map(([key, count]) => [key, Math.round((count / total) * 100)])
    );
  }

  private static calculateTrend(scans: ScanEvent[]): number {
    if (scans.length < 7) return 0;

    const sortedScans = scans.sort((a, b) => a.date.localeCompare(b.date));
    const dailyCounts = this.countOccurrences(sortedScans.map(s => s.date));
    const dates = Object.keys(dailyCounts).sort();
    
    if (dates.length < 2) return 0;

    const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
    const secondHalf = dates.slice(Math.floor(dates.length / 2));

    const firstAvg = firstHalf.reduce((sum, date) => sum + dailyCounts[date], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, date) => sum + dailyCounts[date], 0) / secondHalf.length;

    return firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
  }
}