'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CalendarIcon, 
  GlobeAltIcon as GlobeIcon, 
  DevicePhoneMobileIcon, 
  DeviceTabletIcon, 
  ComputerDesktopIcon,
  LanguageIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  TimeSeriesChart, 
  PieChart, 
  BarChart, 
  HorizontalBarChart,
  HourDistributionChart
} from './components/charts';

/**
 * Maps language codes to their human-readable names
 */
function getLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'cs': 'Čeština',
    'en': 'Angličtina',
    'de': 'Němčina',
    'sk': 'Slovenština',
    'pl': 'Polština',
    'fr': 'Francouzština',
    'it': 'Italština',
    'es': 'Španělština',
    'ru': 'Ruština',
    'uk': 'Ukrajinština',
    'hu': 'Maďarština',
    'ro': 'Rumunština',
    'nl': 'Nizozemština',
    'pt': 'Portugalština',
    'zh': 'Čínština',
    'ja': 'Japonština',
    'ko': 'Korejština',
    'ar': 'Arabština',
    'unknown': 'Neznámý jazyk'
  };
  
  return languageMap[code.toLowerCase()] || code;
}

// Define API response types
interface AnalyticsSummary {
  totalScans: number;
  totalUniqueVisitors: number;
  scansByDevice: {
    mobile: number;
    tablet: number;
    desktop: number;
    unknown: number;
  };
  operatingSystems?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  scanTrend: {
    percentChange: number;
    isPositive: boolean;
  };
  topWines: Array<{
    wineId: string;
    wineName: string;
    scanCount: number;
    rank: number;
    wineBatch?: string;
    wineVintage?: string;
  }>;
  topRegions: Array<{
    countryCode: string;
    countryName: string;
    scanCount: number;
    percentage: number;
  }>;
  languages: Array<{
    languageCode: string;
    languageName: string;
    language?: string;
    scanCount: number;
    percentage: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    scanCount: number;
    percentage: number;
  }>;
  dailyScans: Array<{
    date: string;
    scanCount: number;
  }>;
  isSampleData?: boolean; // Flag to indicate if data is sample data
}

// Date range type
type DateRange = '7days' | '30days' | '90days' | 'year';

import { useAuth, useRequireAuth } from '@/lib/auth-context';

