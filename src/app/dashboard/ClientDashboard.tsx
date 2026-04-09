"use client";

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';

import MembershipStatusWidget from '@/components/MembershipStatusWidget';
import { Badge } from '@/components/ui/badge';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { Surface } from '@/components/ui/surface';
import { authFetch } from '@/lib/api-helpers';
import { useAuth } from '@/lib/auth-context';

export type DashboardWine = {
  id: string;
  name: string;
  vintage?: number | string;
  batch?: string;
  createdAt: string;
  updatedAt?: string;
  winerySlug?: string;
};

type Winery = {
  name?: string;
  displayName?: string;
  slug?: string;
  email?: string;
  _count?: {
    wines: number;
  };
};

type DashboardOverviewProfile = {
  displayName: string;
  slug?: string;
  email?: string;
  locale?: string;
  isAdmin?: boolean;
  isDemo?: boolean;
};

type DashboardOverview = {
  profile: DashboardOverviewProfile;
  metrics: {
    totalWines: number;
  };
  recentWines: DashboardWine[];
};

export type DashboardHomeData = {
  winery: Winery | null;
  allWines: DashboardWine[];
  overview?: DashboardOverview | null;
};

type ClientDashboardProps = {
  initialData?: DashboardHomeData | null;
};

type WorkspaceModule = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  badge?: ReactNode;
};

type QueueStep = {
  title: string;
  description: string;
  href: string;
  badge: ReactNode;
};

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 5v14m-7-7h14" />
    </svg>
  );
}

function BottleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M10 3h4m-3 0v4l-3 3.5V19a2 2 0 002 2h4a2 2 0 002-2v-8.5L13 7V3"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M7 7h.01M3 11l8.586 8.586a2 2 0 002.828 0l6.172-6.172a2 2 0 000-2.828L11 2H4a1 1 0 00-1 1v8z"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 9v3.75m0 3h.008v.008H12v-.008zm8.25-.75a8.25 8.25 0 11-16.5 0 8.25 8.25 0 0116.5 0z"
      />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 4h5v5H4V4zm11 0h5v5h-5V4zM4 15h5v5H4v-5zm11 5v-2m0-4v-1m0-4h5v5h-2m-3 6h5m-8 0h1m-1-8h1m-5 3h5"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 19h16M7 16V9m5 7V5m5 11v-4"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M15 7a5 5 0 11-9.584 2H3v4h4v3h3v3h4l1.126-1.126A5 5 0 0015 7z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M10.325 4.317a1 1 0 011.35-.936l.866.347a1 1 0 00.95-.083l.762-.508a1 1 0 011.213.126l1.414 1.414a1 1 0 01.126 1.213l-.508.762a1 1 0 00-.083.95l.347.866a1 1 0 01-.936 1.35h-.865a1 1 0 00-.965.738l-.246.985a1 1 0 01-.97.777h-2a1 1 0 01-.97-.777l-.246-.985A1 1 0 009.54 9.848h-.865a1 1 0 01-.936-1.35l.347-.866a1 1 0 00-.083-.95l-.508-.762a1 1 0 01.126-1.213L9.035 3.29a1 1 0 011.213-.126l.762.508a1 1 0 00.95.083l.866-.347a1 1 0 011.35.936v.865a1 1 0 00.738.965l.985.246a1 1 0 01.777.97v2a1 1 0 01-.777.97l-.985.246a1 1 0 00-.738.965v.865z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  );
}

