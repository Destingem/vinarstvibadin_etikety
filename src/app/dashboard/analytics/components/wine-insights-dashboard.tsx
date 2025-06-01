'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WineIntelligence {
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

interface MarketSegment {
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
    dominance: number;
  }>;
  insights: string[];
  roi: number;
  marketingRecommendations: string[];
}

interface PricingIntelligence {
  wineId: string;
  wineName: string;
  scanCount: number;
  premiumScore: number;
  suggestedPriceMultiplier: number;
  reasoning: string;
  confidence?: number;
  metrics?: {
    countryTolerance: number;
    osPremium: number;
    temporalScore: number;
    seasonalScore: number;
    loyaltyScore: number;
    internationalAppeal: number;
    languageDiversity: number;
  };
}

interface WineInsightsDashboardProps {
  wineryId: string;
}

export function WineInsightsDashboard({ wineryId }: WineInsightsDashboardProps) {
  const { token } = useAuth();
  const [selectedWineId, setSelectedWineId] = useState<string>('');
  const [wines, setWines] = useState<Array<{ id: string; name: string }>>([]);
  const [wineIntelligence, setWineIntelligence] = useState<WineIntelligence | null>(null);
  const [marketSegments, setMarketSegments] = useState<MarketSegment[]>([]);
  const [pricingIntelligence, setPricingIntelligence] = useState<PricingIntelligence[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'wine-analysis' | 'market-segments' | 'pricing-intelligence'>('wine-analysis');

  useEffect(() => {
    if (token) {
      fetchWines();
      fetchMarketSegments();
      fetchPricingIntelligence();
    }
  }, [wineryId, token]);

  useEffect(() => {
    if (selectedWineId && token) {
      fetchWineIntelligence();
    }
  }, [selectedWineId, token]);

  const fetchWines = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/wines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWines(data.wines || []);
        if (data.wines?.length > 0) {
          setSelectedWineId(data.wines[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch wines:', error);
    }
  };

  const fetchWineIntelligence = async () => {
    if (!selectedWineId || !token) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/wine-insights?wineryId=${wineryId}&wineId=${selectedWineId}&type=wine-performance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWineIntelligence(data.analysis);
      }
    } catch (error) {
      console.error('Failed to fetch wine intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketSegments = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/analytics/wine-insights?wineryId=${wineryId}&type=market-segments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMarketSegments(data.segments || []);
      }
    } catch (error) {
      console.error('Failed to fetch market segments:', error);
    }
  };

  const fetchPricingIntelligence = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/analytics/wine-insights?wineryId=${wineryId}&type=pricing-intelligence`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPricingIntelligence(data.pricing || []);
      }
    } catch (error) {
      console.error('Failed to fetch pricing intelligence:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getROIColor = (roi: number) => {
    if (roi >= 1.3) return 'bg-green-100 text-green-800';
    if (roi >= 1.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Wine Intelligence Command Center</h1>
        <p className="text-blue-200">Palantir Gotham-style analytics pro vinařský byznys</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('wine-analysis')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'wine-analysis'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Analýza Vín
        </button>
        <button
          onClick={() => setActiveTab('market-segments')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'market-segments'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Tržní Segmenty
        </button>
        <button
          onClick={() => setActiveTab('pricing-intelligence')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'pricing-intelligence'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Pricing Intelligence
        </button>
      </div>

      {/* Wine Analysis Tab */}
      {activeTab === 'wine-analysis' && (
        <div className="space-y-6">
          {/* Wine Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Vyberte víno pro hlubinnou analýzu</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedWineId}
                onChange={(e) => setSelectedWineId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Vyberte víno...</option>
                {wines.map((wine) => (
                  <option key={wine.id} value={wine.id}>
                    {wine.name}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Wine Intelligence Dashboard */}
          {wineIntelligence && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Business Intelligence */}
              <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    💰 Business Intelligence
                    <span className={`ml-2 text-sm ${getConfidenceColor(wineIntelligence.businessIntelligence.priceOptimization.confidence)}`}>
                      {(wineIntelligence.businessIntelligence.priceOptimization.confidence * 100).toFixed(0)}% spolehlivost
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
                      <h4 className="font-bold text-green-800">Cenová Optimalizace</h4>
                      <div className="text-2xl font-bold text-green-600">
                        {((wineIntelligence.businessIntelligence.priceOptimization.suggestedPriceMultiplier - 1) * 100).toFixed(0)}% zvýšení doporučeno
                      </div>
                      <p className="text-sm text-green-700 mt-2">
                        {wineIntelligence.businessIntelligence.priceOptimization.reasoning}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold mb-2">Marketing Insights</h4>
                      <ul className="space-y-1">
                        {wineIntelligence.businessIntelligence.marketingInsights.map((insight, index) => (
                          <li key={index} className="text-sm flex items-center">
                            <span className="text-blue-500 mr-2">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle>👥 Demografická Analýza</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Primární zařízení</div>
                      <div className="font-bold">{wineIntelligence.demographics.primaryDevice}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Primární OS</div>
                      <div className="font-bold">{wineIntelligence.demographics.primaryOS}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Primární jazyk</div>
                      <div className="font-bold">{wineIntelligence.demographics.primaryLanguage}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Primární země</div>
                      <div className="font-bold">{wineIntelligence.demographics.primaryCountry}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Distribuce zařízení</h5>
                    <div className="space-y-2">
                      {Object.entries(wineIntelligence.demographics.deviceDistribution).map(([device, percentage]) => (
                        <div key={device} className="flex justify-between items-center">
                          <span className="text-sm">{device}</span>
                          <div className="flex items-center">
                            <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Behavioral Patterns */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle>🕐 Behavioral Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Peak Hours</div>
                      <div className="font-bold">
                        {wineIntelligence.behavior.peakHours.map(hour => `${hour}:00`).join(', ')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Scan Frequency</div>
                        <div className="font-bold">{wineIntelligence.behavior.scanFrequency.toFixed(1)}/den</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Geographic Spread</div>
                        <div className="font-bold">{wineIntelligence.behavior.geographicSpread} zemí</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Loyalty Score</div>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-3 mr-2">
                          <div 
                            className="bg-orange-600 h-3 rounded-full" 
                            style={{ width: `${wineIntelligence.behavior.loyaltyScore * 100}%` }}
                          />
                        </div>
                        <span className="font-bold">{(wineIntelligence.behavior.loyaltyScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Predictions */}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50">
                <CardHeader>
                  <CardTitle>🔮 Predictive Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {wineIntelligence.predictions.nextWeekScans}
                        </div>
                        <div className="text-sm text-gray-600">Příští týden</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">
                          {wineIntelligence.predictions.nextMonthScans}
                        </div>
                        <div className="text-sm text-gray-600">Příští měsíc</div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">Sezónní trendy (top 3)</h5>
                      <div className="space-y-1">
                        {wineIntelligence.predictions.seasonalTrends
                          .sort((a, b) => b.expectedMultiplier - a.expectedMultiplier)
                          .slice(0, 3)
                          .map((trend, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{trend.month}</span>
                              <span className="font-medium">
                                {(trend.expectedMultiplier * 100).toFixed(0)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Analyzuji data...</span>
            </div>
          )}
        </div>
      )}

      {/* Market Segments Tab */}
      {activeTab === 'market-segments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketSegments.map((segment, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{segment.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getROIColor(segment.roi)}`}>
                      ROI: {segment.roi}x
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Velikost segmentu</div>
                      <div className="font-bold text-lg">{segment.size} zákazníků</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Charakteristiky</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {segment.characteristics.devices.map((device, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {device}
                          </span>
                        ))}
                        {segment.characteristics.timePatterns.map((pattern, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Top víno</div>
                      <div className="font-medium">
                        {segment.wines[0]?.wineName || 'N/A'} 
                        {segment.wines[0] && (
                          <span className="text-sm text-gray-500 ml-1">
                            ({(segment.wines[0].dominance * 100).toFixed(0)}% dominance)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600">Marketing doporučení</div>
                      <ul className="text-xs space-y-1 mt-1">
                        {segment.marketingRecommendations.slice(0, 2).map((rec, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className="text-blue-500 mr-1">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Intelligence Tab */}
      {activeTab === 'pricing-intelligence' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>💎 Comprehensive Pricing Intelligence Ecosystem - AI Doporučení</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Víno</th>
                      <th className="text-left p-2">Skeny</th>
                      <th className="text-left p-2">Premium Score</th>
                      <th className="text-left p-2">Doporučená úprava</th>
                      <th className="text-left p-2">Důvod</th>
                      <th className="text-left p-2">Spolehlivost</th>
                      <th className="text-left p-2">Detaily</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingIntelligence.slice(0, 10).map((wine, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{wine.wineName}</td>
                        <td className="p-2">{wine.scanCount}</td>
                        <td className="p-2">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${wine.premiumScore * 100}%` }}
                              />
                            </div>
                            <span>{(wine.premiumScore * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            wine.suggestedPriceMultiplier > 1.1 ? 'bg-green-100 text-green-800' : 
                            wine.suggestedPriceMultiplier < 0.95 ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {wine.suggestedPriceMultiplier > 1 ? '+' : ''}
                            {((wine.suggestedPriceMultiplier - 1) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-2 text-xs text-gray-600">{wine.reasoning}</td>
                        <td className="p-2">
                          <div className={`text-xs px-2 py-1 rounded ${
                            (wine.confidence || 0) > 0.7 ? 'bg-green-100 text-green-800' :
                            (wine.confidence || 0) > 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {((wine.confidence || 0) * 100).toFixed(0)}%
                          </div>
                        </td>
                        <td className="p-2">
                          {wine.metrics && (
                            <div className="text-xs space-y-1">
                              <div>Země: {wine.metrics.countryTolerance}</div>
                              <div>OS: {wine.metrics.osPremium}</div>
                              <div>Čas: {wine.metrics.temporalScore}</div>
                              <div>Země: {wine.metrics.internationalAppeal}</div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}