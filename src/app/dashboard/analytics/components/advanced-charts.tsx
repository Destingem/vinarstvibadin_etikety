'use client';

/**
 * Advanced Analytics Visualization Components
 * Palantir Gotham-style wine intelligence platform
 * GDPR-compliant advanced analytics for wine industry
 */

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Brush,
  ComposedChart,
  Bar,
  Scatter,
  ScatterChart,
  Cell,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Color palettes for sophisticated visualizations
const COLORS = {
  primary: '#dc2626',
  secondary: '#059669',
  accent: '#7c3aed',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  success: '#10b981',
  gradient: ['#dc2626', '#f87171', '#fca5a5', '#fecaca']
};

interface TrendChartProps {
  data: Array<{
    date: string;
    value: number;
    predicted?: number;
    upperBound?: number;
    lowerBound?: number;
  }>;
  width?: number;
  height?: number;
  showPredictions?: boolean;
  showConfidenceInterval?: boolean;
}

export function AdvancedTrendChart({ 
  data, 
  width = 800, 
  height = 400, 
  showPredictions = true,
  showConfidenceInterval = true 
}: TrendChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('cs-CZ', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [data]);

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.predicted || 0, d.upperBound || 0)));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            value?.toLocaleString('cs-CZ'),
            name === 'value' ? 'Skutečná hodnota' : 
            name === 'predicted' ? 'Predikce' : name
          ]}
        />
        
        {/* Confidence interval area */}
        {showConfidenceInterval && (
          <Area
            type="monotone"
            dataKey="upperBound"
            stroke="none"
            fill={COLORS.primary}
            fillOpacity={0.1}
            stackId="confidence"
          />
        )}
        
        {/* Actual data line */}
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          strokeWidth={3}
          dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
        />
        
        {/* Prediction line */}
        {showPredictions && (
          <Line
            type="monotone"
            dataKey="predicted"
            stroke={COLORS.accent}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: COLORS.accent, strokeWidth: 2, r: 3 }}
          />
        )}
        
        {/* Reference line for current date */}
        <ReferenceLine 
          x={new Date().toLocaleDateString('cs-CZ', { month: 'short', day: 'numeric' })}
          stroke={COLORS.warning}
          strokeDasharray="3 3"
          label={{ value: "Dnes", position: "top" }}
        />
        
        <Brush 
          dataKey="date" 
          height={30} 
          stroke={COLORS.primary}
          fill={`${COLORS.primary}20`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface AnomalyChartProps {
  data: Array<{
    date: string;
    value: number;
    isAnomaly?: boolean;
    severity?: 'low' | 'medium' | 'high';
    expectedValue?: number;
  }>;
  height?: number;
}

export function AnomalyDetectionChart({ data, height = 300 }: AnomalyChartProps) {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('cs-CZ', { 
        month: 'short', 
        day: 'numeric' 
      }),
      anomalyColor: item.isAnomaly ? 
        (item.severity === 'high' ? COLORS.danger :
         item.severity === 'medium' ? COLORS.warning : COLORS.info) : 
        COLORS.primary
    }));
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'value') return [value?.toLocaleString('cs-CZ'), 'Skutečná hodnota'];
            if (name === 'expectedValue') return [value?.toLocaleString('cs-CZ'), 'Očekávaná hodnota'];
            return [value, name];
          }}
        />
        
        {/* Expected value line */}
        <Line
          type="monotone"
          dataKey="expectedValue"
          stroke={COLORS.secondary}
          strokeWidth={1}
          strokeDasharray="3 3"
          dot={false}
        />
        
        {/* Actual values with anomaly highlighting */}
        <Scatter
          dataKey="value"
          fill="#8884d8"
        />
        
        <Line
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface GeographicHeatmapProps {
  data: Array<{
    countryCode: string;
    countryName: string;
    scanCount: number;
    marketPenetration: number;
  }>;
  height?: number;
}

