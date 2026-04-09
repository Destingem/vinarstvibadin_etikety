"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import ImportExportWines from '@/components/ImportExportWines';
import { Wine as WineType } from '@/types';

type NullableWineFields = {
  vintage?: number | null;
  batch?: string | null;
  alcoholContent?: number | null;
  energyValueKJ?: number | null;
  energyValueKcal?: number | null;
  fat?: number | null;
  saturatedFat?: number | null;
  carbs?: number | null;
  sugars?: number | null;
  protein?: number | null;
  salt?: number | null;
  ingredients?: string | null;
  additionalInfo?: string | null;
  allergens?: string | null;
  wineRegion?: string | null;
  wineSubregion?: string | null;
  wineVillage?: string | null;
  wineTract?: string | null;
};

type Wine = Omit<WineType, keyof NullableWineFields> & NullableWineFields;

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

type ClientWinesPageProps = {
  initialData?: WinesData | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatAlcohol(value?: number | null) {
  return value ? `${value}% obj.` : 'Bez údaje';
}

function getLabelTone(ready: boolean) {
  return ready
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
}

export default function ClientWinesPage({ initialData }: ClientWinesPageProps) {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const [data, setData] = useState<WinesData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWines, setFilteredWines] = useState<Wine[]>(initialData?.wines ?? []);
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = Number(searchParams.get('page') || '1');
    return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  });
  const [sortField, setSortField] = useState<keyof Wine>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterVintage, setFilterVintage] = useState<number | null>(null);
  const [filterAlcohol, setFilterAlcohol] = useState<number | null>(null);
  const [filterBatch, setFilterBatch] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState<string | null>(null);
  const [filterDateFrom, setFilterDateFrom] = useState<string | null>(null);
  const [filterDateTo, setFilterDateTo] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showTransferPanel, setShowTransferPanel] = useState(false);
  const itemsPerPage = 10;

  const fetchWines = useCallback(async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/wines?limit=1000', token);

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst katalog vín.');
      }

      const winesData = await response.json();
      setData(winesData);
      setFilteredWines(winesData.wines);
    } catch (err: any) {
      console.error('Error fetching wines:', err);
      setError(err.message || 'Při načítání katalogu došlo k chybě.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setData(initialData);
    setFilteredWines(initialData.wines);
    setLoading(false);
  }, [initialData]);

  const handleDeleteWine = async (wineId: string) => {
    if (!token) {
      return;
    }

    if (!confirm('Opravdu chcete toto víno odstranit z katalogu?')) {
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
        throw new Error(errorData.message || 'Mazání vína selhalo.');
      }

      await fetchWines();
    } catch (err: any) {
      console.error('Error deleting wine:', err);
      setError(err.message || 'Mazání vína selhalo.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    let filtered = [...data.wines];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((wine) => {
        return (
          wine.name.toLowerCase().includes(searchLower) ||
          wine.vintage?.toString().includes(searchLower) ||
          wine.batch?.toLowerCase().includes(searchLower) ||
          wine.wineRegion?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (filterVintage !== null) {
      filtered = filtered.filter((wine) => wine.vintage === filterVintage);
    }

    if (filterAlcohol !== null) {
      filtered = filtered.filter((wine) => wine.alcoholContent === filterAlcohol);
    }

    if (filterBatch) {
      filtered = filtered.filter((wine) => wine.batch === filterBatch);
    }

    if (filterRegion) {
      filtered = filtered.filter((wine) => wine.wineRegion === filterRegion);
    }

    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      filtered = filtered.filter((wine) => new Date(wine.createdAt) >= fromDate);
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((wine) => new Date(wine.createdAt) <= toDate);
    }

    filtered.sort((a, b) => {
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'cs')
          : bValue.localeCompare(aValue, 'cs');
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    setFilteredWines(filtered);
    setCurrentPage(1);
  }, [
    data,
    filterAlcohol,
    filterBatch,
    filterDateFrom,
    filterDateTo,
    filterRegion,
    filterVintage,
    searchTerm,
    sortDirection,
    sortField,
  ]);

  useEffect(() => {
    if (initialData) {
      return;
    }

    fetchWines();
  }, [fetchWines, initialData]);

  const handleSort = (field: keyof Wine) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection(field === 'updatedAt' || field === 'createdAt' ? 'desc' : 'asc');
  };

  const getUniqueVintages = () => {
    if (!data) {
      return [];
    }

    const vintages = data.wines
      .map((wine) => wine.vintage)
      .filter((value): value is number => value !== null && value !== undefined);

    return Array.from(new Set(vintages)).sort((a, b) => a - b);
  };

  const getUniqueAlcoholContents = () => {
    if (!data) {
      return [];
    }

    const alcoholContents = data.wines
      .map((wine) => wine.alcoholContent)
      .filter((value): value is number => value !== null && value !== undefined);

    return Array.from(new Set(alcoholContents)).sort((a, b) => a - b);
  };

  const getUniqueBatches = () => {
    if (!data) {
      return [];
    }

    const batches = data.wines
      .map((wine) => wine.batch)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(batches)).sort();
  };

  const getUniqueRegions = () => {
    if (!data) {
      return [];
    }

    const regions = data.wines
      .map((wine) => wine.wineRegion)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set(regions)).sort();
  };

  const getDateRange = () => {
    if (!data || data.wines.length === 0) {
      return { min: '', max: '' };
    }

    const dates = data.wines.map((wine) => new Date(wine.createdAt).getTime());

    return {
      min: new Date(Math.min(...dates)).toISOString().split('T')[0],
      max: new Date(Math.max(...dates)).toISOString().split('T')[0],
    };
  };

  const clearFilters = () => {
    setFilterVintage(null);
    setFilterAlcohol(null);
    setFilterBatch(null);
    setFilterRegion(null);
    setFilterDateFrom(null);
    setFilterDateTo(null);
  };

  const activeFilters = [
    filterVintage !== null ? { label: `Ročník ${filterVintage}`, onRemove: () => setFilterVintage(null) } : null,
    filterAlcohol !== null ? { label: `Alkohol ${filterAlcohol}%`, onRemove: () => setFilterAlcohol(null) } : null,
    filterBatch ? { label: `Šarže ${filterBatch}`, onRemove: () => setFilterBatch(null) } : null,
    filterRegion ? { label: `Region ${filterRegion}`, onRemove: () => setFilterRegion(null) } : null,
    filterDateFrom ? { label: `Od ${formatDate(filterDateFrom)}`, onRemove: () => setFilterDateFrom(null) } : null,
    filterDateTo ? { label: `Do ${formatDate(filterDateTo)}`, onRemove: () => setFilterDateTo(null) } : null,
  ].filter(Boolean) as Array<{ label: string; onRemove: () => void }>;

  const totalItems = filteredWines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWines = filteredWines.slice(startIndex, endIndex);

  const totalCatalog = data?.wines.length ?? 0;
  const qrReadyCount = data?.wines.filter((wine) => Boolean(wine.winerySlug)).length ?? 0;
  const completedCount =
    data?.wines.filter((wine) => Boolean(wine.alcoholContent) && Boolean(wine.ingredients)).length ?? 0;
  const searchPanelMessage = showTransferPanel
    ? 'Datový přenos je otevřený níže. Po importu se katalog automaticky obnoví.'
    : 'Detail otevírá pracovní prostor vína. QR a úpravy zůstávají dostupné přímo z katalogu.';

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white/80 px-6 py-16 shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-3 text-stone-700">
            <svg className="h-6 w-6 animate-spin text-[#8A1538]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium">Načítám katalog vín…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 pb-10 sm:px-4 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(138,21,56,0.14),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,247,242,0.92))] px-5 py-6 shadow-xl shadow-stone-200/40 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(156,114,82,0.16),_transparent_56%)] lg:block" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8A1538]/70">Katalog</p>
            <h1 className="mt-3 font-serif text-3xl text-stone-900 sm:text-4xl">Katalog a další krok pro každé víno</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Hledejte, filtrujte a otevírejte vína rovnou do pracovního prostoru, QR výstupu nebo úprav etikety.
              Import a export katalogu držíme hned po ruce, aby další krok nebyl schovaný mimo tuto plochu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Celkem vín</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{totalCatalog}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Připraveno pro QR</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{qrReadyCount}</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Se základní etiketou</p>
              <p className="mt-2 text-3xl font-semibold text-stone-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            href="/dashboard/wines/new"
            className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
          >
            Přidat víno
          </Link>
          <button
            type="button"
            onClick={() => setShowFilters((previous) => !previous)}
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white/75 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
          >
            {showFilters ? 'Skrýt filtry' : 'Zobrazit filtry'}
            {activeFilters.length > 0 ? ` (${activeFilters.length})` : ''}
          </button>
          <button
            type="button"
            onClick={() => setShowTransferPanel((previous) => !previous)}
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white/75 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-white"
          >
            {showTransferPanel ? 'Skrýt datový přenos' : 'Otevřít datový přenos'}
          </button>
        </div>

        <div className="relative mt-6 grid gap-3 border-t border-stone-200/70 pt-5 text-sm text-stone-600 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Nový záznam</p>
            <p className="mt-2">Přidejte víno, pokud zakládáte novou etiketu nebo nový pracovní záznam.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Pokračovat v práci</p>
            <p className="mt-2">Detail otevírá hlavní workspace vína. Odtud pokračujete do QR, exportu i úprav.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Přesun katalogu</p>
            <p className="mt-2">Import a export použijte pro zálohu, obnovu nebo přenos katalogu mezi prostředími.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
          <div>
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-stone-700">
              Hledat v katalogu
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-stone-400">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 py-3 pl-11 pr-11 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
                placeholder="Název, ročník, šarže nebo oblast"
              />
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-400 transition hover:text-[#8A1538]"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-600">
            <p className="font-medium text-stone-900">{totalItems} položek po filtrování</p>
            <p className="mt-1">{searchPanelMessage}</p>
          </div>
        </div>

        {activeFilters.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex items-center gap-2 rounded-full bg-[#8A1538]/8 px-3 py-1.5 text-xs font-medium text-[#8A1538] transition hover:bg-[#8A1538]/12"
              >
                {filter.label}
                <span aria-hidden="true">×</span>
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-700"
            >
              Vymazat vše
            </button>
          </div>
        ) : null}
      </section>

      {showFilters ? (
        <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white/80 p-4 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Filtry katalogu</h2>
              <p className="mt-1 text-sm text-stone-600">Zužte katalog podle šarže, regionu nebo období založení.</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilters.length === 0}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Resetovat
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div>
              <label htmlFor="vintage-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Ročník
              </label>
              <select
                id="vintage-filter"
                value={filterVintage ?? ''}
                onChange={(event) => setFilterVintage(event.target.value ? parseInt(event.target.value, 10) : null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              >
                <option value="">Všechny ročníky</option>
                {getUniqueVintages().map((vintage) => (
                  <option key={vintage} value={vintage}>
                    {vintage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="alcohol-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Obsah alkoholu
              </label>
              <select
                id="alcohol-filter"
                value={filterAlcohol ?? ''}
                onChange={(event) => setFilterAlcohol(event.target.value ? parseFloat(event.target.value) : null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              >
                <option value="">Všechny hodnoty</option>
                {getUniqueAlcoholContents().map((content) => (
                  <option key={content} value={content}>
                    {content}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="batch-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Šarže
              </label>
              <select
                id="batch-filter"
                value={filterBatch ?? ''}
                onChange={(event) => setFilterBatch(event.target.value || null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              >
                <option value="">Všechny šarže</option>
                {getUniqueBatches().map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="region-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Region
              </label>
              <select
                id="region-filter"
                value={filterRegion ?? ''}
                onChange={(event) => setFilterRegion(event.target.value || null)}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              >
                <option value="">Všechny regiony</option>
                {getUniqueRegions().map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-from-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Vytvořeno od
              </label>
              <input
                id="date-from-filter"
                type="date"
                value={filterDateFrom ?? ''}
                onChange={(event) => setFilterDateFrom(event.target.value || null)}
                max={filterDateTo || getDateRange().max}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              />
            </div>

            <div>
              <label htmlFor="date-to-filter" className="mb-2 block text-sm font-medium text-stone-700">
                Vytvořeno do
              </label>
              <input
                id="date-to-filter"
                type="date"
                value={filterDateTo ?? ''}
                onChange={(event) => setFilterDateTo(event.target.value || null)}
                min={filterDateFrom || getDateRange().min}
                className="w-full rounded-2xl border border-stone-200 bg-stone-50/70 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:bg-white focus:ring-2 focus:ring-[#8A1538]/15"
              />
            </div>
          </div>
        </section>
      ) : null}

      {showTransferPanel ? (
        <section className="mt-6">
          <ImportExportWines />
        </section>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {!data || data.wines.length === 0 ? (
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 p-6 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="mt-5 font-serif text-3xl text-stone-900">Začněte prvním vínem</h2>
            <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">
              Jakmile přidáte první záznam, otevře se vám detail vína, QR kód i export. Pokud už katalog máte jinde,
              můžete ho rovnou naimportovat.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/wines/new"
                className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
              >
                Přidat první víno
              </Link>
              <button
                type="button"
                onClick={() => setShowTransferPanel(true)}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Otevřít datový přenos
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 overflow-hidden rounded-[2rem] border border-stone-200 bg-white/80 shadow-lg shadow-stone-200/30 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Katalog vín</h2>
              <p className="mt-1 text-sm text-stone-600">
                {startIndex + 1}-{Math.min(endIndex, totalItems)} z {totalItems} položek
              </p>
            </div>
            <div className="hidden text-sm text-stone-500 sm:block">Detail = workspace, QR = výstup, Upravit = zásah do etikety</div>
          </div>

          {currentWines.length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className="mx-auto max-w-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4m6 0a2 2 0 002 2h2a2 2 0 002-2m-6 0V9a2 2 0 012-2h2a2 2 0 012 2v8m0 0a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v12z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-stone-900">Filtr nic nevrátil</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Zkuste upravit hledání nebo resetovat aktivní filtry. Katalogová data zůstala beze změny.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    clearFilters();
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-2xl border border-stone-200 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Vyčistit hledání
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full divide-y divide-stone-200">
                  <thead className="bg-stone-50/80 text-left text-xs uppercase tracking-[0.2em] text-stone-500">
                    <tr>
                      <th className="px-6 py-4 font-medium">
                        <button type="button" onClick={() => handleSort('name')} className="inline-flex items-center gap-2">
                          Název
                        </button>
                      </th>
                      <th className="px-6 py-4 font-medium">
                        <button type="button" onClick={() => handleSort('vintage')} className="inline-flex items-center gap-2">
                          Identifikace
                        </button>
                      </th>
                      <th className="px-6 py-4 font-medium">
                        <button type="button" onClick={() => handleSort('wineRegion')} className="inline-flex items-center gap-2">
                          Etiketa
                        </button>
                      </th>
                      <th className="px-6 py-4 font-medium">
                        <button type="button" onClick={() => handleSort('updatedAt')} className="inline-flex items-center gap-2">
                          Aktualizováno
                        </button>
                      </th>
                      <th className="px-6 py-4 text-right font-medium">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/80">
                    {currentWines.map((wine) => {
                      const hasEssentials = Boolean(wine.alcoholContent) && Boolean(wine.ingredients);
                      return (
                        <tr key={wine.$id} className="transition hover:bg-stone-50/70">
                          <td className="px-6 py-5 align-top">
                            <div className="font-medium text-stone-900">{wine.name}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {wine.batch ? (
                                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                                  Šarže {wine.batch}
                                </span>
                              ) : null}
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getLabelTone(hasEssentials)}`}>
                                {hasEssentials ? 'Etiketa připravena' : 'Doplnit etiketu'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top text-sm text-stone-600">
                            <p>{wine.vintage ? `Ročník ${wine.vintage}` : 'Ročník není uveden'}</p>
                            <p className="mt-1">{formatAlcohol(wine.alcoholContent)}</p>
                          </td>
                          <td className="px-6 py-5 align-top text-sm text-stone-600">
                            <p>{wine.wineRegion || 'Oblast není vyplněna'}</p>
                            <p className="mt-1">{wine.winerySlug ? 'Veřejná etiketa aktivní' : 'Čeká na veřejnou URL'}</p>
                          </td>
                          <td className="px-6 py-5 align-top text-sm text-stone-600">
                            <p>{formatDate(wine.updatedAt)}</p>
                            <p className="mt-1 text-xs text-stone-400">Vytvořeno {formatDate(wine.createdAt)}</p>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/dashboard/wines/${wine.$id}`}
                                className="inline-flex items-center rounded-xl bg-[#8A1538] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#73102f]"
                              >
                                Detail
                              </Link>
                              <Link
                                href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                                className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                              >
                                QR
                              </Link>
                              <Link
                                href={`/dashboard/wines/${wine.$id}/edit`}
                                className="inline-flex items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                              >
                                Upravit
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteWine(wine.$id)}
                                disabled={deletingId === wine.$id}
                                className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === wine.$id ? 'Mažu…' : 'Smazat'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-stone-200 lg:hidden">
                {currentWines.map((wine) => {
                  const hasEssentials = Boolean(wine.alcoholContent) && Boolean(wine.ingredients);
                  return (
                    <article key={wine.$id} className="px-5 py-5 sm:px-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link href={`/dashboard/wines/${wine.$id}`} className="text-lg font-semibold text-stone-900">
                            {wine.name}
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {wine.vintage ? (
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                                {wine.vintage}
                              </span>
                            ) : null}
                            {wine.batch ? (
                              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                                {wine.batch}
                              </span>
                            ) : null}
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getLabelTone(hasEssentials)}`}>
                              {hasEssentials ? 'Připraveno' : 'Doplnit'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-stone-400">
                          <p>{formatDate(wine.updatedAt)}</p>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-stone-50 px-3 py-3">
                          <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Alkohol</dt>
                          <dd className="mt-1 font-medium text-stone-900">{formatAlcohol(wine.alcoholContent)}</dd>
                        </div>
                        <div className="rounded-2xl bg-stone-50 px-3 py-3">
                          <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Region</dt>
                          <dd className="mt-1 font-medium text-stone-900">{wine.wineRegion || 'Bez údaje'}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href={`/dashboard/wines/${wine.$id}`}
                          className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
                        >
                          Otevřít detail
                        </Link>
                        <Link
                          href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                          className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          QR kód
                        </Link>
                        <Link
                          href={`/dashboard/wines/${wine.$id}/edit`}
                          className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          Upravit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteWine(wine.$id)}
                          disabled={deletingId === wine.$id}
                          className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === wine.$id ? 'Mažu…' : 'Smazat'}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-col gap-4 rounded-[2rem] border border-stone-200 bg-white/80 px-5 py-4 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-stone-600">
            Strana {currentPage} z {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage <= 1}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Předchozí
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
              disabled={currentPage >= totalPages}
              className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Další
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