export default function ClientAnalyticsDashboard() {
  // Use the auth context to get user info and enforce authentication
  const { user, isLoading } = useRequireAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  // Track window size for responsive charts
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    async function fetchAnalytics() {
      // Don't fetch if user isn't loaded yet
      if (isLoading || !user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics/dashboard?userId=${user.id}&range=${dateRange}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Nepodařilo se načíst analytická data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, [user, isLoading, dateRange]);
  
  // Show loading if auth is still loading or data is loading
  if (isLoading || (loading && user)) {
    return <LoadingDisplay />;
  }
  
  // If authentication is done but no user, the redirect will happen via useRequireAuth
  if (!user) {
    return <LoadingDisplay />;
  }
  
  if (error) {
    return <ErrorDisplay message={error} />;
  }
  
  if (!analytics) {
    return <NoDataDisplay />;
  }
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Analytika QR kódů
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Na této stránce najdete anonymní statistiky o načítání QR kódů vašich vín. Data jsou aktualizována denně a poskytují přehled o tom, jak zákazníci interagují s vašimi produkty.
        </p>
      </div>
      
      {/* Sample data notification */}
      {analytics.isSampleData && (
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-yellow-50/60 rounded-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-amber-200/50 shadow-lg">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Ukázková data</h3>
                <p className="text-amber-700 leading-relaxed">
                  Toto jsou ukázková data vygenerovaná pro demonstrační účely. Skutečná data se začnou zobrazovat, 
                  jakmile budou zaznamenány první skeny QR kódů vašich vín.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date range selector */}
      <div className="flex justify-end mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-gray-200/50 shadow-lg">
            <div className="inline-flex" role="group">
              <button
                onClick={() => setDateRange('7days')}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  dateRange === '7days'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                7 dní
              </button>
              <button
                onClick={() => setDateRange('30days')}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  dateRange === '30days'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                30 dní
              </button>
              <button
                onClick={() => setDateRange('90days')}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  dateRange === '90days'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                90 dní
              </button>
              <button
                onClick={() => setDateRange('year')}
                className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  dateRange === 'year'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/80 hover:text-gray-900'
                }`}
              >
                Rok
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total scans card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  Celkem načtení QR kódů
                </dt>
                <div className="flex items-baseline gap-2 mt-1">
                  <dd className="text-3xl font-bold text-gray-900">
                    {analytics.totalScans.toLocaleString()}
                  </dd>
                  {analytics.scanTrend.percentChange > 0 ? (
                    <div className="inline-flex items-center text-sm text-green-600">
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                      {analytics.scanTrend.percentChange}%
                    </div>
                  ) : (
                    analytics.scanTrend.percentChange < 0 ? (
                      <div className="inline-flex items-center text-sm text-red-600">
                        <ArrowDownIcon className="h-4 w-4 mr-1" />
                        {Math.abs(analytics.scanTrend.percentChange)}%
                      </div>
                    ) : null
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Oproti předchozímu období</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Unique visitors card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  Unikátní návštěvníci
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900">
                  {analytics.totalUniqueVisitors.toLocaleString()}
                </dd>
                <p className="text-sm text-gray-500 mt-1">Odhadovaný počet různých zákazníků</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Device and OS breakdown cards */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Rozdělení podle zařízení</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DevicePhoneMobileIcon className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Mobilní telefony</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.scansByDevice.mobile.toLocaleString()} ({Math.round(analytics.scansByDevice.mobile / analytics.totalScans * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DeviceTabletIcon className="h-5 w-5 mr-3 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">Tablety</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.scansByDevice.tablet.toLocaleString()} ({Math.round(analytics.scansByDevice.tablet / analytics.totalScans * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-5 w-5 mr-3 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Počítače</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{analytics.scansByDevice.desktop.toLocaleString()} ({Math.round(analytics.scansByDevice.desktop / analytics.totalScans * 100)}%)</span>
              </div>
            </div>
            
            {/* OS Stats */}
            {analytics.operatingSystems && analytics.operatingSystems.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200/50">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Operační systémy</h4>
                <div className="space-y-2">
                  {analytics.operatingSystems.map((os, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="truncate max-w-[70%] text-sm text-gray-700">{os.name}</span>
                      <span className="font-medium text-sm text-gray-900">{os.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main charts and statistics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Time trend chart */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-blue-200/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Časový trend načítání</h3>
            </div>
            
            <div className="h-64 bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4">
              <TimeSeriesChart 
                data={analytics.dailyScans.map(item => ({ date: item.date, value: item.scanCount }))}
                width={600}
                height={240}
              />
            </div>
          </div>
        </div>
        
        {/* Regional map */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-green-200/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                <GlobeIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Regionální statistiky</h3>
            </div>
            
            {/* Regional stats container with tabs */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-xl"></div>
                <div className="relative bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50">
                  <div className="flex">
                    <button
                      className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg"
                      aria-current="page"
                    >
                      Graf
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200"
                    >
                      Mapa
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Current graph view */}
            <div className="h-64 bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 mb-6">
              <HorizontalBarChart 
                data={analytics.topRegions.map(region => ({
                  label: region.countryName,
                  value: region.scanCount,
                  color: '#22c55e'  // Green color for regions
                }))}
                width={600}
                height={240}
                xLabel="Počet načtení"
              />
            </div>
            
            {/* Top countries list */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top regiony</h4>
              <div className="space-y-3">
                {analytics.topRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                    <div className="flex items-center">
                      <div className="w-12 h-6 mr-3 bg-gray-100/80 border border-gray-200/60 rounded-lg flex items-center justify-center text-xs font-bold uppercase text-gray-700">
                        {region.countryCode}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{region.countryName}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{region.scanCount.toLocaleString()} ({region.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional analytics sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top wines */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-red-200/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Nejoblíbenější vína</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.topWines.map((wine, index) => (
                <div key={wine.wineId} className="flex items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:bg-white/70 transition-all duration-200">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 mr-4 text-sm font-bold text-white">
                    {wine.rank}
                  </div>
                  <div className="flex-1">
                    <a 
                      href={`/dashboard/wines/${wine.wineId}`} 
                      className="text-sm font-semibold text-red-700 hover:text-red-800 hover:underline truncate block"
                    >
                      {wine.wineName}
                    </a>
                    <div className="flex items-center gap-2 mt-2">
                      {wine.wineVintage && (
                        <span className="inline-flex items-center bg-blue-50/80 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                          {wine.wineVintage}
                        </span>
                      )}
                      {wine.wineBatch && (
                        <span className="inline-flex items-center bg-gray-50/80 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium">
                          Šarže: {wine.wineBatch}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium">{wine.scanCount.toLocaleString()} načtení</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Language stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-indigo-200/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                <LanguageIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Jazykové preference</h3>
            </div>
            
            <div className="space-y-4">
              {analytics.languages && analytics.languages.length > 0 ? (
                analytics.languages.map((lang, index) => {
                  // Format language display
                  const languageCode = lang.language || lang.languageCode || 'unknown';
                  const languageName = getLanguageName(languageCode);
                  const percentage = typeof lang.percentage !== 'undefined' 
                    ? lang.percentage 
                    : Math.round((lang.scanCount / analytics.totalScans) * 100);
                  
                  return (
                    <div key={index} className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200/50">
                      <div className="flex items-center">
                        <div className="w-10 h-6 mr-4 flex items-center justify-center text-xs font-bold uppercase bg-indigo-100/80 text-indigo-700 rounded-lg border border-indigo-200/50">
                          {languageCode}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{languageName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                        <span className="text-xs text-gray-600 block">({lang.scanCount})</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LanguageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <span className="text-gray-600">Žádná data k dispozici</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Time of day stats */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-amber-200/50 shadow-2xl">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Rozložení během dne</h3>
            </div>
            
            <div className="h-52 w-full bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-4 mb-6">
              <HourDistributionChart 
                data={analytics.timeDistribution}
                width={width < 768 ? 300 : 400} // Wider on desktop
                height={190}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <p className="text-sm text-gray-600">Nejaktivnější čas:</p>
                <p className="font-bold text-gray-900">14:00 - 18:00</p>
              </div>
              <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <p className="text-sm text-gray-600">Nejméně aktivní:</p>
                <p className="font-bold text-gray-900">03:00 - 06:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDisplay() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-12 rounded-3xl border border-gray-200/60 shadow-2xl text-center">
          <div className="flex items-center justify-center space-x-4">
            <svg className="animate-spin h-8 w-8 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-medium text-gray-700">Načítání analytických dat...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-red-200/60 shadow-2xl">
          <div className="flex items-center space-x-4 text-red-700 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-800">Chyba při načítání dat</h3>
              <p className="text-red-600 mt-1">{message}</p>
            </div>
          </div>
          <p className="text-red-600 mb-6">
            Zkuste obnovit stránku nebo kontaktujte podporu, pokud problém přetrvává.
          </p>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 to-amber-50/60 rounded-2xl"></div>
            <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-yellow-200/50">
              <h4 className="text-lg font-semibold text-yellow-800 mb-3">Poznámka pro administrátory:</h4>
              <p className="text-yellow-700">
                Ujistěte se, že jsou v Appwrite správně nastavena oprávnění pro kolekce analytics. 
                Viz soubor ANALYTICS_PERMISSIONS.md s pokyny.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoDataDisplay() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-12 rounded-3xl border border-blue-200/60 shadow-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Zatím nemáme dostatek dat</h3>
          <p className="text-blue-600 mb-6 text-lg leading-relaxed">
            Statistiky se začnou zobrazovat po prvních naskenovaných QR kódech vašich vín.
          </p>
          <p className="text-blue-700">
            Zkontrolujte, že máte správně vygenerované QR kódy a že jsou dostupné zákazníkům.
          </p>
        </div>
      </div>
    </div>
  );
}