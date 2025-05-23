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
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-black mb-2">Analytika QR kódů</h1>
        <p className="text-gray-800">
          Na této stránce najdete anonymní statistiky o načítání QR kódů vašich vín. Data jsou aktualizována denně a poskytují přehled o tom, jak zákazníci interagují s vašimi produkty.
        </p>
      </div>
      
      {/* Sample data notification */}
      {analytics.isSampleData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Ukázková data</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Toto jsou ukázková data vygenerovaná pro demonstrační účely. Skutečná data se začnou zobrazovat, 
                jakmile budou zaznamenány první skeny QR kódů vašich vín.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date range selector */}
      <div className="flex justify-end mb-6">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setDateRange('7days')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              dateRange === '7days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            7 dní
          </button>
          <button
            onClick={() => setDateRange('30days')}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === '30days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            30 dní
          </button>
          <button
            onClick={() => setDateRange('90days')}
            className={`px-4 py-2 text-sm font-medium ${
              dateRange === '90days'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            90 dní
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              dateRange === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Rok
          </button>
        </div>
      </div>
      
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total scans card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-black">Celkem načtení QR kódů</h3>
          <div className="flex items-baseline gap-2 mt-2 mb-1">
            <span className="text-2xl font-bold text-black">{analytics.totalScans.toLocaleString()}</span>
            {analytics.scanTrend.percentChange > 0 ? (
              <div className="inline-flex items-center text-sm text-green-600">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                {analytics.scanTrend.percentChange}%
              </div>
            ) : (
              analytics.scanTrend.percentChange < 0 ? (
                <div className="inline-flex items-center text-sm text-red-600">
                  <ArrowDownIcon className="h-3 w-3 mr-1" />
                  {Math.abs(analytics.scanTrend.percentChange)}%
                </div>
              ) : null
            )}
          </div>
          <p className="text-xs text-gray-700">Oproti předchozímu období</p>
        </div>
        
        {/* Unique visitors card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-black">Unikátní návštěvníci</h3>
          <div className="mt-2 mb-1">
            <span className="text-2xl font-bold text-black">{analytics.totalUniqueVisitors.toLocaleString()}</span>
          </div>
          <p className="text-xs text-gray-700">Odhadovaný počet různých zákazníků</p>
        </div>
        
        {/* Device and OS breakdown cards */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-black">Rozdělení podle zařízení</h3>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm text-black">Mobilní telefony</span>
              </div>
              <span className="text-sm font-medium text-black">{analytics.scansByDevice.mobile.toLocaleString()} ({Math.round(analytics.scansByDevice.mobile / analytics.totalScans * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DeviceTabletIcon className="h-4 w-4 mr-2 text-indigo-600" />
                <span className="text-sm text-black">Tablety</span>
              </div>
              <span className="text-sm font-medium text-black">{analytics.scansByDevice.tablet.toLocaleString()} ({Math.round(analytics.scansByDevice.tablet / analytics.totalScans * 100)}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ComputerDesktopIcon className="h-4 w-4 mr-2 text-purple-600" />
                <span className="text-sm text-black">Počítače</span>
              </div>
              <span className="text-sm font-medium text-black">{analytics.scansByDevice.desktop.toLocaleString()} ({Math.round(analytics.scansByDevice.desktop / analytics.totalScans * 100)}%)</span>
            </div>
          </div>
          
          {/* OS Stats */}
          {analytics.operatingSystems && analytics.operatingSystems.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-medium text-black mb-2">Operační systémy</h4>
              <div className="space-y-1">
                {analytics.operatingSystems.map((os, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[70%] text-gray-800">{os.name}</span>
                    <span className="font-medium text-black">{os.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main charts and statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Time trend chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="text-lg font-medium text-black">Časový trend načítání</h3>
          </div>
          
          <div className="h-60">
            <TimeSeriesChart 
              data={analytics.dailyScans.map(item => ({ date: item.date, value: item.scanCount }))}
              width={600}
              height={240}
            />
          </div>
        </div>
        
        {/* Regional map */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <GlobeIcon className="h-5 w-5 mr-2 text-green-600" />
            <h3 className="text-lg font-medium text-black">Regionální statistiky</h3>
          </div>
          
          {/* Regional stats container with tabs */}
          <div className="mb-4">
            <div className="flex border-b border-gray-200">
              <button
                className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
                aria-current="page"
              >
                Graf
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-gray-300"
              >
                Mapa
              </button>
            </div>
          </div>
          
          {/* Current graph view */}
          <div className="h-60">
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
          
          {/* Map placeholder for future implementation */}
          <div className="hidden">
            <div className="bg-gray-50 rounded-lg border border-gray-200 h-60 flex items-center justify-center">
              <div className="text-center p-4">
                <GlobeIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <h3 className="text-sm font-medium text-gray-700">Mapa zobrazení</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Mapa regionálních statistik bude dostupná v budoucí aktualizaci.
                </p>
              </div>
            </div>
          </div>
          
          {/* Top countries list */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-black mb-2">Top regiony</h4>
            <div className="space-y-1.5">
              {analytics.topRegions.map((region, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-16 h-5 mr-2 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center text-xs font-bold uppercase text-black">
                      {region.countryCode}
                    </div>
                    <span className="text-sm text-black">{region.countryName}</span>
                  </div>
                  <span className="text-sm font-medium text-black">{region.scanCount.toLocaleString()} ({region.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional analytics sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Top wines */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1">
          <h3 className="text-lg font-medium text-black mb-4">Nejoblíbenější vína</h3>
          <div className="space-y-3">
            {analytics.topWines.map((wine, index) => (
              <div key={wine.wineId} className="flex items-center">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 mr-3 text-sm font-medium text-black">
                  {wine.rank}
                </div>
                <div className="flex-1">
                  <a 
                    href={`/dashboard/wines/${wine.wineId}`} 
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {wine.wineName}
                  </a>
                  <div className="flex items-center text-xs mt-1">
                    {wine.wineVintage && (
                      <span className="inline-flex items-center mr-2 bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                        {wine.wineVintage}
                      </span>
                    )}
                    {wine.wineBatch && (
                      <span className="inline-flex items-center mr-2 bg-gray-50 text-gray-700 px-1.5 py-0.5 rounded text-xs">
                        Šarže: {wine.wineBatch}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mt-1">{wine.scanCount.toLocaleString()} načtení</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Language stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1">
          <div className="flex items-center mb-4">
            <LanguageIcon className="h-5 w-5 mr-2 text-indigo-600" />
            <h3 className="text-lg font-medium text-black">Jazykové preference</h3>
          </div>
          
          <div className="space-y-3">
            {analytics.languages && analytics.languages.length > 0 ? (
              analytics.languages.map((lang, index) => {
                // Format language display
                const languageCode = lang.language || lang.languageCode || 'unknown';
                const languageName = getLanguageName(languageCode);
                const percentage = typeof lang.percentage !== 'undefined' 
                  ? lang.percentage 
                  : Math.round((lang.scanCount / analytics.totalScans) * 100);
                
                return (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-5 mr-3 flex items-center justify-center text-xs font-bold uppercase bg-indigo-50 text-indigo-600 rounded">
                        {languageCode}
                      </div>
                      <span className="text-sm text-black">{languageName}</span>
                    </div>
                    <span className="text-sm font-medium text-black">{percentage}% <span className="text-black text-xs">({lang.scanCount})</span></span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-black">
                <span>Žádná data k dispozici</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Time of day stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm md:col-span-1">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-5 w-5 mr-2 text-amber-600" />
            <h3 className="text-lg font-medium text-black">Rozložení během dne</h3>
          </div>
          
          <div className="h-48 w-full">
            <HourDistributionChart 
              data={analytics.timeDistribution}
              width={width < 768 ? 300 : 400} // Wider on desktop
              height={190}
            />
          </div>
          
          <div className="mt-4 text-xs text-gray-700">
            <p>Nejaktivnější čas: <span className="font-medium text-black">14:00 - 18:00</span></p>
            <p>Nejméně aktivní: <span className="font-medium text-black">03:00 - 06:00</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingDisplay() {
  return (
    <div className="flex flex-col items-center justify-center h-40 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <div className="text-sm text-gray-600">
        Načítání analytických dat...
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="bg-red-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-red-800 mb-2">Chyba při načítání dat</h3>
      <p className="text-sm text-red-600">{message}</p>
      <p className="text-sm text-red-600 mt-2">
        Zkuste obnovit stránku nebo kontaktujte podporu, pokud problém přetrvává.
      </p>
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Poznámka pro administrátory:</h4>
        <p className="text-xs text-yellow-700">
          Ujistěte se, že jsou v Appwrite správně nastavena oprávnění pro kolekce analytics. 
          Viz soubor ANALYTICS_PERMISSIONS.md s pokyny.
        </p>
      </div>
    </div>
  );
}

function NoDataDisplay() {
  return (
    <div className="bg-blue-50 p-6 rounded-lg text-center">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Zatím nemáme dostatek dat</h3>
      <p className="text-sm text-blue-600 mb-4">
        Statistiky se začnou zobrazovat po prvních naskenovaných QR kódech vašich vín.
      </p>
      <p className="text-sm text-blue-700">
        Zkontrolujte, že máte správně vygenerované QR kódy a že jsou dostupné zákazníkům.
      </p>
    </div>
  );
}