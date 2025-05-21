"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { useSearchParams } from 'next/navigation';
import ImportExportWines from '@/components/ImportExportWines';
import { Wine as WineType } from '@/types';

type Wine = WineType;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWines, setFilteredWines] = useState<Wine[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Wine>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterVintage, setFilterVintage] = useState<number | null>(null);
  const [filterAlcohol, setFilterAlcohol] = useState<number | null>(null);
  const [filterBatch, setFilterBatch] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<string | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Get page from URL or default to 1
  const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
  // URL search is no longer used for filtering, kept for compatibility
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
  
  // Fetch wines data - now fetches all wines for client-side filtering
  const fetchWines = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Fetch all wines without a search parameter
      const response = await authFetch(`/api/wines?limit=1000`, token);
      
      if (response.ok) {
        const winesData = await response.json();
        setData(winesData);
        setFilteredWines(winesData.wines); // Initialize filtered wines with all wines
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

  // Filter and sort wines
  useEffect(() => {
    if (!data) return;
    
    // Start with all wines
    let filtered = [...data.wines];
    
    // Apply search filter if term exists
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(wine => {
        const nameMatch = wine.name.toLowerCase().includes(searchLower);
        const vintageMatch = wine.vintage?.toString().includes(searchLower);
        const batchMatch = wine.batch?.toLowerCase().includes(searchLower);
        
        return nameMatch || vintageMatch || batchMatch;
      });
    }
    
    // Apply vintage filter if selected
    if (filterVintage !== null) {
      filtered = filtered.filter(wine => wine.vintage === filterVintage);
    }
    
    // Apply alcohol content filter if selected
    if (filterAlcohol !== null) {
      filtered = filtered.filter(wine => wine.alcoholContent === filterAlcohol);
    }
    
    // Apply batch filter if selected
    if (filterBatch !== null && filterBatch !== '') {
      filtered = filtered.filter(wine => wine.batch === filterBatch);
    }
    
    // Apply region filter if selected
    if (filterRegion !== null && filterRegion !== '') {
      filtered = filtered.filter(wine => wine.wineRegion === filterRegion);
    }
    
    // Apply date range filters if selected
    if (filterDateFrom !== null && filterDateFrom !== '') {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter(wine => new Date(wine.createdAt) >= fromDate);
    }
    
    if (filterDateTo !== null && filterDateTo !== '') {
      const toDate = new Date(filterDateTo);
      // Set time to end of day for inclusive filtering
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(wine => new Date(wine.createdAt) <= toDate);
    }
    
    // Sort the filtered wines
    filtered.sort((a, b) => {
      // Handle undefined or null values for proper comparison
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      
      // Compare the values based on their types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue, 'cs') 
          : bValue.localeCompare(aValue, 'cs');
      } else {
        // For numbers and other types
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    setFilteredWines(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, data, sortField, sortDirection, filterVintage, filterAlcohol, filterBatch, filterRegion, filterDateFrom, filterDateTo]);
  
  // Toggle sort when a column header is clicked
  const handleSort = (field: keyof Wine) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get unique values for filters
  const getUniqueVintages = () => {
    if (!data) return [];
    const vintages = data.wines
      .map(wine => wine.vintage)
      .filter((vintage): vintage is number => vintage !== null && vintage !== undefined);
    return Array.from(new Set(vintages)).sort((a, b) => a - b);
  };
  
  const getUniqueAlcoholContents = () => {
    if (!data) return [];
    const alcoholContents = data.wines
      .map(wine => wine.alcoholContent)
      .filter((content): content is number => content !== null && content !== undefined);
    return Array.from(new Set(alcoholContents)).sort((a, b) => a - b);
  };
  
  const getUniqueBatches = () => {
    if (!data) return [];
    const batches = data.wines
      .map(wine => wine.batch)
      .filter((batch): batch is string => batch !== null && batch !== undefined && batch !== '');
    return Array.from(new Set(batches)).sort();
  };
  
  const getUniqueRegions = () => {
    if (!data) return [];
    const regions = data.wines
      .map(wine => wine.wineRegion)
      .filter((region): region is string => region !== null && region !== undefined && region !== '');
    return Array.from(new Set(regions)).sort();
  };
  
  // Get date range for date filters
  const getDateRange = () => {
    if (!data || data.wines.length === 0) return { min: '', max: '' };
    
    const dates = data.wines.map(wine => new Date(wine.createdAt).getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return {
      min: minDate.toISOString().split('T')[0],
      max: maxDate.toISOString().split('T')[0]
    };
  };
  
  // Close modals when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowBackupModal(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch wines only once or when token changes
  useEffect(() => {
    fetchWines();
  }, [token]);

  if (loading) {
    return <div className="text-center p-6">Loading wines...</div>;
  }

  // Calculate pagination for filtered wines
  const totalItems = filteredWines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page's items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWines = filteredWines.slice(startIndex, endIndex);
  
  // Create pagination object
  const pagination = {
    page: currentPage,
    limit: itemsPerPage,
    totalCount: totalItems,
    totalPages: totalPages
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Vína</h1>
          <p className="mt-2 text-sm text-gray-700">
            Seznam všech vašich vín, pro která můžete generovat QR kódy
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filtry
            {(filterVintage !== null || filterAlcohol !== null || filterBatch !== null || filterRegion !== null || filterDateFrom !== null || filterDateTo !== null) && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700">
                {(filterVintage !== null ? 1 : 0) + (filterAlcohol !== null ? 1 : 0) + (filterBatch !== null ? 1 : 0) + (filterRegion !== null ? 1 : 0) + ((filterDateFrom !== null || filterDateTo !== null) ? 1 : 0)}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setShowBackupModal(!showBackupModal)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
            </svg>
            Záloha a import
          </button>
          
          <Link
            href="/dashboard/wines/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Přidat víno
          </Link>
        </div>
      </div>
      
      {/* Search box */}
      <div className="mt-6 mb-6">
        <div className="w-full">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 pl-12 py-3 text-black focus:border-indigo-500 focus:ring-indigo-500 text-sm shadow-sm"
              placeholder="Hledat podle názvu, ročníku nebo šarže..."
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                title="Vymazat hledání"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {filteredWines.length === 0 && (searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo) ? (
            <p className="mt-2 text-xs font-medium text-red-600">
              Žádné výsledky pro zadané filtry
            </p>
          ) : (searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo) ? (
            <p className="mt-2 text-xs font-medium text-indigo-600">
              Nalezeno {filteredWines.length} výsledků
            </p>
          ) : null}
        </div>
      </div>
      
      {/* Collapsible Filters */}
      {showFilters && (
        <div className="mb-6 bg-gray-50 rounded-lg border border-gray-200 p-4 shadow-sm transition-all duration-200 ease-in-out">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Vintage filter */}
            <div>
              <label htmlFor="vintage-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Ročník
              </label>
              <select
                id="vintage-filter"
                value={filterVintage ?? ''}
                onChange={(e) => setFilterVintage(e.target.value ? parseInt(e.target.value) : null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Všechny ročníky</option>
                {getUniqueVintages().map(vintage => (
                  <option key={vintage} value={vintage}>{vintage}</option>
                ))}
              </select>
            </div>
            
            {/* Alcohol content filter */}
            <div>
              <label htmlFor="alcohol-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Obsah alkoholu
              </label>
              <select
                id="alcohol-filter"
                value={filterAlcohol ?? ''}
                onChange={(e) => setFilterAlcohol(e.target.value ? parseFloat(e.target.value) : null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Všechny hodnoty</option>
                {getUniqueAlcoholContents().map(content => (
                  <option key={content} value={content}>{content}%</option>
                ))}
              </select>
            </div>
            
            {/* Batch filter */}
            <div>
              <label htmlFor="batch-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Šarže
              </label>
              <select
                id="batch-filter"
                value={filterBatch ?? ''}
                onChange={(e) => setFilterBatch(e.target.value || null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Všechny šarže</option>
                {getUniqueBatches().map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            
            {/* Region filter */}
            <div>
              <label htmlFor="region-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Region
              </label>
              <select
                id="region-filter"
                value={filterRegion ?? ''}
                onChange={(e) => setFilterRegion(e.target.value || null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              >
                <option value="">Všechny regiony</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            {/* Date range from */}
            <div>
              <label htmlFor="date-from-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Datum od
              </label>
              <input
                type="date"
                id="date-from-filter"
                value={filterDateFrom ?? ''}
                onChange={(e) => setFilterDateFrom(e.target.value || null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                max={filterDateTo || getDateRange().max}
              />
            </div>
            
            {/* Date range to */}
            <div>
              <label htmlFor="date-to-filter" className="block text-xs font-medium text-gray-500 mb-1">
                Datum do
              </label>
              <input
                type="date"
                id="date-to-filter"
                value={filterDateTo ?? ''}
                onChange={(e) => setFilterDateTo(e.target.value || null)}
                className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-3 text-sm text-black focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                min={filterDateFrom || getDateRange().min}
              />
            </div>
            
            {/* Reset button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterVintage(null);
                  setFilterAlcohol(null);
                  setFilterBatch(null);
                  setFilterRegion(null);
                  setFilterDateFrom(null);
                  setFilterDateTo(null);
                }}
                className={`px-4 py-2 text-xs font-medium rounded ${(filterVintage !== null || filterAlcohol !== null || filterBatch !== null || filterRegion !== null || filterDateFrom !== null || filterDateTo !== null) ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} transition-colors`}
                disabled={filterVintage === null && filterAlcohol === null && filterBatch === null && filterRegion === null && filterDateFrom === null && filterDateTo === null}
              >
                Resetovat filtry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Wine list */}
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer select-none group"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Název</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'name' ? (
                            sortDirection === 'asc' ? (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                              </svg>
                            )
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group"
                      onClick={() => handleSort('vintage')}
                    >
                      <div className="flex items-center">
                        <span>Ročník</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'vintage' ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group"
                      onClick={() => handleSort('batch')}
                    >
                      <div className="flex items-center">
                        <span>Šarže</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'batch' ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group"
                      onClick={() => handleSort('alcoholContent')}
                    >
                      <div className="flex items-center">
                        <span>Alkohol</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'alcoholContent' ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group"
                      onClick={() => handleSort('wineRegion')}
                    >
                      <div className="flex items-center">
                        <span>Region</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'wineRegion' ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        <span>Datum</span>
                        <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                          {sortField === 'createdAt' ? (
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d={sortDirection === 'asc' ? "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" : "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"} clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4 opacity-0 group-hover:opacity-100" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Akce</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentWines.length > 0 ? (
                    currentWines.map((wine) => (
                      <tr key={wine.$id} className="hover:bg-gray-50">
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
                          {wine.alcoholContent ? `${wine.alcoholContent}%` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {wine.wineRegion || '—'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(wine.createdAt).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/dashboard/wines/${wine.$id}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 px-2 py-1"
                          >
                            Detail
                          </Link>
                          <Link
                            href={`/dashboard/wines/${wine.$id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 px-2 py-1"
                          >
                            Upravit
                          </Link>
                          <Link
                            href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                            className="text-green-600 hover:text-green-900 mr-4 px-2 py-1"
                          >
                            QR kód
                          </Link>
                          <button
                            onClick={() => handleDeleteWine(wine.$id)}
                            disabled={deletingId === wine.$id}
                            className="text-red-600 hover:text-red-900 disabled:text-gray-400 px-2 py-1"
                          >
                            {deletingId === wine.$id ? 'Mazání...' : 'Smazat'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-4 px-6 text-center text-sm text-gray-500">
                        {searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo ? (
                          <p>Nebyly nalezeny žádné výsledky pro zadané filtry.</p>
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
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Předchozí
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Další
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Zobrazeno <span className="font-medium">{currentWines.length}</span> z <span className="font-medium">{totalItems}</span> výsledků
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Předchozí</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Calculate page number to show
                  let pageNumber;
                  if (totalPages <= 5) {
                    // If <= 5 pages, show all pages
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    // If current page is <= 3, show pages 1-5
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If current page is near the end, show last 5 pages
                    pageNumber = totalPages - 4 + i;
                  } else {
                    // Otherwise, show 2 pages before and 2 pages after current page
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNumber === currentPage
                          ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Další</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
      
      {/* Backup/Import Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Záloha a import</h3>
              <button 
                onClick={() => setShowBackupModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ImportExportWines />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}