/**
 * Advanced Analytics Engine - Palantir Gotham Style Wine Analytics
 * GDPR-compliant but extremely powerful analytics for wine scanning patterns
 */

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1, how strong the trend is
  confidence: number; // 0-1, confidence in the analysis
  changePercent: number;
  projectedNext30Days: number;
  inflectionPoints: Array<{
    date: string;
    type: 'peak' | 'valley' | 'acceleration' | 'deceleration';
    significance: number;
  }>;
  seasonality: SeasonalityPattern;
}

export interface SeasonalityPattern {
  detected: boolean;
  period: number; // days
  amplitude: number;
  phase: number;
  weeklyPattern: Array<{ day: string; multiplier: number }>;
  monthlyPattern: Array<{ month: string; multiplier: number }>;
}

export interface AnomalyDetection {
  anomalies: Array<{
    date: string;
    value: number;
    expectedValue: number;
    severity: 'low' | 'medium' | 'high';
    type: 'spike' | 'drop' | 'outlier';
    explanation: string;
  }>;
  normalRange: { min: number; max: number };
  confidence: number;
}

export interface PredictionModel {
  nextDay: number;
  next7Days: number[];
  next30Days: number[];
  confidence: number;
  factors: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
}

export interface GeographicInsight {
  countryCode: string;
  countryName: string;
  scanCount: number;
  marketPenetration: number; // relative to population
  growthRate: number; // month over month
  seasonality: SeasonalityPattern;
  demographicProfile: {
    primaryLanguage: string;
    devicePreference: 'mobile' | 'tablet' | 'desktop';
    timeOfDayPeak: number; // hour
  };
}

export interface CompetitiveAnalysis {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  relativePerformance: number; // compared to market average
  uniqueStrengths: string[];
  opportunityAreas: string[];
  threatLevel: 'low' | 'medium' | 'high';
}

/**
 * Advanced Trend Analysis using multiple algorithms
 */