export function GeographicHeatmap({ data, height = 400 }: GeographicHeatmapProps) {
  const maxScans = Math.max(...data.map(d => d.scanCount));
  
  // Create grid layout for countries (simplified European layout)
  const countryPositions: Record<string, { x: number; y: number }> = {
    'DE': { x: 2, y: 1 },
    'PL': { x: 3, y: 1 },
    'CZ': { x: 2, y: 2 },
    'SK': { x: 3, y: 2 },
    'AT': { x: 2, y: 3 },
    'HU': { x: 3, y: 3 },
    'SI': { x: 1, y: 3 },
    'HR': { x: 1, y: 4 },
  };

  const chartData = data.map(country => ({
    ...country,
    ...countryPositions[country.countryCode] || { x: 0, y: 0 },
    intensity: country.scanCount / maxScans,
    size: Math.max(20, (country.scanCount / maxScans) * 100)
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          type="number" 
          dataKey="x" 
          domain={[0, 4]} 
          tick={false}
          axisLine={false}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          domain={[0, 5]} 
          tick={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string, props: any) => {
            if (name === 'scanCount') {
              return [
                <>
                  <div className="font-semibold">{props.payload.countryName}</div>
                  <div>Skeny: {value.toLocaleString('cs-CZ')}</div>
                  <div>Penetrace: {props.payload.marketPenetration.toFixed(1)}/100k</div>
                </>,
                ''
              ];
            }
            return [value, name];
          }}
          labelFormatter={() => ''}
        />
        <Scatter dataKey="scanCount" fill={COLORS.primary}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={`rgba(220, 38, 38, ${0.3 + entry.intensity * 0.7})`}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

interface SeasonalityRadarProps {
  weeklyData: Array<{ day: string; multiplier: number }>;
  monthlyData: Array<{ month: string; multiplier: number }>;
  height?: number;
}

export function SeasonalityRadar({ weeklyData, monthlyData, height = 300 }: SeasonalityRadarProps) {
  const radarData = weeklyData.map((day, index) => ({
    day: day.day.substring(0, 3), // Shorten day names
    weekly: day.multiplier,
    monthly: monthlyData[Math.floor(index * monthlyData.length / weeklyData.length)]?.multiplier || 1,
    angle: (index * 360) / weeklyData.length
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="30%" 
        outerRadius="80%" 
        data={radarData}
      >
        <RadialBar 
          dataKey="weekly" 
          cornerRadius={10} 
          fill={COLORS.primary}
          opacity={0.8}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string) => [
            `${(value * 100).toFixed(0)}%`,
            name === 'weekly' ? 'Týdenní aktivita' : 'Měsíční aktivita'
          ]}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );
}

interface PredictionFunnelProps {
  predictions: {
    nextDay: number;
    next7Days: number[];
    next30Days: number[];
    confidence: number;
  };
  height?: number;
}

export function PredictionFunnel({ predictions, height = 300 }: PredictionFunnelProps) {
  const funnelData = [
    { 
      name: 'Zítra', 
      value: predictions.nextDay, 
      confidence: predictions.confidence,
      color: COLORS.primary 
    },
    { 
      name: '7 dní', 
      value: predictions.next7Days.reduce((sum, val) => sum + val, 0), 
      confidence: predictions.confidence * 0.9,
      color: COLORS.secondary 
    },
    { 
      name: '30 dní', 
      value: predictions.next30Days.reduce((sum, val) => sum + val, 0), 
      confidence: predictions.confidence * 0.7,
      color: COLORS.accent 
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={funnelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number, name: string, props: any) => [
            <>
              <div>Predikce: {value.toLocaleString('cs-CZ')}</div>
              <div>Spolehlivost: {(props.payload.confidence * 100).toFixed(0)}%</div>
            </>,
            'Očekávané skeny'
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={COLORS.primary}
          fill={`${COLORS.primary}40`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface CompetitiveGaugeProps {
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
  relativePerformance: number;
  size?: number;
}

export function CompetitiveGauge({ marketPosition, relativePerformance, size = 200 }: CompetitiveGaugeProps) {
  const percentage = Math.min(100, relativePerformance * 100);
  const angle = (percentage / 100) * 180; // Half circle
  
  const positionColors = {
    leader: COLORS.success,
    challenger: COLORS.primary,
    follower: COLORS.warning,
    niche: COLORS.info
  };
  
  const positionLabels = {
    leader: 'Líder trhu',
    challenger: 'Vyzyvatel',
    follower: 'Následovník',
    niche: 'Niche hráč'
  };

  const gaugeData = [
    { value: percentage, fill: positionColors[marketPosition] },
    { value: 100 - percentage, fill: '#e5e7eb' }
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ResponsiveContainer width={size} height={size / 2 + 20}>
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="90%"
            startAngle={180}
            endAngle={0}
            innerRadius={size * 0.25}
            outerRadius={size * 0.35}
            dataKey="value"
            stroke="none"
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 text-center">
        <div className="text-2xl font-bold" style={{ color: positionColors[marketPosition] }}>
          {percentage.toFixed(0)}%
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {positionLabels[marketPosition]}
        </div>
      </div>
    </div>
  );
}