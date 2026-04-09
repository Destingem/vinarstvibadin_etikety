import { NextRequest, NextResponse } from 'next/server';
import { TrendAnalyzer, PredictionEngine, AnomalyDetector } from '@/lib/advanced-analytics';
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
    const startDate = searchParams.get('startDate') || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];
    const analysisType = searchParams.get('type') || 'trends';

    // Get scan events data
    const scanEvents = await adminDatabases.listDocuments(
      ANALYTICS_DB_ID,
      SCAN_EVENTS_COLLECTION_ID,
      [
        Query.equal('wineryId', wineryId),
        Query.greaterThanEqual('date', startDate),
        Query.lessThanEqual('date', endDate),
        Query.orderAsc('date'),
        Query.limit(5000)
      ]
    );

    // Process data into time series
    const dailyScans = new Map<string, number>();
    scanEvents.documents.forEach(event => {
      const date = event.date;
      dailyScans.set(date, (dailyScans.get(date) || 0) + 1);
    });

    // Fill missing dates with 0
    const timeSeriesData = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      timeSeriesData.push({
        date: dateStr,
        value: dailyScans.get(dateStr) || 0
      });
    }

    switch (analysisType) {
      case 'trends':
        if (timeSeriesData.length < 7) {
          return NextResponse.json({ error: 'Insufficient data for trend analysis' }, { status: 400 });
        }
        
        const trendAnalysis = TrendAnalyzer.analyzeTrends(timeSeriesData);
        return NextResponse.json({
          analysis: trendAnalysis,
          dataPoints: timeSeriesData.length,
          period: { startDate, endDate }
        });

      case 'predictions':
        if (timeSeriesData.length < 14) {
          return NextResponse.json({ error: 'Insufficient data for predictions' }, { status: 400 });
        }
        
        const predictions = PredictionEngine.predict(timeSeriesData);
        
        // Generate prediction time series
        const predictionDates: string[] = [];
        const today = new Date();
        for (let i = 1; i <= 30; i++) {
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + i);
          predictionDates.push(futureDate.toISOString().split('T')[0]);
        }

        const predictionSeries = predictions.next30Days.map((value, index) => ({
          date: predictionDates[index],
          value: Math.round(value),
          confidence: predictions.confidence,
          type: 'prediction'
        }));

        return NextResponse.json({
          predictions,
          historical: timeSeriesData.map(d => ({ ...d, type: 'historical' })),
          future: predictionSeries,
          scenarios: [
            {
              name: 'Optimistický',
              data: predictionSeries.map(p => ({ 
                date: p.date, 
                value: Math.round(p.value * 1.2) 
              })),
              probability: 0.25
            },
            {
              name: 'Realistický',
              data: predictionSeries.map(p => ({ 
                date: p.date, 
                value: p.value 
              })),
              probability: 0.5
            },
            {
              name: 'Konzervativní',
              data: predictionSeries.map(p => ({ 
                date: p.date, 
                value: Math.round(p.value * 0.8) 
              })),
              probability: 0.25
            }
          ]
        });

      case 'anomalies':
        if (timeSeriesData.length < 30) {
          return NextResponse.json({ error: 'Insufficient data for anomaly detection' }, { status: 400 });
        }
        
        const anomalies = AnomalyDetector.detect(timeSeriesData);
        
        // Add anomaly flags to time series data
        const dataWithAnomalies = timeSeriesData.map(point => {
          const anomaly = anomalies.anomalies.find(a => a.date === point.date);
          return {
            ...point,
            isAnomaly: !!anomaly,
            severity: anomaly?.severity,
            expectedValue: anomaly?.expectedValue,
            explanation: anomaly?.explanation
          };
        });

        return NextResponse.json({
          anomalies,
          dataWithAnomalies,
          summary: {
            totalAnomalies: anomalies.anomalies.length,
            highSeverity: anomalies.anomalies.filter(a => a.severity === 'high').length,
            mediumSeverity: anomalies.anomalies.filter(a => a.severity === 'medium').length,
            lowSeverity: anomalies.anomalies.filter(a => a.severity === 'low').length
          }
        });

      case 'comprehensive':
        // Comprehensive analysis combining all methods
        if (timeSeriesData.length < 30) {
          return NextResponse.json({ error: 'Insufficient data for comprehensive analysis' }, { status: 400 });
        }

        const [trends, predictionData, anomalyData] = await Promise.all([
          Promise.resolve(TrendAnalyzer.analyzeTrends(timeSeriesData)),
          Promise.resolve(PredictionEngine.predict(timeSeriesData)),
          Promise.resolve(AnomalyDetector.detect(timeSeriesData))
        ]);

        // Advanced insights
        const insights = {
          marketMomentum: trends.direction === 'increasing' && trends.strength > 0.6 ? 'strong_positive' :
                         trends.direction === 'decreasing' && trends.strength > 0.6 ? 'strong_negative' :
                         trends.direction === 'volatile' ? 'volatile' : 'stable',
          
          predictabilityScore: predictionData.confidence,
          
          volatilityRisk: anomalyData.anomalies.length > timeSeriesData.length * 0.1 ? 'high' :
                         anomalyData.anomalies.length > timeSeriesData.length * 0.05 ? 'medium' : 'low',
          
          seasonalityStrength: trends.seasonality.detected ? 'strong' : 'weak',
          
          growthPotential: trends.projectedNext30Days > timeSeriesData[timeSeriesData.length - 1].value ? 'positive' : 'negative',
          
          dataQuality: timeSeriesData.filter(d => d.value > 0).length / timeSeriesData.length > 0.7 ? 'good' : 'poor'
        };

        // Strategic recommendations
        const recommendations = [];
        
        if (insights.marketMomentum === 'strong_positive') {
          recommendations.push({
            type: 'opportunity',
            priority: 'high',
            action: 'Capitalize on Growth',
            description: 'Silný rostoucí trend naznačuje příležitost k rozšíření marketingu a zvýšení produkce.'
          });
        }
        
        if (insights.volatilityRisk === 'high') {
          recommendations.push({
            type: 'warning',
            priority: 'medium',
            action: 'Monitor Stability',
            description: 'Vysoká volatilita vyžaduje pečlivé sledování a možné úpravy strategie.'
          });
        }
        
        if (trends.seasonality.detected) {
          recommendations.push({
            type: 'insight',
            priority: 'medium',
            action: 'Leverage Seasonality',
            description: 'Detekovaná sezónnost umožňuje optimalizaci marketingu podle času roku.'
          });
        }

        return NextResponse.json({
          comprehensive: {
            trends,
            predictions: predictionData,
            anomalies: anomalyData,
            insights,
            recommendations,
            summary: {
              totalDataPoints: timeSeriesData.length,
              analysisConfidence: (trends.confidence + predictionData.confidence + anomalyData.confidence) / 3,
              trendDirection: trends.direction,
              nextMonthProjection: predictionData.next30Days.reduce((sum, val) => sum + val, 0)
            }
          }
        });

      default:
        return NextResponse.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Predictive analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate predictive analytics' },
      { status: 500 }
    );
  }
}
