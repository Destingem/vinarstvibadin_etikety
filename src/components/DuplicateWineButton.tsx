"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface DuplicateWineButtonProps {
  wineId: string;
  wineName: string;
}

export default function DuplicateWineButton({ wineId, wineName }: DuplicateWineButtonProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState('');
  const [newVintage, setNewVintage] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeModal = () => {
    setIsModalOpen(false);
    setNewBatch('');
    setNewVintage(undefined);
    setError(null);
  };

  const handleDuplicate = async () => {
    if (!token || !isModalOpen) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch('/api/wines/duplicate', token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wineId,
          newBatch,
          newVintage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Duplikace vína selhala.');
      }

      const data = await response.json();
      closeModal();
      router.push(`/dashboard/wines/${data.wine.$id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Nastala chyba při duplikaci vína.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
      >
        Duplikovat jako novou verzi
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-stone-900/45 backdrop-blur-sm sm:items-stretch sm:justify-end">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Zavřít panel duplikace"
            className="absolute inset-0"
          />
          <div
            className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-stone-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,247,242,0.96))] shadow-2xl shadow-stone-900/20 sm:ml-auto sm:h-full sm:max-w-xl sm:rounded-none sm:border-y-0 sm:border-r-0 sm:rounded-l-[2rem]"
          >
            <div className="border-b border-stone-200 px-6 py-5 sm:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">Duplikace</p>
                  <h3 className="mt-2 font-serif text-3xl text-stone-900">Vytvořit novou pracovní verzi</h3>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-stone-600">
                    Zkopírujete víno <span className="font-medium text-stone-900">{wineName}</span> a případně změníte
                    ročník nebo šarži pro další etiketu.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition hover:bg-stone-50 hover:text-stone-700"
                  aria-label="Zavřít panel duplikace"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid gap-4">
                <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4 text-sm text-stone-600">
                  Hodí se pro nový ročník, novou šarži nebo variantu etikety bez ručního přepisování všech údajů.
                </div>

                <div className="rounded-3xl border border-stone-200 bg-white/80 p-4 text-sm text-stone-600">
                  <p className="font-medium text-stone-900">Co se stane po vytvoření kopie</p>
                  <p className="mt-2">Nové víno otevřeme rovnou do detailu, kde můžete navázat QR, export nebo další úpravy.</p>
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="newBatch" className="mb-2 block text-sm font-medium text-stone-700">
                    Nová šarže
                  </label>
                  <input
                    id="newBatch"
                    type="text"
                    value={newBatch}
                    onChange={(event) => setNewBatch(event.target.value)}
                    placeholder="Např. 2026-A"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:ring-2 focus:ring-[#8A1538]/15"
                  />
                </div>

                <div>
                  <label htmlFor="newVintage" className="mb-2 block text-sm font-medium text-stone-700">
                    Nový ročník
                  </label>
                  <input
                    id="newVintage"
                    type="number"
                    value={newVintage || ''}
                    onChange={(event) => setNewVintage(event.target.value ? parseInt(event.target.value, 10) : undefined)}
                    placeholder="Např. 2025"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#8A1538]/40 focus:ring-2 focus:ring-[#8A1538]/15"
                  />
                </div>
              </div>

              <p className="mt-5 text-sm text-stone-500">
                Necháte-li pole prázdná, vznikne kopie se stejnou identifikací a změny doplníte až v detailu vína.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-stone-200 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDuplicate}
                disabled={isLoading}
                className="rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Vytvářím kopii…' : 'Vytvořit kopii a otevřít detail'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
