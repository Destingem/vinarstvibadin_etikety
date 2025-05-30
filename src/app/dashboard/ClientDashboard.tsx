"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

type Wine = {
  id: string;
  name: string;
  vintage?: string;
  batch?: string;
  createdAt: string;
};

type Winery = {
  name: string;
  _count?: {
    wines: number;
  };
};

type DashboardData = {
  winery: Winery | null;
  allWines: Wine[];
};

export default function ClientDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user || !token) return;

      try {
        // Fetch dashboard data from API
        const response = await authFetch('/api/dashboard', token);
        
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('An error occurred while loading dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, token]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl text-center">
            <div className="flex items-center justify-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">Načítám dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-red-200/60 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-700">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm opacity-80">Používám záložní data z přihlášení.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Create fallback data if API call failed
  const fallbackData: DashboardData = {
    winery: {
      name: user?.name || 'User',
      _count: { wines: 0 }
    },
    allWines: []
  };

  // Use API data or fallback data
  const dashboardData = data || fallbackData;

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-1 text-gray-600">Vítejte zpět, {dashboardData.winery?.name || user?.name}</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/wines/new"
            className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30"
          >
            <span className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Přidat nové víno</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Wines Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  Celkový počet vín
                </dt>
                <dd className="mt-1 text-3xl font-bold text-gray-900">
                  {dashboardData.winery?._count?.wines || 0}
                </dd>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/wines"
                className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Zobrazit všechna vína</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Account Info Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  Vinařství
                </dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">
                  {dashboardData.winery?.name || user?.name}
                </dd>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/settings"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Upravit nastavení</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* QR Codes Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-600">
                  QR kódy
                </dt>
                <dd className="mt-1 text-lg font-bold text-gray-900">
                  Generovat
                </dd>
                <p className="text-sm text-gray-500">
                  Pro etikety vín
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/dashboard/qrcodes"
                className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
              >
                <span>Spravovat QR kódy</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* All Wines */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Všechna vína</h2>
        {dashboardData.allWines.length > 0 ? (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-gray-200/60 shadow-lg max-h-96 overflow-hidden">
              <div className="overflow-y-auto max-h-96">
                {dashboardData.allWines.map((wine, index) => (
                  <Link 
                    key={wine.id} 
                    href={`/dashboard/wines/${wine.id}`} 
                    className="block hover:bg-white/60 transition-colors duration-200"
                  >
                    <div className={`px-6 py-4 ${index > 0 ? 'border-t border-gray-200/50' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {wine.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            {wine.batch && (
                              <span className="text-sm text-gray-600">
                                Šarže: {wine.batch}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              Vytvořeno {new Date(wine.createdAt).toLocaleDateString('cs-CZ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {wine.vintage && (
                            <span className="px-3 py-1 text-xs font-semibold bg-green-100/80 text-green-800 rounded-full">
                              Ročník {wine.vintage}
                            </span>
                          )}
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-lg text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Zatím nemáte přidaná žádná vína</h3>
              <p className="text-gray-600 mb-6">Začněte přidáním prvního vína do vaší databáze</p>
              <Link
                href="/dashboard/wines/new"
                className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Přidat první víno</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Rychlý průvodce
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Přidejte víno
              </h3>
              <p className="text-gray-600">
                Vytvořte nový záznam pro vaše víno s výživovými údaji a složením.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vygenerujte QR kód
              </h3>
              <p className="text-gray-600">
                Po přidání vína si stáhněte QR kód pro umístění na etiketu.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Umístěte na etiketu
              </h3>
              <p className="text-gray-600">
                Použijte vygenerovaný QR kód na etiketě vašeho vína.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Analytics Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-purple-200/60 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-900">
                Analytika
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Sledujte statistiky načtení QR kódů vašich vín a získejte cenné informace o zájmu spotřebitelů.
            </p>
            <Link
              href="/dashboard/analytics"
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <span>Zobrazit analýzu</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* API Access Card */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-6 rounded-3xl border border-orange-200/60 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-semibold text-gray-900">
                API přístup
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Získejte přístup k API pro integraci dat o vínech do svých aplikací nebo webových stránek.
            </p>
            <Link
              href="/dashboard/api"
              className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-1 transition-colors duration-200"
            >
              <span>Spravovat API klíče</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Partner Services - CTA Banners */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Naše služby
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Byte Development Banner */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl shadow-lg overflow-hidden">
              <div className="px-8 py-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Vývoj webových stránek
                </h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Byte Development - profesionální tvorba moderních webových stránek a aplikací pro vaše podnikání.
                </p>
                <a
                  href="https://bytedevelopment.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border border-white/20 py-3 px-6 rounded-2xl font-medium hover:bg-white/20 transition-all duration-200 space-x-2"
                >
                  <span>Navštívit stránky</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Parcel View Banner */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl shadow-lg overflow-hidden">
              <div className="px-8 py-8">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Promo záběry dronem
                </h3>
                <p className="text-green-100 mb-6 leading-relaxed">
                  Parcel View - profesionální letecké snímky a videa pro prezentaci vašeho vinařství a vinic.
                </p>
                <a
                  href="https://parcelview.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white border border-white/20 py-3 px-6 rounded-2xl font-medium hover:bg-white/20 transition-all duration-200 space-x-2"
                >
                  <span>Zobrazit ukázky</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}