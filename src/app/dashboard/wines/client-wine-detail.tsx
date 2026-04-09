"use client";

import { type ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import DuplicateWineButton from '@/components/DuplicateWineButton';
import {
  WorkspaceWine,
  formatWorkspaceAlcohol,
  formatWorkspaceDate,
  getComplianceChecklist,
  getNutritionOverview,
} from '@/app/dashboard/wines/workspace-helpers';

type ClientWineDetailProps = {
  wineId: string;
  initialWine?: WorkspaceWine | null;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/75 px-4 py-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-stone-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-stone-500">{hint}</p> : null}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white/80 p-5 shadow-lg shadow-stone-200/30 backdrop-blur-xl sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
          <p className="mt-1 text-sm text-stone-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function FieldRow({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value?: string | null;
  tone?: 'default' | 'warning';
}) {
  const valueClass =
    tone === 'warning' ? 'text-amber-700 font-medium' : value ? 'text-stone-900' : 'text-stone-400';

  return (
    <div className="border-b border-stone-200/80 py-3 last:border-b-0">
      <dt className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</dt>
      <dd className={`mt-1 text-sm leading-6 ${valueClass}`}>{value || 'Nevyplněno'}</dd>
    </div>
  );
}

function NutritionCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-stone-50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-base font-medium text-stone-900">{value}</p>
    </div>
  );
}

function buildPublicWineUrl(winerySlug: string, wineId: string) {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.protocol}//${window.location.host}/${winerySlug}/${wineId}`;
}

