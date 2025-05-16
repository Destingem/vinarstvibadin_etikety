"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import WineForm from '@/components/WineForm';
import { Wine } from '@/types';

export default function ClientEditPage({ wineId }: { wineId: string }) {
  const router = useRouter();
  const { token } = useAuth();
  const [wine, setWine] = useState<Wine | null>(null);
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
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <div className="flex items-center">
            <Link
              href={`/dashboard/wines/${wine.$id}`}
              className="mr-4 text-indigo-600 hover:text-indigo-900"
            >
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Upravit víno: {wine.name}
            </h1>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Upravte informace o víně.
          </p>
        </div>
      </div>
      
      <WineForm wine={wine} isEditing={true} />
    </div>
  );
}