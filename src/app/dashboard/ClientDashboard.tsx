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
  recentWines: Wine[];
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
    return <div className="text-center p-6">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-500">{error}</p>
          <p className="mt-2">Using user data from login instead.</p>
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
    recentWines: []
  };

  // Use API data or fallback data
  const dashboardData = data || fallbackData;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href="/dashboard/wines/new"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Přidat nové víno
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Card - Total Wines */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Celkový počet vín
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {dashboardData.winery?._count?.wines || 0}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/wines"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Zobrazit všechna vína
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Card - QR Codes */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Vygenerované QR kódy
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {dashboardData.winery?._count?.wines || 0}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/qrcodes"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Správa QR kódů
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Card - Account Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Informace o účtu
            </dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {dashboardData.winery?.name || user?.name}
            </dd>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {user?.email}
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link
                href="/dashboard/settings"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Upravit nastavení
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Wines */}
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Nedávno přidaná vína
        </h2>
        {dashboardData.recentWines.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {dashboardData.recentWines.map((wine) => (
                <li key={wine.id}>
                  <Link href={`/dashboard/wines/${wine.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {wine.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          {wine.vintage && (
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Ročník {wine.vintage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {wine.batch && `Šarže: ${wine.batch}`}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Vytvořeno {new Date(wine.createdAt).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
            <p className="text-gray-500">Zatím nemáte přidaná žádná vína</p>
            <Link
              href="/dashboard/wines/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Přidat první víno
            </Link>
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="bg-white shadow rounded-lg mt-8 p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Rychlý průvodce
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Přidejte víno
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Vytvořte nový záznam pro vaše víno s výživovými údaji a složením.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Vygenerujte QR kód
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Po přidání vína si stáhněte QR kód pro umístění na etiketu.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Umístěte na etiketu
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Použijte vygenerovaný QR kód na etiketě vašeho vína.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}