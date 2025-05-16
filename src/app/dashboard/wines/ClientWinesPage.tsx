"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { useSearchParams } from 'next/navigation';

type Wine = {
  $id: string;
  name: string;
  vintage?: number | null;
  batch?: string | null;
  alcoholContent?: number | null;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

type WinesData = {
  wines: Wine[];
  pagination: Pagination;
};

export default function ClientWinesPage() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<WinesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
  const search = searchParams.get('search') || '';

  // Handle wine deletion
  const handleDeleteWine = async (wineId: string) => {
    if (!token) return;
    
    // Confirm before deleting
    if (!confirm('Opravdu chcete smazat toto víno?')) {
      return;
    }
    
    setDeletingId(wineId);
    setError(null);
    
    try {
      const response = await authFetch(`/api/wines/${wineId}`, token, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nastala chyba při mazání vína');
      }
      
      // Refresh wines list
      fetchWines();
    } catch (err: any) {
      console.error('Error deleting wine:', err);
      setError(err.message || 'Nastala chyba při mazání vína');
    } finally {
      setDeletingId(null);
    }
  };
  
  // Fetch wines data
  const fetchWines = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('page', page.toString());
      if (search) queryParams.set('search', search);

      const response = await authFetch(`/api/wines?${queryParams.toString()}`, token);
      
      if (response.ok) {
        const winesData = await response.json();
        setData(winesData);
      } else {
        setError('Failed to load wines');
      }
    } catch (err) {
      console.error('Error fetching wines:', err);
      setError('An error occurred while loading wines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWines();
  }, [token, page, search]);

  if (loading) {
    return <div className="text-center p-6">Loading wines...</div>;
  }

  // Create fallback data if API call failed
  const fallbackData: WinesData = {
    wines: [],
    pagination: {
      page: 1,
      limit: 10,
      totalCount: 0,
      totalPages: 0,
    }
  };

  // Use API data or fallback data
  const winesData = data || fallbackData;
  const { wines, pagination } = winesData;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Vína</h1>
          <p className="mt-2 text-sm text-gray-700">
            Seznam všech vašich vín, pro která můžete generovat QR kódy
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/wines/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Přidat víno
          </Link>
        </div>
      </div>
      
      {/* Search */}
      <div className="mt-4">
        <form className="flex w-full md:w-1/2 lg:w-1/3">
          <label htmlFor="search" className="sr-only">Hledat víno</label>
          <div className="relative flex-grow">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              defaultValue={search}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Hledat podle názvu nebo šarže"
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Hledat
          </button>
        </form>
      </div>
      
      {/* Wine list */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Název
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ročník
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Šarže
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Datum přidání
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Akce</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {wines.length > 0 ? (
                    wines.map((wine) => (
                      <tr key={wine.$id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{wine.name}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wine.vintage || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wine.batch || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(wine.createdAt).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/dashboard/wines/${wine.$id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/dashboard/wines/${wine.$id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Upravit
                          </Link>
                          <Link
                            href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            QR kód
                          </Link>
                          <button
                            onClick={() => handleDeleteWine(wine.$id)}
                            disabled={deletingId === wine.$id}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                          >
                            {deletingId === wine.$id ? 'Mazání...' : 'Smazat'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 px-6 text-center text-sm text-gray-500">
                        {search ? (
                          <p>Nebyly nalezeny žádné výsledky pro "{search}".</p>
                        ) : (
                          <p>Zatím nemáte přidána žádná vína.</p>
                        )}
                        <Link
                          href="/dashboard/wines/new"
                          className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-500"
                        >
                          <span>Přidat první víno</span>
                          <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Link
              href={`/dashboard/wines?page=${Math.max(1, pagination.page - 1)}${search ? `&search=${search}` : ''}`}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Předchozí
            </Link>
            <Link
              href={`/dashboard/wines?page=${Math.min(pagination.totalPages, pagination.page + 1)}${search ? `&search=${search}` : ''}`}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${pagination.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Další
            </Link>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zobrazeno <span className="font-medium">{wines.length}</span> z <span className="font-medium">{pagination.totalCount}</span> výsledků
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <Link
                  href={`/dashboard/wines?page=${Math.max(1, pagination.page - 1)}${search ? `&search=${search}` : ''}`}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Předchozí</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                  // Calculate page number to show
                  let pageNumber;
                  if (pagination.totalPages <= 5) {
                    // If <= 5 pages, show all pages
                    pageNumber = i + 1;
                  } else if (pagination.page <= 3) {
                    // If current page is <= 3, show pages 1-5
                    pageNumber = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    // If current page is near the end, show last 5 pages
                    pageNumber = pagination.totalPages - 4 + i;
                  } else {
                    // Otherwise, show 2 pages before and 2 pages after current page
                    pageNumber = pagination.page - 2 + i;
                  }
                  
                  return (
                    <Link
                      key={pageNumber}
                      href={`/dashboard/wines?page=${pageNumber}${search ? `&search=${search}` : ''}`}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNumber === pagination.page
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </Link>
                  );
                })}
                
                <Link
                  href={`/dashboard/wines?page=${Math.min(pagination.totalPages, pagination.page + 1)}${search ? `&search=${search}` : ''}`}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${pagination.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Další</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}