"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface Wine {
  $id: string;
  name: string;
  vintage?: number | null;
  batch?: string | null;
  alcoholContent?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface WineListProps {
  wines: Wine[];
  onWineDeleted?: () => void;
}

export default function WineList({ wines, onWineDeleted }: WineListProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!token) {
      setError('Nejste přihlášeni. Přihlaste se prosím a zkuste to znovu.');
      return;
    }

    if (!confirm('Opravdu chcete smazat toto víno?')) {
      return;
    }

    setIsDeleting(id);
    setError(null);

    try {
      const response = await authFetch(`/api/wines/${id}`, token, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nastala chyba při mazání vína');
      }

      // Callback to refresh the list
      if (onWineDeleted) {
        onWineDeleted();
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při mazání vína');
    } finally {
      setIsDeleting(null);
    }
  };

  if (wines.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-md p-6 text-center">
        <p className="text-gray-500">Zatím nemáte žádná vína. Vytvořte své první víno.</p>
        <Link
          href="/dashboard/wines/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Přidat víno
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-md">
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {wines.map((wine) => (
          <li key={wine.$id}>
            <div className="flex items-center px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <Link href={`/dashboard/wines/${wine.$id}`}>
                    <p className="text-sm font-medium text-indigo-600 truncate hover:underline">
                      {wine.name}
                    </p>
                  </Link>
                </div>
                <div className="mt-2 flex">
                  <div className="flex items-center text-sm text-gray-500">
                    {wine.vintage && (
                      <span className="mr-3">Ročník: {wine.vintage}</span>
                    )}
                    {wine.batch && (
                      <span className="mr-3">Šarže: {wine.batch}</span>
                    )}
                    {wine.alcoholContent && (
                      <span>Alkohol: {wine.alcoholContent}%</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/wines/${wine.$id}/edit`}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                >
                  Upravit
                </Link>
                <button
                  onClick={() => handleDelete(wine.$id)}
                  disabled={isDeleting === wine.$id}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isDeleting === wine.$id ? 'Mazání...' : 'Smazat'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}