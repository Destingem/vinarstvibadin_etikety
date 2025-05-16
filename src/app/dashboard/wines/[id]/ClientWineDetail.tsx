"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import DuplicateWineButton from '@/components/DuplicateWineButton';

type Wine = {
  $id: string;
  name: string;
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
  createdAt: string;
  updatedAt: string;
  userId: string;
  wineryName?: string;
  winerySlug?: string;
};

export default function ClientWineDetail({ wineId }: { wineId: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [wine, setWine] = useState<Wine | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWine = async () => {
      if (!token) {
        setError('Nejste přihlášeni');
        setLoading(false);
        return;
      }

      try {
        const response = await authFetch(`/api/wines/${wineId}`, token);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/404');
            return;
          }
          throw new Error('Nepodařilo se načíst informace o víně');
        }
        
        const data = await response.json();
        setWine(data.wine);

        // Create QR code URL
        if (data.wine?.winerySlug) {
          const baseUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '';
          setQrCodeUrl(`${baseUrl}/${data.wine.winerySlug}/${data.wine.$id}`);
        }
      } catch (err: any) {
        console.error('Error fetching wine:', err);
        setError(err.message || 'Nastala chyba při načítání dat');
      } finally {
        setLoading(false);
      }
    };

    fetchWine();
  }, [wineId, token, router]);

  if (loading) {
    return <div className="p-4 text-center">Načítám...</div>;
  }

  if (error || !wine) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-500">{error || 'Víno nebylo nalezeno'}</p>
          <Link href="/dashboard/wines" className="text-indigo-600 hover:text-indigo-900">
            Zpět na seznam vín
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="md:flex-auto">
          <div className="flex items-center">
            <Link
              href="/dashboard/wines"
              className="mr-4 text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              {wine.name}
            </h1>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {wine.vintage && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ročník {wine.vintage}
              </span>
            )}
            {wine.batch && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Šarže {wine.batch}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            href={`/dashboard/wines/${wine.$id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Upravit
          </Link>
          <DuplicateWineButton wineId={wine.$id} wineName={wine.name} />
          <Link
            href={`/dashboard/qrcodes?wineId=${wine.$id}`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Zobrazit QR kód
          </Link>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Detaily vína
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Všechny dostupné informace o tomto víně.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Název</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{wine.name}</dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Ročník</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{wine.vintage || '—'}</dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Šarže</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{wine.batch || '—'}</dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Obsah alkoholu</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {wine.alcoholContent ? `${wine.alcoholContent}% obj.` : '—'}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Energetická hodnota</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {wine.energyValueKJ || wine.energyValueKcal ? (
                  <>
                    {wine.energyValueKJ && `${wine.energyValueKJ} kJ`}
                    {wine.energyValueKJ && wine.energyValueKcal && ' / '}
                    {wine.energyValueKcal && `${wine.energyValueKcal} kcal`}
                  </>
                ) : '—'}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nutriční hodnoty (na 100 ml)</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>Tuky</span>
                    <span>{wine.fat !== null ? `${wine.fat} g` : '0 g'}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-gray-600 border-b pb-1">
                    <span>z toho nasycené mastné kyseliny</span>
                    <span>{wine.saturatedFat !== null ? `${wine.saturatedFat} g` : '0 g'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Sacharidy</span>
                    <span>{wine.carbs !== null ? `${wine.carbs} g` : '0 g'}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-gray-600 border-b pb-1">
                    <span>z toho cukry</span>
                    <span>{wine.sugars !== null ? `${wine.sugars} g` : '0 g'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Bílkoviny</span>
                    <span>{wine.protein !== null ? `${wine.protein} g` : '0 g'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Sůl</span>
                    <span>{wine.salt !== null ? `${wine.salt} g` : '0 g'}</span>
                  </div>
                </div>
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Složení</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {wine.ingredients || 'Hrozny, antioxidant: oxid siřičitý'}
              </dd>
            </div>
            
            {wine.allergens && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Alergeny</dt>
                <dd className="mt-1 text-sm text-amber-600 font-semibold sm:mt-0 sm:col-span-2">
                  {wine.allergens}
                </dd>
              </div>
            )}
            
            {(wine.wineRegion || wine.wineSubregion || wine.wineVillage || wine.wineTract) && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Původ</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-1">
                    {wine.wineRegion && (
                      <div>
                        <span className="font-medium">Vinařská oblast: </span>
                        {wine.wineRegion}
                      </div>
                    )}
                    {wine.wineSubregion && (
                      <div>
                        <span className="font-medium">Vinařská podoblast: </span>
                        {wine.wineSubregion}
                      </div>
                    )}
                    {wine.wineVillage && (
                      <div>
                        <span className="font-medium">Obec: </span>
                        {wine.wineVillage}
                      </div>
                    )}
                    {wine.wineTract && (
                      <div>
                        <span className="font-medium">Trať: </span>
                        {wine.wineTract}
                      </div>
                    )}
                  </div>
                </dd>
              </div>
            )}
            
            {wine.additionalInfo && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Další informace</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {wine.additionalInfo}
                </dd>
              </div>
            )}
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">QR kód URL</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <a
                  href={qrCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 break-all"
                >
                  {qrCodeUrl}
                </a>
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vytvořeno</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(wine.createdAt).toLocaleString('cs-CZ')}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Aktualizováno</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(wine.updatedAt).toLocaleString('cs-CZ')}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}