export default function ClientDashboard({ initialData = null }: ClientDashboardProps) {
  const { user, token, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardHomeData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasServerSeed = Boolean(initialData);

  useEffect(() => {
    if (!initialData) {
      return;
    }

    setData((current) => current ?? initialData);
    setLoading(false);
  }, [initialData]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (authLoading) {
        return;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const hasRenderableData = hasServerSeed;

      if (hasRenderableData) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await authFetch('/api/dashboard', token);

        if (!response.ok) {
          setError(
            hasRenderableData
              ? 'Nepodarilo se obnovit dashboard. Zobrazuji posledni dostupny prehled.'
              : 'Nepodarilo se nacist operativni prehled dashboardu.'
          );
          return;
        }

        const dashboardData = (await response.json()) as DashboardHomeData;
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(
          hasRenderableData
            ? 'Synchronizace dashboardu selhala. Zobrazuji posledni dostupna data.'
            : 'Pri nacitani dashboardu doslo k chybe.'
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }

    fetchDashboardData();
  }, [authLoading, hasServerSeed, token, user]);

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <Surface tone="muted" padding="lg">
          <div className="flex items-center justify-center gap-3 text-stone-700">
            <svg className="h-5 w-5 animate-spin text-[#6f1d2b]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm font-medium sm:text-base">Nacitam operativni prehled.</span>
          </div>
        </Surface>
      </div>
    );
  }

  const dashboardData = data;
  const allWines = [...(dashboardData?.allWines ?? [])].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
  const overview = dashboardData?.overview ?? null;
  const recentWines = overview?.recentWines?.length ? overview.recentWines : allWines.slice(0, 5);
  const totalWines = overview?.metrics.totalWines ?? dashboardData?.winery?._count?.wines ?? allWines.length;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = allWines.filter((wine) => new Date(wine.createdAt) >= thirtyDaysAgo).length;
  const missingBatchCount = allWines.filter((wine) => !wine.batch).length;
  const readyForQrCount = Math.max(totalWines - missingBatchCount, 0);
  const latestWine = allWines[0] || recentWines[0] || null;
  const wineryName =
    overview?.profile.displayName ||
    dashboardData?.winery?.displayName ||
    dashboardData?.winery?.name ||
    user?.name ||
    'Vase vinarstvi';
  const winerySlug = overview?.profile.slug || dashboardData?.winery?.slug || user?.slug || null;
  const operationalStatus =
    totalWines === 0 ? 'Priprava katalogu' : missingBatchCount > 0 ? 'Vyžaduje doplneni' : 'Pripraveno pro QR';
  const workspaceHref = latestWine ? `/dashboard/wines/${latestWine.id}` : '/dashboard/wines/new';
  const modules: WorkspaceModule[] = [
    {
      title: 'Catalog',
      description: 'Seznam vsech vin, filtrace a rychly vstup do detailu.',
      href: '/dashboard/wines',
      icon: <BottleIcon />,
      badge: <Badge tone="neutral">{totalWines} polozek</Badge>,
    },
    {
      title: 'Wine Workspace',
      description: latestWine
        ? `Pokracujte v detailu ${latestWine.name} a navazujicich upravach.`
        : 'Zalozte prvni vino a otevrite pracoviste pro detail, sarze a etiketu.',
      href: workspaceHref,
      icon: <TagIcon />,
      badge: latestWine ? <Badge tone="burgundy">Posledni zaznam</Badge> : <Badge tone="warning">Start</Badge>,
    },
    {
      title: 'QR & Export',
      description: 'Pripravte QR kody, podklady pro tisk a navazujici vystupy.',
      href: '/dashboard/qrcodes',
      icon: <QrIcon />,
      badge: <Badge tone="neutral">Delivery</Badge>,
    },
    {
      title: 'Analytics',
      description: 'Overte nacteni verejnych etiket a pohyb kolem vin v terenu.',
      href: '/dashboard/analytics',
      icon: <ChartIcon />,
    },
    {
      title: 'API Access',
      description: 'Spravujte integracni klice a kontrolujte pripravenost napojeni.',
      href: '/dashboard/api',
      icon: <KeyIcon />,
    },
    {
      title: 'Settings',
      description: 'Profil vinarstvi, kontaktni udaje a provozni nastaveni uctu.',
      href: '/dashboard/settings',
      icon: <SettingsIcon />,
      badge: winerySlug ? <Badge tone="neutral">/{winerySlug}</Badge> : undefined,
    },
  ];

  const queue: QueueStep[] = [
    {
      title: totalWines === 0 ? 'Zalozte prvni zaznam vina' : 'Otevrete aktivni Wine Workspace',
      description:
        totalWines === 0
          ? 'Bez prvniho vina neni z ceho generovat QR vystupy ani verejnou etiketu.'
          : latestWine
            ? `Navazte na posledni upravy u ${latestWine.name} a dotahnete detail do provozniho stavu.`
            : 'Pokračujte do detailu vina a zkontrolujte povinne udaje pred dalsim krokem.',
      href: totalWines === 0 ? '/dashboard/wines/new' : workspaceHref,
      badge: totalWines === 0 ? <Badge tone="warning">Start</Badge> : <Badge tone="burgundy">Workspace</Badge>,
    },
    {
      title: missingBatchCount > 0 ? 'Doplnte chybejici sarze' : 'Katalog je pripraveny na dalsi krok',
      description:
        missingBatchCount > 0
          ? `${missingBatchCount} zaznamu porad nema sarzi. To je nejrychlejsi provozni oprava pred exportem.`
          : 'Aktualni zaznamy maji vyplnenou sarzi a nehrozi blokace v navazujicim QR workflow.',
      href: '/dashboard/wines',
      badge:
        missingBatchCount > 0 ? (
          <Badge tone="warning">{missingBatchCount} bez sarze</Badge>
        ) : (
          <Badge tone="success">Hotovo</Badge>
        ),
    },
    {
      title: totalWines > 0 ? 'Pripravte QR nebo export' : 'Dokoncete katalog pred exportem',
      description:
        totalWines > 0
          ? 'Jakmile jsou data v poradku, pokracujte do QR & Export a pripravte podklady pro etikety.'
          : 'Export a verejna etiketa davaji smysl az po zalozeni prvniho vina a doplneni zakladnich udaju.',
      href: totalWines > 0 ? '/dashboard/qrcodes' : '/dashboard/wines/new',
      badge: <Badge tone="burgundy">Dalsi krok</Badge>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
      <div className="relative space-y-6 pb-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-56 rounded-[40px] bg-[radial-gradient(circle_at_top_right,_rgba(111,29,43,0.1),_transparent_50%),radial-gradient(circle_at_top_left,_rgba(194,165,139,0.12),_transparent_45%)]"
        />

        <PageHeader
          eyebrow="Dashboard Home"
          title="Operativni prehled"
          description={`Dnesni pracovni prehled pro ${wineryName}. Tady zkontrolujete katalog, doplnite sarze a navazete na QR nebo verejnou etiketu.`}
          meta={
            <>
              <Badge tone="burgundy">{wineryName}</Badge>
              <Badge tone="neutral">{operationalStatus}</Badge>
              {winerySlug ? <Badge tone="neutral">/{winerySlug}</Badge> : null}
              {isRefreshing ? <Badge tone="neutral">Synchronizuji</Badge> : null}
            </>
          }
          actions={
            <>
              <PrimaryButton href="/dashboard/wines/new">
                <PlusIcon />
                Pridat vino
              </PrimaryButton>
              <SecondaryButton href="/dashboard/wines">
                Otevrit katalog
                <ArrowIcon />
              </SecondaryButton>
            </>
          }
        />

        {error ? (
          <Surface tone="muted" padding="sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-stone-700">
                <div className="mt-0.5 text-amber-700">
                  <WarningIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{error}</p>
                  <p className="mt-1 text-sm text-stone-600">
                    Pokud potrebujete overit profil nebo membership stav, pokracujte do nastaveni a systemovych modulu.
                  </p>
                </div>
              </div>
              <SecondaryButton href="/dashboard/settings">Otevrit nastaveni</SecondaryButton>
            </div>
          </Surface>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Celkem vin"
                value={totalWines}
                detail="Aktivni katalog pro etikety, QR a verejne stranky."
                icon={<BottleIcon />}
                tone="accent"
              />
              <MetricCard
                label="Pridano za 30 dni"
                value={recentCount}
                detail="Rychly signal, jak rychle se katalog meni."
                icon={<ClockIcon />}
              />
              <MetricCard
                label="Pripraveno pro QR"
                value={readyForQrCount}
                detail={
                  readyForQrCount > 0
                    ? 'Zaznamy se sarzi, ktere muzou pokracovat do dalsiho kroku.'
                    : 'Nejdriv doplnte zakladni provozni data.'
                }
                icon={<QrIcon />}
                tone={readyForQrCount > 0 ? 'neutral' : 'warning'}
                badge={readyForQrCount > 0 ? 'Ready' : 'Pozor'}
              />
              <MetricCard
                label="Bez sarze"
                value={missingBatchCount}
                detail={
                  missingBatchCount > 0
                    ? 'Tyto zaznamy jeste potrebuji doplnit sarzi.'
                    : 'Vsechny aktualni zaznamy maji sarzi vyplnenou.'
                }
                icon={<TagIcon />}
                tone={missingBatchCount > 0 ? 'warning' : 'neutral'}
                badge={missingBatchCount > 0 ? 'Akce' : 'OK'}
              />
            </div>

            <Surface>
              <div className="flex flex-col gap-4 border-b border-stone-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                    Recent Wines
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-stone-900">Posledni zaznamy v katalogu</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Nejrychlejsi vstup do detailu vina, kontroly sarze a dalsi navazujici prace.
                  </p>
                </div>
                <SecondaryButton href="/dashboard/wines">
                  Cely katalog
                  <ArrowIcon />
                </SecondaryButton>
              </div>

              {recentWines.length > 0 ? (
                <div className="mt-3 divide-y divide-stone-200/80">
                  {recentWines.map((wine) => (
                    <Link
                      key={wine.id}
                      href={`/dashboard/wines/${wine.id}`}
                      className="flex flex-col gap-3 py-4 transition-colors duration-200 hover:bg-stone-50/70 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-stone-900">{wine.name}</h3>
                          {wine.vintage ? <Badge tone="success">Rocnik {wine.vintage}</Badge> : null}
                          {wine.batch ? (
                            <Badge tone="neutral">Sarze {wine.batch}</Badge>
                          ) : (
                            <Badge tone="warning">Chybi sarze</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-stone-500">Vytvoreno {formatShortDate(wine.createdAt)}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-[#6f1d2b]">
                        Otevrit detail
                        <ArrowIcon />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    icon={<BottleIcon />}
                    title="Katalog je zatim prazdny"
                    description="Zacnete prvnim vinem. Jakmile zalozite zaznam, dashboard se prepne z uvodniho stavu do operativniho workspace."
                    action={
                      <PrimaryButton href="/dashboard/wines/new">
                        <PlusIcon />
                        Pridat prvni vino
                      </PrimaryButton>
                    }
                  />
                </div>
              )}
            </Surface>

            <Surface tone="muted">
              <div className="flex flex-col gap-2 border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Operational Queue
                </p>
                <h2 className="text-xl font-semibold text-stone-900">Co je na rade</h2>
                <p className="text-sm text-stone-600">
                  Tri prakticke kroky, ktere drzi katalog pripraveny pro etikety, QR a dalsi distribuci dat.
                </p>
              </div>

              <div className="mt-4 divide-y divide-stone-200/80">
                {queue.map((step, index) => (
                  <Link
                    key={step.title}
                    href={step.href}
                    className="flex flex-col gap-4 py-4 transition-colors duration-200 hover:bg-white/60 sm:flex-row sm:items-start"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#6f1d2b] shadow-sm">
                      0{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-stone-900">{step.title}</h3>
                        {step.badge}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#6f1d2b]">
                      Otevrit
                      <ArrowIcon />
                    </div>
                  </Link>
                ))}
              </div>
            </Surface>
          </div>

          <div className="space-y-6">
            <Surface tone="accent">
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Workspace Modules
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Navazujici moduly</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Sekce, ktere navazuji na katalog a operativni praci bez stareho promo balastu.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {modules.map((module) => (
                  <Link
                    key={module.title}
                    href={module.href}
                    className="group flex items-start gap-4 rounded-[22px] border border-stone-200/80 bg-white/80 px-4 py-4 transition-colors duration-200 hover:border-[#7c2332]/20 hover:bg-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7c2332]/10 text-[#6f1d2b]">
                      {module.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-stone-900">{module.title}</p>
                        {module.badge}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{module.description}</p>
                    </div>
                    <div className="pt-1 text-stone-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#6f1d2b]">
                      <ArrowIcon />
                    </div>
                  </Link>
                ))}
              </div>
            </Surface>

            <Surface>
              <div className="border-b border-stone-200/80 pb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7c2332]">
                  Operational Watchlist
                </p>
                <h2 className="mt-2 text-xl font-semibold text-stone-900">Stav workspace</h2>
              </div>

              <dl className="mt-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-stone-500">Vinarstvi</dt>
                  <dd className="text-right text-sm font-medium text-stone-900">{wineryName}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-stone-500">Slug</dt>
                  <dd className="text-right text-sm font-medium text-stone-900">{winerySlug ? `/${winerySlug}` : 'Zatim bez slugu'}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-stone-500">Posledni zapis</dt>
                  <dd className="text-right text-sm font-medium text-stone-900">
                    {latestWine ? `${latestWine.name} (${formatShortDate(latestWine.createdAt)})` : 'Zatim bez zaznamu'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-stone-500">Pripraveno pro QR</dt>
                  <dd className="text-right text-sm font-medium text-stone-900">{readyForQrCount}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-sm text-stone-500">Vyžaduje doplneni</dt>
                  <dd className="text-right text-sm font-medium text-stone-900">{missingBatchCount}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <SecondaryButton href={workspaceHref}>Otevrit Wine Workspace</SecondaryButton>
                <SecondaryButton href="/dashboard/settings">Profil a nastaveni</SecondaryButton>
              </div>
            </Surface>

            <div className="rounded-[30px] border border-stone-200/80 bg-[#f6f1ea]/85 p-2 shadow-[0_18px_45px_rgba(58,41,36,0.06)]">
              <MembershipStatusWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