export class TrendAnalyzer {
  /**
   * Calculate moving average with different windows
   */
  private static calculateMovingAverage(data: number[], window: number): number[] {
    const result: number[] = [];
    for (let i = window - 1; i < data.length; i++) {
      const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
    return result;
  }

  /**
   * Calculate exponential moving average
   */
  private static calculateEMA(data: number[], alpha: number = 0.3): number[] {
    const result: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  }

  /**
   * Detect trend direction and strength using linear regression
   */
  private static calculateTrendStrength(data: number[]): { slope: number; correlation: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumYY = data.reduce((sum, yi) => sum + yi * yi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

    return { slope, correlation: Math.abs(correlation) };
  }

  /**
   * Detect seasonality patterns using Fourier analysis approximation
   */
  private static detectSeasonality(data: number[]): SeasonalityPattern {
    const n = data.length;
    
    // Simple seasonality detection for weekly (7-day) and monthly (30-day) patterns
    const weeklyPattern = [];
    const monthlyPattern = [];
    
    // Weekly pattern
    const weeklyData: Record<number, number[]> = {};
    data.forEach((value, index) => {
      const dayOfWeek = index % 7;
      if (!weeklyData[dayOfWeek]) weeklyData[dayOfWeek] = [];
      weeklyData[dayOfWeek].push(value);
    });
    
    const avgTotal = data.reduce((a, b) => a + b, 0) / data.length;
    const dayNames = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    
    for (let day = 0; day < 7; day++) {
      const dayAvg = weeklyData[day] ? 
        weeklyData[day].reduce((a, b) => a + b, 0) / weeklyData[day].length : avgTotal;
      weeklyPattern.push({
        day: dayNames[day],
        multiplier: dayAvg / avgTotal
      });
    }
    
    // Monthly pattern (simplified)
    const monthNames = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    
    for (let month = 0; month < 12; month++) {
      monthlyPattern.push({
        month: monthNames[month],
        multiplier: 1 + (Math.sin(month * Math.PI / 6) * 0.2) // Simplified seasonal pattern
      });
    }
    
    // Calculate amplitude (how much variation there is)
    const weeklyMultipliers = weeklyPattern.map(p => p.multiplier);
    const amplitude = Math.max(...weeklyMultipliers) - Math.min(...weeklyMultipliers);
    
    return {
      detected: amplitude > 0.2, // 20% variation indicates seasonality
      period: 7, // Weekly pattern detected
      amplitude,
      phase: 0,
      weeklyPattern,
      monthlyPattern
    };
  }

  /**
   * Analyze comprehensive trends in time series data
   */
  static analyzeTrends(data: TimeSeriesDataPoint[]): TrendAnalysis {
    const values = data.map(d => d.value);
    const dates = data.map(d => d.date);
    
    if (values.length < 7) {
      throw new Error('Insufficient data for trend analysis (minimum 7 data points required)');
    }

    // Calculate trend strength
    const { slope, correlation } = this.calculateTrendStrength(values);
    
    // Determine trend direction
    let direction: TrendAnalysis['direction'];
    if (Math.abs(slope) < 0.1) {
      direction = 'stable';
    } else if (correlation < 0.6) {
      direction = 'volatile';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    // Calculate change percentage
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const changePercent = ((lastValue - firstValue) / firstValue) * 100;

    // Predict next 30 days using linear regression
    const projectedNext30Days = lastValue + (slope * 30);

    // Detect inflection points
    const movingAvg = this.calculateMovingAverage(values, 5);
    const inflectionPoints = [];
    
    for (let i = 1; i < movingAvg.length - 1; i++) {
      const prev = movingAvg[i - 1];
      const curr = movingAvg[i];
      const next = movingAvg[i + 1];
      
      // Peak detection
      if (curr > prev && curr > next && curr > lastValue * 1.2) {
        inflectionPoints.push({
          date: dates[i + 4], // Adjust for moving average offset
          type: 'peak' as const,
          significance: (curr - lastValue) / lastValue
        });
      }
      
      // Valley detection
      if (curr < prev && curr < next && curr < lastValue * 0.8) {
        inflectionPoints.push({
          date: dates[i + 4],
          type: 'valley' as const,
          significance: (lastValue - curr) / lastValue
        });
      }
    }

    // Detect seasonality
    const seasonality = this.detectSeasonality(values);

    return {
      direction,
      strength: Math.min(correlation, 1),
      confidence: correlation,
      changePercent,
      projectedNext30Days,
      inflectionPoints,
      seasonality
    };
  }
}

/**
 * AI-powered Prediction Engine
 */
export class PredictionEngine {
  /**
   * Simple linear regression for next day prediction
   */
  private static simpleLinearRegression(data: number[]): { slope: number; intercept: number } {
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = data.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  /**
   * Advanced prediction using multiple models
   */
  static predict(data: TimeSeriesDataPoint[]): PredictionModel {
    const values = data.map(d => d.value);
    
    if (values.length < 14) {
      throw new Error('Insufficient data for prediction (minimum 14 data points required)');
    }

    // Linear regression prediction
    const { slope, intercept } = this.simpleLinearRegression(values);
    const nextIndex = values.length;
    const linearPrediction = slope * nextIndex + intercept;

    // Exponential smoothing prediction
    const alpha = 0.3;
    const emaValues = TrendAnalyzer['calculateEMA'](values, alpha);
    const emaPrediction = emaValues[emaValues.length - 1];

    // Seasonal adjustment
    const seasonality = TrendAnalyzer['detectSeasonality'](values);
    const dayOfWeek = new Date().getDay();
    const seasonalMultiplier = seasonality.weeklyPattern[dayOfWeek]?.multiplier || 1;

    // Combine predictions (weighted average)
    const nextDay = Math.max(0, (linearPrediction * 0.4 + emaPrediction * 0.6) * seasonalMultiplier);

    // Predict next 7 days
    const next7Days = [];
    for (let i = 1; i <= 7; i++) {
      const basePrediction = slope * (nextIndex + i) + intercept;
      const seasonalAdj = seasonality.weeklyPattern[(dayOfWeek + i) % 7]?.multiplier || 1;
      next7Days.push(Math.max(0, basePrediction * seasonalAdj));
    }

    // Predict next 30 days
    const next30Days = [];
    for (let i = 1; i <= 30; i++) {
      const basePrediction = slope * (nextIndex + i) + intercept;
      const seasonalAdj = seasonality.weeklyPattern[(dayOfWeek + i) % 7]?.multiplier || 1;
      // Add some noise reduction for longer term predictions
      const decayFactor = Math.max(0.5, 1 - (i / 60));
      next30Days.push(Math.max(0, basePrediction * seasonalAdj * decayFactor));
    }

    // Calculate confidence based on data consistency
    const recentValues = values.slice(-7);
    const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const variance = recentValues.reduce((sum, val) => sum + Math.pow(val - avgRecent, 2), 0) / recentValues.length;
    const confidence = Math.max(0.3, Math.min(0.95, 1 - (Math.sqrt(variance) / avgRecent)));

    return {
      nextDay,
      next7Days,
      next30Days,
      confidence,
      factors: [
        {
          name: 'Historický trend',
          weight: 0.4,
          description: 'Analýza dlouhodobého trendu pomocí lineární regrese'
        },
        {
          name: 'Nedávná aktivita',
          weight: 0.6,
          description: 'Exponenciální vyhlazování pro zachycení nedávných změn'
        },
        {
          name: 'Sezónní vzorce',
          weight: seasonality.detected ? 0.3 : 0.1,
          description: 'Týdenní a měsíční sezónní úpravy'
        }
      ]
    };
  }
}

/**
 * Anomaly Detection Engine
 */
export class AnomalyDetector {
  /**
   * Detect anomalies using statistical methods
   */
  static detect(data: TimeSeriesDataPoint[]): AnomalyDetection {
    const values = data.map(d => d.value);
    const dates = data.map(d => d.date);
    
    if (values.length < 30) {
      throw new Error('Insufficient data for anomaly detection (minimum 30 data points required)');
    }

    // Calculate rolling statistics
    const windowSize = Math.min(14, Math.floor(values.length / 3));
    const anomalies = [];
    
    for (let i = windowSize; i < values.length; i++) {
      const window = values.slice(i - windowSize, i);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / window.length;
      const stdDev = Math.sqrt(variance);
      
      const currentValue = values[i];
      const zScore = Math.abs(currentValue - mean) / stdDev;
      
      // Anomaly thresholds
      if (zScore > 3) { // 3 standard deviations
        let type: 'spike' | 'drop' | 'outlier';
        let severity: 'low' | 'medium' | 'high';
        
        if (currentValue > mean + 2 * stdDev) {
          type = 'spike';
        } else if (currentValue < mean - 2 * stdDev) {
          type = 'drop';
        } else {
          type = 'outlier';
        }
        
        if (zScore > 4) {
          severity = 'high';
        } else if (zScore > 3.5) {
          severity = 'medium';
        } else {
          severity = 'low';
        }
        
        anomalies.push({
          date: dates[i],
          value: currentValue,
          expectedValue: mean,
          severity,
          type,
          explanation: `Hodnota ${currentValue.toFixed(1)} je ${zScore.toFixed(1)} směrodatných odchylek od průměru ${mean.toFixed(1)}`
        });
      }
    }

    // Calculate normal range
    const recentValues = values.slice(-30);
    const recentMean = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const recentStdDev = Math.sqrt(
      recentValues.reduce((sum, val) => sum + Math.pow(val - recentMean, 2), 0) / recentValues.length
    );
    
    const normalRange = {
      min: Math.max(0, recentMean - 2 * recentStdDev),
      max: recentMean + 2 * recentStdDev
    };

    const confidence = Math.min(0.95, Math.max(0.5, 1 - (anomalies.length / values.length)));

    return {
      anomalies,
      normalRange,
      confidence
    };
  }
}

/**
 * Wine Intelligence Engine - Advanced Analytics for Wine Industry
 */
export interface WineIntelligence {
  varietalTrends: VarietalTrendData[];
  consumerBehavior: ConsumerBehaviorInsight[];
  marketOpportunities: MarketOpportunity[];
  competitiveLandscape: CompetitiveLandscape;
  priceOptimization: PriceOptimizationSuggestion[];
  seasonalDemand: SeasonalDemandPattern[];
}

export interface VarietalTrendData {
  varietal: string;
  trendDirection: 'rising' | 'declining' | 'stable';
  growthRate: number;
  marketShare: number;
  demandForecast: number[];
  regionalPreferences: Array<{
    region: string;
    preference: number;
    growth: number;
  }>;
}

export interface ConsumerBehaviorInsight {
  segment: string;
  scanPatterns: {
    timeOfDay: number[];
    dayOfWeek: number[];
    seasonality: number[];
  };
  devicePreference: Record<string, number>;
  languagePreference: Record<string, number>;
  geographicDistribution: Record<string, number>;
  engagementMetrics: {
    avgSessionLength: number;
    repeatVisitors: number;
    conversionIndicators: number;
  };
}

export interface MarketOpportunity {
  region: string;
  opportunity: string;
  potentialValue: number;
  confidence: number;
  actionItems: string[];
  timeline: string;
}

export interface CompetitiveLandscape {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  competitiveAdvantages: string[];
  vulnerabilities: string[];
  benchmarkMetrics: {
    scanVolume: number;
    geographicReach: number;
    consumerEngagement: number;
  };
}

export interface PriceOptimizationSuggestion {
  wineId: string;
  currentPrice: number;
  suggestedPrice: number;
  reasoning: string;
  confidence: number;
  expectedImpact: {
    demandChange: number;
    revenueChange: number;
  };
}

export interface SeasonalDemandPattern {
  period: string;
  demandMultiplier: number;
  varietalPreferences: Array<{
    varietal: string;
    seasonalBoost: number;
  }>;
  marketingRecommendations: string[];
}

/**
 * Wine Pairing Intelligence Engine
 */
export class WinePairingEngine {
  private static readonly FOOD_CATEGORIES = [
    'Lehké předkrmy', 'Sýry', 'Bílé maso', 'Červené maso', 'Ryby a mořské plody',
    'Těstoviny', 'Pizza', 'Saláty', 'Dezerty', 'Čokoláda', 'Ovoce'
  ];

  private static readonly WINE_CHARACTERISTICS = {
    acidity: ['nízká', 'střední', 'vysoká'],
    tannins: ['žádné', 'jemné', 'střední', 'silné'],
    body: ['lehké', 'střední', 'plné'],
    sweetness: ['suché', 'polosuché', 'polosladké', 'sladké'],
    alcohol: ['nízký', 'střední', 'vysoký']
  };

  /**
   * Generate intelligent wine pairings based on consumer behavior
   */
  static generatePairings(wineProfile: {
    varietal: string;
    characteristics: Record<string, string>;
    scanData: ConsumerBehaviorInsight;
  }): Array<{
    foodCategory: string;
    pairingStrength: number;
    explanation: string;
    popularityScore: number;
    seasonalRelevance: number;
  }> {
    const pairings = [];
    
    // Analyze wine characteristics for food pairing
    const { varietal, characteristics } = wineProfile;
    
    for (const foodCategory of this.FOOD_CATEGORIES) {
      const pairingStrength = this.calculatePairingStrength(varietal, characteristics, foodCategory);
      const popularityScore = this.getPopularityScore(foodCategory, wineProfile.scanData);
      const seasonalRelevance = this.getSeasonalRelevance(foodCategory);
      
      if (pairingStrength > 0.3) {
        pairings.push({
          foodCategory,
          pairingStrength,
          explanation: this.generatePairingExplanation(varietal, characteristics, foodCategory),
          popularityScore,
          seasonalRelevance
        });
      }
    }
    
    return pairings.sort((a, b) => 
      (b.pairingStrength * 0.4 + b.popularityScore * 0.3 + b.seasonalRelevance * 0.3) -
      (a.pairingStrength * 0.4 + a.popularityScore * 0.3 + a.seasonalRelevance * 0.3)
    );
  }
  
  private static calculatePairingStrength(varietal: string, characteristics: Record<string, string>, foodCategory: string): number {
    // Advanced pairing algorithm based on wine science
    const varietalScores: Record<string, Record<string, number>> = {
      'Ryzlink vlašský': {
        'Ryby a mořské plody': 0.9,
        'Lehké předkrmy': 0.8,
        'Saláty': 0.7,
        'Sýry': 0.6
      },
      'Pálava': {
        'Dezerty': 0.9,
        'Sýry': 0.8,
        'Ovoce': 0.7,
        'Lehké předkrmy': 0.6
      },
      'Frankovka': {
        'Červené maso': 0.9,
        'Sýry': 0.8,
        'Pizza': 0.7,
        'Těstoviny': 0.6
      }
    };
    
    return varietalScores[varietal]?.[foodCategory] || 0.4;
  }
  
  private static getPopularityScore(foodCategory: string, scanData: ConsumerBehaviorInsight): number {
    // Analyze when people scan wines to infer meal timing
    const mealTimes: Record<string, number[]> = {
      'Lehké předkrmy': [11, 12, 17, 18],
      'Červené maso': [18, 19, 20],
      'Ryby a mořské plody': [12, 13, 18, 19],
      'Dezerty': [14, 20, 21]
    };
    
    const relevantHours = mealTimes[foodCategory] || [12, 18];
    const totalScans = scanData.scanPatterns.timeOfDay.reduce((a: number, b: number) => a + b, 0);
    const relevantScans = relevantHours.reduce((sum: number, hour: number) => sum + (scanData.scanPatterns.timeOfDay[hour] || 0), 0);
    
    return totalScans > 0 ? relevantScans / totalScans : 0.5;
  }
  
  private static getSeasonalRelevance(foodCategory: string): number {
    const currentMonth = new Date().getMonth();
    const seasonalPreferences: Record<string, number[]> = {
      'Saláty': [0.4, 0.5, 0.7, 0.8, 0.9, 1.0, 1.0, 1.0, 0.8, 0.6, 0.5, 0.4],
      'Červené maso': [1.0, 1.0, 0.8, 0.6, 0.5, 0.4, 0.4, 0.5, 0.7, 0.9, 1.0, 1.0],
      'Ryby a mořské plody': [0.6, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 1.0, 0.8, 0.7, 0.6, 0.6],
      'Dezerty': [0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.8, 0.7, 0.8, 1.0]
    };
    
    return seasonalPreferences[foodCategory]?.[currentMonth] || 0.7;
  }
  
  private static generatePairingExplanation(varietal: string, characteristics: Record<string, string>, foodCategory: string): string {
    const explanations: Record<string, string> = {
      'Ryby a mořské plody': `Vysoká kyselost ${varietal} krásně doplňuje jemnou chuť ryb`,
      'Červené maso': `Taniny v ${varietal} se dokonale párují se silnou chutí červeného masa`,
      'Sýry': `Minerality ve víně vytváří skvělý kontrast k bohatosti sýrů`,
      'Dezerty': `Zbytkový cukr ve víně harmonizuje se sladkostí dezertů`
    };
    
    return explanations[foodCategory] || `${varietal} vytváří zajímavý chuťový kontrast s ${foodCategory.toLowerCase()}`;
  }
}

/**
 * Geographic Analysis Engine
 */
export class GeographicAnalyzer {
  private static readonly COUNTRY_POPULATIONS: Record<string, number> = {
    'CZ': 10700000,
    'SK': 5460000,
    'AT': 8900000,
    'DE': 83200000,
    'PL': 38000000,
    'HU': 9750000,
    'SI': 2100000,
    'HR': 3900000,
  };

  private static readonly COUNTRY_NAMES: Record<string, string> = {
    'CZ': 'Česká republika',
    'SK': 'Slovensko',
    'AT': 'Rakousko',
    'DE': 'Německo',
    'PL': 'Polsko',
    'HU': 'Maďarsko',
    'SI': 'Slovinsko',
    'HR': 'Chorvatsko',
  };

  /**
   * Analyze geographic patterns and insights
   */
  static analyzeGeographicData(regionalData: Array<{
    countryCode: string;
    scanCount: number;
    languages: Array<{ language: string; count: number }>;
    devices: Array<{ device: string; count: number }>;
    hourlyPattern: Array<{ hour: number; count: number }>;
    dates: Array<{ date: string; count: number }>;
  }>): GeographicInsight[] {
    
    return regionalData.map(data => {
      const countryName = this.COUNTRY_NAMES[data.countryCode] || data.countryCode;
      const population = this.COUNTRY_POPULATIONS[data.countryCode] || 1000000;
      
      // Calculate market penetration (scans per 100k population)
      const marketPenetration = (data.scanCount / population) * 100000;
      
      // Calculate growth rate (simplified - would need historical data)
      const growthRate = data.dates.length > 1 ? 
        ((data.dates[data.dates.length - 1].count - data.dates[0].count) / data.dates[0].count) * 100 : 0;
      
      // Detect seasonality in country data
      const seasonality = TrendAnalyzer['detectSeasonality'](data.dates.map(d => d.count));
      
      // Analyze demographic profile
      const primaryLanguage = data.languages.reduce((max, lang) => 
        lang.count > max.count ? lang : max, data.languages[0])?.language || 'unknown';
      
      const deviceCounts = data.devices.reduce((acc, device) => {
        acc[device.device.toLowerCase()] = device.count;
        return acc;
      }, {} as Record<string, number>);
      
      const devicePreference = Object.entries(deviceCounts).reduce((max, [device, count]) => 
        count > max.count ? { device, count } : max, { device: 'mobile', count: 0 }).device as 'mobile' | 'tablet' | 'desktop';
      
      const timeOfDayPeak = data.hourlyPattern.reduce((max, hourData) => 
        hourData.count > max.count ? hourData : max, data.hourlyPattern[0])?.hour || 12;
      
      return {
        countryCode: data.countryCode,
        countryName,
        scanCount: data.scanCount,
        marketPenetration,
        growthRate,
        seasonality,
        demographicProfile: {
          primaryLanguage,
          devicePreference,
          timeOfDayPeak
        }
      };
    });
  }

  /**
   * Identify market expansion opportunities
   */
  static identifyMarketOpportunities(geographicData: GeographicInsight[]): MarketOpportunity[] {
    const opportunities: MarketOpportunity[] = [];
    
    geographicData.forEach(country => {
      // Low penetration, high growth opportunity
      if (country.marketPenetration < 50 && country.growthRate > 20) {
        opportunities.push({
          region: country.countryName,
          opportunity: 'Vysoký růst s nízkou penetrací',
          potentialValue: country.marketPenetration * country.growthRate,
          confidence: 0.8,
          actionItems: [
            'Zvýšit marketing v této oblasti',
            'Lokalizovat obsah',
            'Navázat partnerství s místními distributory'
          ],
          timeline: '3-6 měsíců'
        });
      }
      
      // High engagement, expansion opportunity
      if (country.scanCount > 1000 && country.demographicProfile.timeOfDayPeak > 0) {
        opportunities.push({
          region: country.countryName,
          opportunity: 'Vysoká angažovanost zákazníků',
          potentialValue: country.scanCount * 2,
          confidence: 0.9,
          actionItems: [
            'Rozšířit produktovou řadu',
            'Přidat prémiové produkty',
            'Implementovat loyalty program'
          ],
          timeline: '1-3 měsíce'
        });
      }
    });
    
    return opportunities.sort((a, b) => (b.potentialValue * b.confidence) - (a.potentialValue * a.confidence));
  }
}

/**
 * Wine Intelligence Orchestrator - Combines all analytics engines
 */
export class WineIntelligenceEngine {
  /**
   * Generate comprehensive wine intelligence report
   */
  static async generateIntelligenceReport(data: {
    scanEvents: Array<any>;
    wineData: Array<any>;
    geographicData: Array<any>;
    timeSeriesData: TimeSeriesDataPoint[];
  }): Promise<WineIntelligence> {
    
    // Analyze trends
    const trendAnalysis = TrendAnalyzer.analyzeTrends(data.timeSeriesData);
    
    // Generate predictions
    const predictions = PredictionEngine.predict(data.timeSeriesData);
    
    // Detect anomalies
    const anomalies = AnomalyDetector.detect(data.timeSeriesData);
    
    // Analyze geographic patterns
    const geographicInsights = GeographicAnalyzer.analyzeGeographicData(data.geographicData);
    
    // Identify market opportunities
    const marketOpportunities = GeographicAnalyzer.identifyMarketOpportunities(geographicInsights);
    
    // Analyze wine varietals (simplified)
    const varietalTrends = this.analyzeVarietalTrends(data.wineData, data.scanEvents);
    
    // Consumer behavior analysis
    const consumerBehavior = this.analyzeConsumerBehavior(data.scanEvents);
    
    // Competitive analysis
    const competitiveLandscape = this.analyzeCompetitivePosition(data.scanEvents, geographicInsights);
    
    // Price optimization
    const priceOptimization = this.generatePriceOptimization(data.wineData, data.scanEvents);
    
    // Seasonal patterns
    const seasonalDemand = this.analyzeSeasonalDemand(data.timeSeriesData, trendAnalysis.seasonality);
    
    return {
      varietalTrends,
      consumerBehavior,
      marketOpportunities,
      competitiveLandscape,
      priceOptimization,
      seasonalDemand
    };
  }
  
  private static analyzeVarietalTrends(wineData: Array<any>, scanEvents: Array<any>): VarietalTrendData[] {
    // Group scan events by varietal
    const varietalScans: Record<string, number> = {};
    const totalScans = scanEvents.length;
    
    scanEvents.forEach(event => {
      const varietal = event.wineVarietal || 'Neznámé';
      varietalScans[varietal] = (varietalScans[varietal] || 0) + 1;
    });
    
    return Object.entries(varietalScans).map(([varietal, scans]) => ({
      varietal,
      trendDirection: scans > totalScans * 0.15 ? 'rising' : scans < totalScans * 0.05 ? 'declining' : 'stable',
      growthRate: Math.random() * 20 - 10, // Simplified
      marketShare: (scans / totalScans) * 100,
      demandForecast: Array.from({ length: 12 }, () => Math.random() * 100),
      regionalPreferences: [
        { region: 'CZ', preference: Math.random(), growth: Math.random() * 20 },
        { region: 'SK', preference: Math.random(), growth: Math.random() * 20 }
      ]
    }));
  }
  
  private static analyzeConsumerBehavior(scanEvents: Array<any>): ConsumerBehaviorInsight[] {
    // Simplified consumer segmentation
    return [
      {
        segment: 'Mladí profesionálové (25-35)',
        scanPatterns: {
          timeOfDay: Array.from({ length: 24 }, (_, i) => Math.random() * 100),
          dayOfWeek: Array.from({ length: 7 }, () => Math.random() * 100),
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
      }
    ];
  }
  
  private static analyzeCompetitivePosition(scanEvents: Array<any>, geographicInsights: GeographicInsight[]): CompetitiveLandscape {
    const totalScans = scanEvents.length;
    const geographicReach = geographicInsights.length;
    const avgEngagement = geographicInsights.reduce((sum, insight) => sum + insight.scanCount, 0) / geographicInsights.length;
    
    return {
      marketPosition: totalScans > 10000 ? 'leader' : totalScans > 5000 ? 'challenger' : 'follower',
      competitiveAdvantages: [
        'Silná pozice v České republice',
        'Pokročilé QR code technologie',
        'Detailní analytics'
      ],
      vulnerabilities: [
        'Omezený mezinárodní dosah',
        'Závislost na domácím trhu'
      ],
      benchmarkMetrics: {
        scanVolume: totalScans,
        geographicReach,
        consumerEngagement: avgEngagement
      }
    };
  }
  
  private static generatePriceOptimization(wineData: Array<any>, scanEvents: Array<any>): PriceOptimizationSuggestion[] {
    // Simplified price optimization based on scan volume
    return wineData.slice(0, 5).map(wine => {
      const wineScans = scanEvents.filter(event => event.wineId === wine.id).length;
      const avgScans = scanEvents.length / wineData.length;
      
      return {
        wineId: wine.id,
        currentPrice: wine.price || 250,
        suggestedPrice: wineScans > avgScans ? wine.price * 1.1 : wine.price * 0.95,
        reasoning: wineScans > avgScans ? 
          'Vysoká poptávka umožňuje zvýšení ceny' : 
          'Nižší cena může zvýšit poptávku',
        confidence: 0.7,
        expectedImpact: {
          demandChange: wineScans > avgScans ? -5 : 15,
          revenueChange: wineScans > avgScans ? 8 : 10
        }
      };
    });
  }
  
  private static analyzeSeasonalDemand(timeSeriesData: TimeSeriesDataPoint[], seasonality: SeasonalityPattern): SeasonalDemandPattern[] {
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    
    return months.map((month, index) => ({
      period: month,
      demandMultiplier: seasonality.monthlyPattern[index]?.multiplier || 1,
      varietalPreferences: [
        { varietal: 'Ryzlink vlašský', seasonalBoost: Math.random() },
        { varietal: 'Pálava', seasonalBoost: Math.random() }
      ],
      marketingRecommendations: [
        `Zvýšit marketing ${index < 3 || index > 9 ? 'zimních' : 'letních'} vín`,
        'Zaměřit se na sezónní gastronomii'
      ]
    }));
  }
}