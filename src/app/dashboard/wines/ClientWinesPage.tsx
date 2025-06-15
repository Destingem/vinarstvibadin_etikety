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
    return (
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl text-center">
            <div className="flex items-center justify-center space-x-3">
              <svg className="animate-spin h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">Načítám vína...</span>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="px-3 sm:px-4 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Správa vín
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Seznam všech vašich vín, pro která můžete generovat QR kódy
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 lg:gap-3">
          {/* Primary action - Add wine */}
          <Link
            href="/dashboard/wines/new"
            className="order-1 sm:order-4 group relative bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 sm:px-6 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30 w-full sm:w-auto"
          >
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm sm:text-base">Přidat víno</span>
              <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
          
          {/* Secondary actions */}
          <div className="order-2 sm:order-1 flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none relative inline-flex items-center justify-center px-3 py-2.5 sm:px-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <svg className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Filtry</span>
              <span className="sm:hidden">Filtr</span>
              {(filterVintage !== null || filterAlcohol !== null || filterBatch !== null || filterRegion !== null || filterDateFrom !== null || filterDateTo !== null) && (
                <span className="ml-1 sm:ml-2 inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  {(filterVintage !== null ? 1 : 0) + (filterAlcohol !== null ? 1 : 0) + (filterBatch !== null ? 1 : 0) + (filterRegion !== null ? 1 : 0) + ((filterDateFrom !== null || filterDateTo !== null) ? 1 : 0)}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowBackupModal(!showBackupModal)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2.5 sm:px-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <svg className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
              <span className="hidden sm:inline">Import/Export</span>
              <span className="sm:hidden">I/E</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Search box */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-xl sm:rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200/50">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 sm:pl-12 sm:pr-12 py-2.5 sm:py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 placeholder:text-gray-500 text-gray-900 text-sm sm:text-base"
              placeholder="Hledat podle názvu, ročníku nebo šarže..."
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-gray-500 hover:text-red-600 transition-colors duration-200"
                title="Vymazat hledání"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          {filteredWines.length === 0 && (searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo) ? (
            <p className="mt-3 text-sm font-medium text-red-600 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>Žádné výsledky pro zadané filtry</span>
            </p>
          ) : (searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo) ? (
            <p className="mt-3 text-sm font-medium text-green-600 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
              </svg>
              <span>Nalezeno {filteredWines.length} výsledků</span>
            </p>
          ) : null}
          </div>
        </div>
      </div>
      
      {/* Collapsible Filters */}
      {showFilters && (
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/70 backdrop-blur-xl p-6 rounded-3xl border border-blue-200/50 shadow-lg transition-all duration-300">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
              Pokročilé filtry
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vintage filter */}
            <div>
              <label htmlFor="vintage-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Ročník
              </label>
              <select
                id="vintage-filter"
                value={filterVintage ?? ''}
                onChange={(e) => setFilterVintage(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
              >
                <option value="">Všechny ročníky</option>
                {getUniqueVintages().map(vintage => (
                  <option key={vintage} value={vintage}>{vintage}</option>
                ))}
              </select>
            </div>
            
            {/* Alcohol content filter */}
            <div>
              <label htmlFor="alcohol-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Obsah alkoholu
              </label>
              <select
                id="alcohol-filter"
                value={filterAlcohol ?? ''}
                onChange={(e) => setFilterAlcohol(e.target.value ? parseFloat(e.target.value) : null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
              >
                <option value="">Všechny hodnoty</option>
                {getUniqueAlcoholContents().map(content => (
                  <option key={content} value={content}>{content}%</option>
                ))}
              </select>
            </div>
            
            {/* Batch filter */}
            <div>
              <label htmlFor="batch-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Šarže
              </label>
              <select
                id="batch-filter"
                value={filterBatch ?? ''}
                onChange={(e) => setFilterBatch(e.target.value || null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
              >
                <option value="">Všechny šarže</option>
                {getUniqueBatches().map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            
            {/* Region filter */}
            <div>
              <label htmlFor="region-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                id="region-filter"
                value={filterRegion ?? ''}
                onChange={(e) => setFilterRegion(e.target.value || null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
              >
                <option value="">Všechny regiony</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            {/* Date range from */}
            <div>
              <label htmlFor="date-from-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Datum od
              </label>
              <input
                type="date"
                id="date-from-filter"
                value={filterDateFrom ?? ''}
                onChange={(e) => setFilterDateFrom(e.target.value || null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
                max={filterDateTo || getDateRange().max}
              />
            </div>
            
            {/* Date range to */}
            <div>
              <label htmlFor="date-to-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Datum do
              </label>
              <input
                type="date"
                id="date-to-filter"
                value={filterDateTo ?? ''}
                onChange={(e) => setFilterDateTo(e.target.value || null)}
                className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300 text-gray-900"
                min={filterDateFrom || getDateRange().min}
              />
            </div>
            
            </div>
            
            {/* Reset button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setFilterVintage(null);
                  setFilterAlcohol(null);
                  setFilterBatch(null);
                  setFilterRegion(null);
                  setFilterDateFrom(null);
                  setFilterDateTo(null);
                }}
                className={`px-6 py-3 text-sm font-medium rounded-2xl transition-all duration-200 ${
                  (filterVintage !== null || filterAlcohol !== null || filterBatch !== null || filterRegion !== null || filterDateFrom !== null || filterDateTo !== null) 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30' 
                    : 'bg-white/60 backdrop-blur-sm border border-gray-200/60 text-gray-500 cursor-not-allowed'
                }`}
                disabled={filterVintage === null && filterAlcohol === null && filterBatch === null && filterRegion === null && filterDateFrom === null && filterDateTo === null}
              >
                {(filterVintage !== null || filterAlcohol !== null || filterBatch !== null || filterRegion !== null || filterDateFrom !== null || filterDateTo !== null) && (
                  <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Resetovat filtry
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Wine list */}
      <div className="mt-8 flex flex-col">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-3xl border border-gray-200/60 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200/50">
                <thead className="bg-gradient-to-r from-gray-50/80 to-white/60">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-4 pl-6 pr-3 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group hover:bg-white/60 transition-colors duration-200"
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
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none group hover:bg-white/60 transition-colors duration-200"
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
                <tbody className="divide-y divide-gray-200/50 bg-white/40">
                  {currentWines.length > 0 ? (
                    currentWines.map((wine) => (
                      <tr key={wine.$id} className="hover:bg-white/60 transition-colors duration-200">
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
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
                        <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/dashboard/wines/${wine.$id}`}
                              className="px-3 py-1.5 bg-blue-50/80 text-blue-700 rounded-xl hover:bg-blue-100/80 transition-colors duration-200 text-xs font-medium"
                            >
                              Detail
                            </Link>
                            <Link
                              href={`/dashboard/wines/${wine.$id}/edit`}
                              className="px-3 py-1.5 bg-orange-50/80 text-orange-700 rounded-xl hover:bg-orange-100/80 transition-colors duration-200 text-xs font-medium"
                            >
                              Upravit
                            </Link>
                            <Link
                              href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                              className="px-3 py-1.5 bg-green-50/80 text-green-700 rounded-xl hover:bg-green-100/80 transition-colors duration-200 text-xs font-medium"
                            >
                              QR kód
                            </Link>
                            <button
                              onClick={() => handleDeleteWine(wine.$id)}
                              disabled={deletingId === wine.$id}
                              className="px-3 py-1.5 bg-red-50/80 text-red-700 rounded-xl hover:bg-red-100/80 disabled:bg-gray-50/80 disabled:text-gray-400 transition-colors duration-200 text-xs font-medium"
                            >
                              {deletingId === wine.$id ? 'Mazání...' : 'Smazat'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 px-6 text-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 to-white/40 rounded-2xl"></div>
                          <div className="relative bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50">
                            <div className="w-16 h-16 bg-gray-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            {searchTerm || filterVintage || filterAlcohol || filterBatch || filterRegion || filterDateFrom || filterDateTo ? (
                              <p className="text-gray-600 text-lg mb-6">Nebyly nalezeny žádné výsledky pro zadané filtry.</p>
                            ) : (
                              <p className="text-gray-600 text-lg mb-6">Zatím nemáte přidána žádná vína.</p>
                            )}
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
        <div className="mt-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
          <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
            <div className="flex items-center justify-between">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${currentPage <= 1 ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed' : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white shadow-sm hover:shadow-md'}`}
            >
              Předchozí
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200 ${currentPage >= totalPages ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed' : 'bg-white/80 backdrop-blur-sm border border-gray-200/60 text-gray-700 hover:bg-white shadow-sm hover:shadow-md'}`}
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
                  className={`relative inline-flex items-center rounded-l-2xl px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-200/50 backdrop-blur-sm transition-all duration-200 focus:z-20 focus:outline-offset-0 ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed bg-gray-50/80' : 'bg-white/60 hover:bg-white/80'}`}
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
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                        pageNumber === currentPage
                          ? 'z-10 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'text-gray-700 bg-white/60 backdrop-blur-sm ring-1 ring-inset ring-gray-200/50 hover:bg-white/80 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className={`relative inline-flex items-center rounded-r-2xl px-3 py-2 text-gray-500 ring-1 ring-inset ring-gray-200/50 backdrop-blur-sm transition-all duration-200 focus:z-20 focus:outline-offset-0 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed bg-gray-50/80' : 'bg-white/60 hover:bg-white/80'}`}
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
          </div>
        </div>
      )}
      
      {/* Backup/Import Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalRef} className="relative max-w-2xl w-full mx-4">
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 rounded-3xl"></div>
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200/50 flex justify-between items-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Záloha a import
                </h3>
                <button 
                  onClick={() => setShowBackupModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-8">
                <ImportExportWines />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}