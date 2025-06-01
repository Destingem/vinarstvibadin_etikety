'use client';

/**
 * Wine Intelligence Dashboard Components
 * Advanced wine pairing and market intelligence
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WinePairingIntelligenceProps {
  pairings: Array<{
    foodCategory: string;
    pairingStrength: number;
    popularityScore: number;
    seasonalRelevance: number;
    explanation: string;
  }>;
  wineData: {
    name: string;
    varietal: string;
    characteristics: Record<string, string>;
  };
}

export function WinePairingIntelligence({ pairings, wineData }: WinePairingIntelligenceProps) {
  const topPairings = pairings
    .sort((a, b) => b.pairingStrength - a.pairingStrength)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Wine Overview */}
      <Card className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">{wineData.name}</CardTitle>
          <p className="text-purple-200">{wineData.varietal}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(wineData.characteristics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-sm opacity-75 capitalize">{key}</div>
                <div className="font-bold">{value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pairing Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topPairings.map((pairing, index) => {
          const strengthColor = 
            pairing.pairingStrength > 0.8 ? 'bg-green-600' :
            pairing.pairingStrength > 0.6 ? 'bg-yellow-600' :
            pairing.pairingStrength > 0.4 ? 'bg-orange-600' : 'bg-red-600';

          return (
            <Card key={pairing.foodCategory} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pairing.foodCategory}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${strengthColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Strength Bars */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Síla párování</span>
                      <span>{(pairing.pairingStrength * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${strengthColor}`}
                        style={{ width: `${pairing.pairingStrength * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Popularita</span>
                      <span>{(pairing.popularityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${pairing.popularityScore * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sezónnost</span>
                      <span>{(pairing.seasonalRelevance * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-purple-600"
                        style={{ width: `${pairing.seasonalRelevance * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-600 italic">
                      {pairing.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Advanced Pairing Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Pokročilé poznatky o párování</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Best Time to Serve */}
            <div>
              <h4 className="font-bold mb-2 text-green-600">Nejlepší doba podávání</h4>
              <div className="space-y-2">
                {pairings.slice(0, 3).map((pairing, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{pairing.foodCategory}</span>
                    <span className="text-gray-600">
                      {pairing.seasonalRelevance > 0.7 ? 'Aktuální sezóna' : 'Celoročně'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Preferences */}
            <div>
              <h4 className="font-bold mb-2 text-blue-600">Preference zákazníků</h4>
              <div className="space-y-2">
                {pairings
                  .sort((a, b) => b.popularityScore - a.popularityScore)
                  .slice(0, 3)
                  .map((pairing, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{pairing.foodCategory}</span>
                      <span className="text-gray-600">
                        {(pairing.popularityScore * 100).toFixed(0)}% oblíbenost
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Perfect Matches */}
            <div>
              <h4 className="font-bold mb-2 text-purple-600">Dokonalá párování</h4>
              <div className="space-y-2">
                {pairings
                  .filter(p => p.pairingStrength > 0.7)
                  .slice(0, 3)
                  .map((pairing, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{pairing.foodCategory}</span>
                      <span className="text-green-600 font-medium">
                        ★ {(pairing.pairingStrength * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MarketIntelligenceSummaryProps {
  intelligence: {
    varietalTrends: Array<{
      varietal: string;
      trendDirection: 'rising' | 'declining' | 'stable';
      marketShare: number;
      growthRate: number;
    }>;
    marketOpportunities: Array<{
      region: string;
      opportunity: string;
      potentialValue: number;
      confidence: number;
      timeline: string;
    }>;
    competitiveLandscape: {
      marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
      competitiveAdvantages: string[];
      vulnerabilities: string[];
    };
  };
}

export function MarketIntelligenceSummary({ intelligence }: MarketIntelligenceSummaryProps) {
  const { varietalTrends, marketOpportunities, competitiveLandscape } = intelligence;

  const risingVarietals = varietalTrends.filter(v => v.trendDirection === 'rising');
  const topOpportunities = marketOpportunities.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Market Position Overview */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-700 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Tržní pozice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {competitiveLandscape.marketPosition === 'leader' ? 'Líder' :
                 competitiveLandscape.marketPosition === 'challenger' ? 'Vyzyvatel' :
                 competitiveLandscape.marketPosition === 'follower' ? 'Následovník' : 'Niche'}
              </div>
              <div className="text-sm opacity-75">Pozice na trhu</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {competitiveLandscape.competitiveAdvantages.length}
              </div>
              <div className="text-sm opacity-75">Konkurenční výhody</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {topOpportunities.length}
              </div>
              <div className="text-sm opacity-75">Tržní příležitosti</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rising Varietals */}
      <Card>
        <CardHeader>
          <CardTitle>Rostoucí odrůdy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {risingVarietals.map((varietal, index) => (
              <div key={varietal.varietal} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold">{varietal.varietal}</h4>
                  <span className="text-green-600 text-sm">↗ Rostoucí</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tržní podíl:</span>
                    <span className="font-medium">{varietal.marketShare.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Růst:</span>
                    <span className="font-medium text-green-600">
                      +{varietal.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Tržní příležitosti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topOpportunities.map((opportunity, index) => (
              <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-blue-800">{opportunity.region}</h4>
                    <p className="text-blue-600">{opportunity.opportunity}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +{opportunity.potentialValue.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {(opportunity.confidence * 100).toFixed(0)}% jistota
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Časový rámec: {opportunity.timeline}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Konkurenční výhody</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competitiveLandscape.competitiveAdvantages.map((advantage, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  {advantage}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Oblasti pro zlepšení</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {competitiveLandscape.vulnerabilities.map((vulnerability, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-orange-600 mr-2">!</span>
                  {vulnerability}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}