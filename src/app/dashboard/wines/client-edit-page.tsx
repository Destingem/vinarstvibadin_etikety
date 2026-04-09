"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import WineForm from '@/components/WineForm';
import { Wine } from '@/types';
import { WorkspaceWine, formatWorkspaceDate, getComplianceChecklist } from '@/app/dashboard/wines/workspace-helpers';

type ClientEditPageProps = {
  wineId: string;
  initialWine?: WorkspaceWine | null;
};

export default function ClientEditPage({ wineId, initialWine }: ClientEditPageProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [wine, setWine] = useState<WorkspaceWine | null>(initialWine ?? null);
  const [loading, setLoading] = useState(!initialWine);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialWine) {
      setWine(initialWine);
      setLoading(false);
      return;
    }

    const fetchWine = async () => {
      if (!token) {
        setError('Nejste přihlášeni.');
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

          throw new Error('Nepodařilo se načíst víno k úpravě.');
        }

        const data = await response.json();
        setWine(data.wine);
      } catch (err: any) {
        console.error('Error fetching wine:', err);
        setError(err.message || 'Nastala chyba při načítání dat.');
      } finally {
        setLoading(false);
      }
    };

    fetchWine();
  }, [initialWine, router, token, wineId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white/80 px-6 py-16 text-center shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <div className="inline-flex items-center gap-3 text-stone-700">
            <svg className="h-6 w-6 animate-spin text-[#8A1538]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium">Načítám editaci vína…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !wine) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-red-200 bg-red-50/80 px-6 py-10 shadow-lg shadow-red-100/60">
          <p className="text-base text-red-700">{error || 'Víno nebylo nalezeno.'}</p>
          <Link
            href="/dashboard/wines"
            className="mt-4 inline-flex items-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
          >
            Zpět do katalogu
          </Link>
        </div>
      </div>
    );
  }

  const checklist = getComplianceChecklist(wine);
  const formWine: Wine = {
    ...wine,
    vintage:
      typeof wine.vintage === 'string'
        ? Number.isNaN(Number.parseInt(wine.vintage, 10))
          ? undefined
          : Number.parseInt(wine.vintage, 10)
        : wine.vintage ?? undefined,
    batch: wine.batch ?? undefined,
    alcoholContent: wine.alcoholContent ?? undefined,
    energyValueKJ: wine.energyValueKJ ?? undefined,
    energyValueKcal: wine.energyValueKcal ?? undefined,
    fat: wine.fat ?? undefined,
    saturatedFat: wine.saturatedFat ?? undefined,
    carbs: wine.carbs ?? undefined,
    sugars: wine.sugars ?? undefined,
    protein: wine.protein ?? undefined,
    salt: wine.salt ?? undefined,
    ingredients: wine.ingredients ?? undefined,
    additionalInfo: wine.additionalInfo ?? undefined,
    allergens: wine.allergens ?? undefined,
    wineRegion: wine.wineRegion ?? undefined,
    wineSubregion: wine.wineSubregion ?? undefined,
    wineVillage: wine.wineVillage ?? undefined,
    wineTract: wine.wineTract ?? undefined,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(138,21,56,0.14),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,247,242,0.92))] px-5 py-6 shadow-xl shadow-stone-200/40 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(156,114,82,0.16),_transparent_56%)] lg:block" />
        <div className="relative">
          <Link href={`/dashboard/wines/${wine.$id}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#8A1538] transition hover:text-[#73102f]">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Zpět do detailu vína
          </Link>

          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A1538]/70">Wine Workspace / editace</p>
              <h1 className="mt-2 font-serif text-3xl text-stone-900 sm:text-4xl">Upravit {wine.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Tady doplníte compliance údaje a připravíte víno pro veřejnou etiketu i navazující QR/export workflow.
              </p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Poslední úprava</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{formatWorkspaceDate(wine.updatedAt)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <WineForm wine={formWine} isEditing={true} />
        </div>

        <aside className="space-y-6">
          <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
            <h2 className="text-xl font-semibold text-stone-900">Compliance-first checklist</h2>
            <p className="mt-1 text-sm text-stone-600">Před uložením zkontrolujte hlavně bloky, které ovlivní veřejnou etiketu.</p>

            <ul className="mt-5 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-stone-700">{item.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.done ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      }`}
                    >
                      {item.done ? 'Vyplněno' : 'Doplnit'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{item.hint}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
            <h2 className="text-xl font-semibold text-stone-900">Co bude následovat</h2>
            <p className="mt-1 text-sm text-stone-600">Po uložení se vrátíte do detailu vína. Odtud navazuje další práce.</p>

            <ul className="mt-5 space-y-3 text-sm text-stone-600">
              <li>1. Ověřte detail vína a stav etikety.</li>
              <li>2. Otevřete QR a export pro tiskové podklady.</li>
              <li>3. Otestujte veřejnou etiketu na telefonu.</li>
            </ul>

            <div className="mt-5 grid gap-3">
              <Link
                href={`/dashboard/wines/${wine.$id}`}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Zpět do detailu
              </Link>
              <Link
                href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
              >
                Přejít na QR a export
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