export default function ClientWineDetail({ wineId, initialWine }: ClientWineDetailProps) {
  const router = useRouter();
  const { token } = useAuth();
  const [wine, setWine] = useState<WorkspaceWine | null>(initialWine ?? null);
  const [publicUrl, setPublicUrl] = useState('');
  const [loading, setLoading] = useState(!initialWine);
  const [error, setError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (wine?.winerySlug) {
      setPublicUrl(buildPublicWineUrl(wine.winerySlug, wineId));
    }
  }, [wine, wineId]);

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

          throw new Error('Nepodařilo se načíst detail vína.');
        }

        const data = await response.json();
        setWine(data.wine);

        if (data.wine?.winerySlug && typeof window !== 'undefined') {
          setPublicUrl(`${window.location.protocol}//${window.location.host}/${data.wine.winerySlug}/${data.wine.$id}`);
        }
      } catch (err: any) {
        console.error('Error fetching wine:', err);
        setError(err.message || 'Nastala chyba při načítání detailu.');
      } finally {
        setLoading(false);
      }
    };

    fetchWine();
  }, [initialWine, router, token, wineId]);

  const handleCopyPublicUrl = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('error');
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-stone-200 bg-white/80 px-6 py-16 text-center shadow-xl shadow-stone-200/40 backdrop-blur-xl">
          <div className="inline-flex items-center gap-3 text-stone-700">
            <svg className="h-6 w-6 animate-spin text-[#8A1538]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-lg font-medium">Načítám Wine Workspace…</span>
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

  const complianceChecklist = getComplianceChecklist(wine);
  const nutrition = getNutritionOverview(wine);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(138,21,56,0.14),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,247,242,0.92))] px-5 py-6 shadow-xl shadow-stone-200/40 sm:px-8 sm:py-8">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top_right,_rgba(156,114,82,0.16),_transparent_56%)] lg:block" />
        <div className="relative">
          <Link href="/dashboard/wines" className="inline-flex items-center gap-2 text-sm font-medium text-[#8A1538] transition hover:text-[#73102f]">
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Zpět do katalogu
          </Link>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {wine.vintage ? (
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">Ročník {wine.vintage}</span>
                ) : null}
                {wine.batch ? (
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">Šarže {wine.batch}</span>
                ) : null}
                <span className="rounded-full bg-[#8A1538]/8 px-3 py-1 text-xs font-medium text-[#8A1538]">
                  {wine.wineryName || 'Wine Workspace'}
                </span>
              </div>
              <h1 className="mt-4 font-serif text-3xl text-stone-900 sm:text-4xl">{wine.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                Compliance-first detail vína: nejdřív zkontrolujte etiketu a další krok udělejte přes QR/export nebo editaci.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
              <Link
                href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
              >
                QR a export
              </Link>
              <Link
                href={`/dashboard/wines/${wine.$id}/edit`}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Upravit víno
              </Link>
              <DuplicateWineButton wineId={wine.$id} wineName={wine.name} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Obsah alkoholu" value={formatWorkspaceAlcohol(wine.alcoholContent)} />
            <StatCard label="Veřejná etiketa" value={publicUrl ? 'Připravená' : 'Čeká na URL'} />
            <StatCard label="Vytvořeno" value={formatWorkspaceDate(wine.createdAt)} />
            <StatCard label="Poslední úprava" value={formatWorkspaceDate(wine.updatedAt)} />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Panel
            title="Povinné údaje etikety"
            description="Nejdůležitější blok pro veřejný detail vína a další export."
            action={
              <Link
                href={`/dashboard/wines/${wine.$id}/edit`}
                className="rounded-2xl border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Doplnit údaje
              </Link>
            }
          >
            <dl>
              <FieldRow label="Název vína" value={wine.name} />
              <FieldRow label="Obsah alkoholu" value={formatWorkspaceAlcohol(wine.alcoholContent)} />
              <FieldRow
                label="Složení"
                value={wine.ingredients || 'Doporučeno doplnit přesné složení pro veřejnou etiketu.'}
                tone={wine.ingredients ? 'default' : 'warning'}
              />
              <FieldRow label="Alergeny" value={wine.allergens} tone={wine.allergens ? 'warning' : 'default'} />
              <FieldRow label="Další informace" value={wine.additionalInfo} />
            </dl>
          </Panel>

          <Panel
            title="Výživové údaje na 100 ml"
            description="Připravené pro etiketu i QR detail bez potřeby dalšího přepisu."
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {nutrition.map((item) => (
                <NutritionCell key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </Panel>

          <Panel
            title="Původ a identifikace"
            description="Pomocné údaje pro důvěryhodnost etikety, orientaci i budoucí export."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <NutritionCell label="Ročník" value={wine.vintage ? `${wine.vintage}` : 'Bez údaje'} />
              <NutritionCell label="Šarže" value={wine.batch || 'Bez údaje'} />
              <NutritionCell label="Vinařská oblast" value={wine.wineRegion || 'Bez údaje'} />
              <NutritionCell label="Vinařská podoblast" value={wine.wineSubregion || 'Bez údaje'} />
              <NutritionCell label="Obec" value={wine.wineVillage || 'Bez údaje'} />
              <NutritionCell label="Trať" value={wine.wineTract || 'Bez údaje'} />
            </div>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel
            title="Next steps"
            description="Co ještě zkontrolovat, než víno pošlete do QR/export workflow."
          >
            <ul className="space-y-3">
              {complianceChecklist.map((item) => (
                <li key={item.label} className="rounded-2xl bg-stone-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-stone-700">{item.label}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.done ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                      }`}
                    >
                      {item.done ? 'Hotovo' : 'Chybí'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{item.hint}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="QR a veřejná etiketa"
            description="Pokračování z detailu vede rovnou do exportní plochy."
          >
            <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Veřejná URL</p>
              {publicUrl ? (
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block break-all text-sm font-medium text-[#8A1538] transition hover:text-[#73102f]">
                  {publicUrl}
                </a>
              ) : (
                <p className="mt-2 text-sm text-stone-500">Veřejná URL zatím není k dispozici.</p>
              )}
            </div>

            <div className="mt-4 grid gap-3">
              <Link
                href={`/dashboard/qrcodes?wineId=${wine.$id}`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#8A1538] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#73102f]"
              >
                Otevřít QR a export
              </Link>
              <button
                type="button"
                onClick={handleCopyPublicUrl}
                disabled={!publicUrl}
                className="inline-flex items-center justify-center rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copyState === 'copied' ? 'URL zkopírována' : copyState === 'error' ? 'Kopírování selhalo' : 'Kopírovat veřejnou URL'}
              </button>
            </div>
          </Panel>

          <Panel title="Metadata" description="Technický kontext záznamu pro interní orientaci.">
            <dl className="space-y-4 text-sm text-stone-600">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Dokument</dt>
                <dd className="mt-1 break-all font-medium text-stone-900">{wine.$id}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Vytvořeno</dt>
                <dd className="mt-1">{formatWorkspaceDate(wine.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-stone-500">Aktualizováno</dt>
                <dd className="mt-1">{formatWorkspaceDate(wine.updatedAt)}</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
