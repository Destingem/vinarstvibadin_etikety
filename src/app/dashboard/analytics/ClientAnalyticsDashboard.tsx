'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChartBarIcon,
  ClockIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  GlobeAltIcon as GlobeIcon,
  LanguageIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { useRequireAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { Badge } from '@/components/ui/badge';
import { SecondaryButton } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { MetricCard } from '@/components/ui/metric-card';
import { PageHeader } from '@/components/ui/page-header';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/components/ui/cn';
import WorldMap from './components/WorldMap';

interface AnalyticsSummary {
  totalScans: number;
  totalUniqueVisitors: number;
  scansByDevice: {
    mobile: number;
    tablet: number;
    desktop: number;
    unknown: number;
  };
  operatingSystems?: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  scanTrend: {
    percentChange: number;
    isPositive: boolean;
  };
  topWines: Array<{
    wineId: string;
    wineName: string;
    scanCount: number;
    rank: number;
    wineBatch?: string;
    wineVintage?: string;
  }>;
  topRegions: Array<{
    countryCode: string;
    countryName: string;
    scanCount: number;
    percentage: number;
  }>;
  languages: Array<{
    languageCode: string;
    languageName: string;
    language?: string;
    scanCount: number;
    percentage: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    scanCount: number;
    percentage: number;
  }>;
  dailyScans: Array<{
    date: string;
    scanCount: number;
  }>;
}

type DateRange = '7days' | '30days' | '90days' | 'year';
type GeoView = 'map' | 'list';

const RANGE_OPTIONS: Array<{ value: DateRange; label: string }> = [
  { value: '7days', label: '7 dní' },
  { value: '30days', label: '30 dní' },
  { value: '90days', label: '90 dní' },
  { value: 'year', label: 'Rok' },
];

const RANGE_DAY_COUNTS: Record<DateRange, number> = {
  '7days': 7,
  '30days': 30,
  '90days': 90,
  year: 365,
};

export default function ClientAnalyticsDashboard() {
  const { user, isLoading } = useRequireAuth();
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [geoView, setGeoView] = useState<GeoView>('map');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      if (isLoading || !user) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await authFetch(`/api/analytics/dashboard?range=${dateRange}`, null, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const data = (await response.json()) as AnalyticsSummary;
        setAnalytics(data);
      } catch (fetchError) {
        console.error('Error fetching analytics:', fetchError);
        setError('Nepodařilo se načíst analytická data.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange, isLoading, user]);

  const derived = useMemo(() => {
    if (!analytics) {
      return null;
    }

    const totalScans = analytics.totalScans || 0;
    const periodDays = RANGE_DAY_COUNTS[dateRange];
    const averagePerDay = Math.round(totalScans / Math.max(periodDays, 1));
    const leadingRegion = analytics.topRegions[0] ?? null;
    const topWines = analytics.topWines.slice(0, 5);
    const topRegions = analytics.topRegions.slice(0, 8);
    const languages = analytics.languages.slice(0, 5);
    const systems = analytics.operatingSystems?.slice(0, 4) ?? [];
    const internationalShare = Math.round(
      analytics.topRegions
        .filter((region) => region.countryCode !== 'CZ')
        .reduce((sum, region) => sum + region.percentage, 0),
    );
    const mobileShare = getPercentage(analytics.scansByDevice.mobile, totalScans);
    const byHour = new Map(analytics.timeDistribution.map((item) => [item.hour, item.scanCount]));
    const hourlySeries = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      scanCount: byHour.get(hour) ?? 0,
    }));
    const peakHour =
      hourlySeries.length > 0
        ? hourlySeries.reduce((best, current) =>
            current.scanCount > best.scanCount ? current : best,
          )
        : null;
    const highestDay =
      analytics.dailyScans.length > 0
        ? analytics.dailyScans.reduce((best, current) =>
            current.scanCount > best.scanCount ? current : best,
          )
        : null;
    const deviceRows = [
      {
        label: 'Mobil',
        value: analytics.scansByDevice.mobile,
        icon: <DevicePhoneMobileIcon className="h-4 w-4" />,
      },
      {
        label: 'Desktop',
        value: analytics.scansByDevice.desktop,
        icon: <ComputerDesktopIcon className="h-4 w-4" />,
      },
      {
        label: 'Tablet',
        value: analytics.scansByDevice.tablet,
        icon: <DeviceTabletIcon className="h-4 w-4" />,
      },
    ];

    return {
      averagePerDay,
      deviceRows,
      highestDay,
      hourlySeries,
      internationalShare,
      languages,
      leadingRegion,
      mobileShare,
      peakHour,
      systems,
      topRegions,
      topWines,
    };
  }, [analytics, dateRange]);

  if (isLoading || (loading && user)) {
    return <LoadingDisplay />;
  }

  if (!user) {
    return <LoadingDisplay />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (!analytics || analytics.totalScans === 0 || !derived) {
    return <NoDataDisplay rangeLabel={getRangeLabel(dateRange)} />;
  }

  const trendBadge =
    analytics.scanTrend.percentChange === 0
      ? 'Bez změny'
      : `${analytics.scanTrend.isPositive ? '+' : '-'}${Math.abs(
          analytics.scanTrend.percentChange,
        )}%`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard / Analytics"
          title="Provozní analytika etiket"
          description="Přehled návštěv veřejných stránek vín podle vybraného období. Zobrazujeme jen dostupné provozní údaje: skeny, regiony, zařízení a jazyky."
          meta={
            <>
              <Badge tone="burgundy">{getRangeLabel(dateRange)}</Badge>
              <Badge>{formatNumber(derived.averagePerDay)} / den</Badge>
            </>
          }
          actions={
            <div className="inline-flex flex-wrap gap-2 rounded-full border border-stone-200 bg-white/90 p-1">
              {RANGE_OPTIONS.map((option) => (
                <RangeButton
                  key={option.value}
                  active={dateRange === option.value}
                  onClick={() => setDateRange(option.value)}
                >
                  {option.label}
                </RangeButton>
              ))}
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Celkem skenů"
            value={formatNumber(analytics.totalScans)}
            detail="Součet všech načtení QR kódů ve vybraném období."
            icon={<ChartBarIcon className="h-5 w-5" />}
            tone="accent"
            badge={trendBadge}
          />
          <MetricCard
            label="Unikátní návštěvníci"
            value={formatNumber(analytics.totalUniqueVisitors)}
            detail="Odhad odlišných návštěv veřejných etiket."
            icon={<UserGroupIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Průměr za den"
            value={formatNumber(derived.averagePerDay)}
            detail={
              derived.highestDay
                ? `Nejsilnější den: ${formatShortDate(derived.highestDay.date)}`
                : 'Denní průměr v rámci zvoleného období.'
            }
            icon={<ClockIcon className="h-5 w-5" />}
          />
          <MetricCard
            label="Podíl mimo ČR"
            value={`${derived.internationalShare}%`}
            detail={
              derived.leadingRegion
                ? `Nejsilnější země: ${derived.leadingRegion.countryName}`
                : 'Zatím bez regionálního rozlišení.'
            }
            icon={<GlobeIcon className="h-5 w-5" />}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
          <Panel
            title="Vývoj skenů"
            description="Denní objem načtení v čase. Křivka slouží jako čistý provozní přehled bez odhadů a doporučení."
          >
            <ScanTrendChart data={analytics.dailyScans} />
            <div className="grid gap-3 border-t border-stone-200/80 pt-4 text-sm text-stone-600 sm:grid-cols-3">
              <StatRow
                label="Nejvyšší den"
                value={
                  derived.highestDay
                    ? `${formatShortDate(derived.highestDay.date)} · ${formatNumber(
                        derived.highestDay.scanCount,
                      )}`
                    : 'Bez dat'
                }
              />
              <StatRow
                label="Trend"
                value={
                  analytics.scanTrend.percentChange === 0 ? (
                    'Bez změny oproti předchozímu období'
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {analytics.scanTrend.isPositive ? (
                        <ArrowUpIcon className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-amber-700" />
                      )}
                      {trendBadge} oproti předchozímu období
                    </span>
                  )
                }
              />
              <StatRow
                label="Špička dne"
                value={
                  derived.peakHour && derived.peakHour.scanCount > 0
                    ? `${padHour(derived.peakHour.hour)}:00`
                    : 'Bez hodinového rozlišení'
                }
              />
            </div>
          </Panel>

          <Panel
            title="Top vína"
            description="Veřejné etikety s nejvyšším počtem otevření v aktuálním období."
          >
            {derived.topWines.length > 0 ? (
              <div className="space-y-3">
                {derived.topWines.map((wine) => (
                  <Link
                    key={wine.wineId}
                    href={`/dashboard/wines/${wine.wineId}`}
                    className="flex items-start gap-4 rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3 transition hover:border-[#7c2332]/25 hover:bg-white"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#7c2332]/10 text-sm font-semibold text-[#6f1d2b]">
                      {wine.rank}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-stone-900">
                            {wine.wineName}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {wine.wineVintage ? <Badge>{wine.wineVintage}</Badge> : null}
                            {wine.wineBatch ? <Badge>Šarže {wine.wineBatch}</Badge> : null}
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#6f1d2b]">
                          {formatNumber(wine.scanCount)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <InlineEmptyState title="Zatím bez top položek" />
            )}
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <Panel
            title="Regiony"
            description="Země, odkud návštěvníci otevírají veřejné etikety. Přepnout lze mezi mapou a seznamem."
            actions={
              <div className="inline-flex gap-1 rounded-full border border-stone-200 bg-stone-50 p-1">
                <button
                  type="button"
                  onClick={() => setGeoView('map')}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    geoView === 'map'
                      ? 'bg-[#6f1d2b] text-white'
                      : 'text-stone-600 hover:text-stone-900',
                  )}
                >
                  Mapa
                </button>
                <button
                  type="button"
                  onClick={() => setGeoView('list')}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition',
                    geoView === 'list'
                      ? 'bg-[#6f1d2b] text-white'
                      : 'text-stone-600 hover:text-stone-900',
                  )}
                >
                  Seznam
                </button>
              </div>
            }
          >
            {derived.topRegions.length > 0 ? (
              <div className="space-y-5">
                {geoView === 'map' ? (
                  <WorldMap data={derived.topRegions} />
                ) : (
                  <CountryList regions={derived.topRegions} />
                )}

                <div className="grid gap-3 border-t border-stone-200/80 pt-4 sm:grid-cols-2">
                  <StatRow
                    label="Vedoucí země"
                    value={
                      derived.leadingRegion
                        ? `${derived.leadingRegion.countryName} · ${derived.leadingRegion.percentage}%`
                        : 'Bez dat'
                    }
                  />
                  <StatRow
                    label="Podíl mimo ČR"
                    value={`${derived.internationalShare}% všech skenů`}
                  />
                </div>
              </div>
            ) : (
              <InlineEmptyState title="Regionální data zatím nejsou k dispozici" />
            )}
          </Panel>

          <Panel
            title="Publikum a technika"
            description="Rozdělení návštěv podle zařízení, jazyka a prostředí klienta."
          >
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-stone-900">Zařízení</h3>
                  <Badge>{derived.mobileShare}% mobil</Badge>
                </div>
                <div className="mt-3 space-y-3">
                  {derived.deviceRows.map((device) => (
                    <DataRow
                      key={device.label}
                      icon={device.icon}
                      label={device.label}
                      value={formatNumber(device.value)}
                      meta={`${getPercentage(device.value, analytics.totalScans)}%`}
                    />
                  ))}
                </div>
              </div>

              <div className="border-t border-stone-200/80 pt-5">
                <h3 className="text-sm font-semibold text-stone-900">Jazyky</h3>
                {derived.languages.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {derived.languages.map((language) => (
                      <DataRow
                        key={language.languageCode}
                        icon={<LanguageIcon className="h-4 w-4" />}
                        label={getLanguageLabel(language)}
                        value={formatNumber(language.scanCount)}
                        meta={`${language.percentage}%`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-stone-500">Jazyková data zatím nejsou dostupná.</p>
                )}
              </div>

              <div className="border-t border-stone-200/80 pt-5">
                <h3 className="text-sm font-semibold text-stone-900">Operační systémy</h3>
                {derived.systems.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {derived.systems.map((system) => (
                      <DataRow
                        key={system.name}
                        icon={<ComputerDesktopIcon className="h-4 w-4" />}
                        label={system.name}
                        value={formatNumber(system.count)}
                        meta={`${system.percentage}%`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-stone-500">
                    Operační systémy backend pro toto období nevrátil.
                  </p>
                )}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <Panel
            title="Hodinová aktivita"
            description="Rozložení skenů během dne. Slouží pro orientaci v tom, kdy jsou etikety nejčastěji otevírány."
          >
            <HourlyActivityChart data={derived.hourlySeries} />
          </Panel>

          <Panel
            title="Práce s daty"
            description="Navazující plochy a provozní poznámky k customer analytics."
          >
            <div className="space-y-4 text-sm leading-6 text-stone-600">
              <p>
                Přehled je vázaný na vybrané období a zobrazuje pouze data, která backend skutečně
                vrátí pro vaše veřejné etikety.
              </p>
              <p>
                Pro návaznou práci otevřete katalog vín nebo API Access. Exporty a technické
                integrace řešte mimo tuto stránku.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <SecondaryButton href="/dashboard/wines">Otevřít katalog vín</SecondaryButton>
                <SecondaryButton href="/dashboard/api">API Access</SecondaryButton>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

interface PanelProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

function Panel({ title, description, actions, children, className }: PanelProps) {
  return (
    <Surface className={cn('h-full', className)}>
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-stone-900 sm:text-xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {children}
      </div>
    </Surface>
  );
}

interface RangeButtonProps {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}

function RangeButton({ active, children, onClick }: RangeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-medium transition',
        active
          ? 'bg-[#6f1d2b] text-white shadow-[0_12px_24px_rgba(111,29,43,0.16)]'
          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
      )}
    >
      {children}
    </button>
  );
}

interface DataRowProps {
  icon: ReactNode;
  label: string;
  value: string;
  meta: string;
}

function DataRow({ icon, label, value, meta }: DataRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-stone-600 shadow-sm">
          {icon}
        </span>
        <span className="truncate text-sm font-medium text-stone-800">{label}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-stone-900">{value}</p>
        <p className="text-xs text-stone-500">{meta}</p>
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: ReactNode;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="rounded-2xl bg-stone-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <div className="mt-2 text-sm font-medium text-stone-900">{value}</div>
    </div>
  );
}

function CountryList({
  regions,
}: {
  regions: AnalyticsSummary['topRegions'];
}) {
  const maxCount = Math.max(...regions.map((region) => region.scanCount), 1);

  return (
    <div className="space-y-3">
      {regions.map((region) => (
        <div
          key={region.countryCode}
          className="rounded-2xl border border-stone-200/80 bg-stone-50/70 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900">{region.countryName}</p>
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                {region.countryCode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-stone-900">
                {formatNumber(region.scanCount)}
              </p>
              <p className="text-xs text-stone-500">{region.percentage}%</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-[#6f1d2b]"
              style={{
                width: `${Math.max((region.scanCount / maxCount) * 100, 8)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScanTrendChart({
  data,
}: {
  data: AnalyticsSummary['dailyScans'];
}) {
  if (data.length === 0) {
    return <InlineEmptyState title="Vývoj skenů zatím není k dispozici" />;
  }

  const width = 720;
  const height = 260;
  const paddingX = 20;
  const paddingTop = 18;
  const paddingBottom = 28;
  const maxValue = Math.max(...data.map((item) => item.scanCount), 1);
  const chartHeight = height - paddingTop - paddingBottom;
  const chartWidth = width - paddingX * 2;
  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : paddingX + (chartWidth * index) / Math.max(data.length - 1, 1);
    const y = paddingTop + chartHeight - (item.scanCount / maxValue) * chartHeight;
    return { x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = [
    `${paddingX},${height - paddingBottom}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${width - paddingX},${height - paddingBottom}`,
  ].join(' ');
  const markers = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter(
    (index, position, list) => list.indexOf(index) === position,
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[24px] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(250,245,239,0.95),rgba(255,255,255,0.96))] p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full" role="img" aria-label="Vývoj skenů v čase">
          <defs>
            <linearGradient id="scan-trend-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(111,29,43,0.22)" />
              <stop offset="100%" stopColor="rgba(111,29,43,0)" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((ratio) => {
            const y = paddingTop + chartHeight * ratio;
            return (
              <line
                key={ratio}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="#e7ddd2"
                strokeDasharray="5 7"
              />
            );
          })}

          <polygon points={area} fill="url(#scan-trend-fill)" />
          <polyline
            points={line}
            fill="none"
            stroke="#6f1d2b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <circle key={`${data[index]?.date ?? index}-point`} cx={point.x} cy={point.y} r="4" fill="#6f1d2b">
              <title>
                {formatShortDate(data[index].date)}: {formatNumber(data[index].scanCount)}
              </title>
            </circle>
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
        {markers.map((index) => (
          <span key={`${data[index]?.date ?? index}-label`}>{formatShortDate(data[index].date)}</span>
        ))}
      </div>
    </div>
  );
}

function HourlyActivityChart({
  data,
}: {
  data: Array<{ hour: number; scanCount: number }>;
}) {
  const maxValue = Math.max(...data.map((item) => item.scanCount), 1);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[repeat(24,minmax(0,1fr))] gap-2">
          {data.map((item) => (
            <div
              key={item.hour}
              className="flex min-h-[180px] flex-col items-center justify-end gap-2"
            >
              <div className="flex h-[148px] w-full items-end rounded-full bg-stone-100 px-1.5 py-1.5">
                <div
                  className="w-full rounded-full bg-[linear-gradient(180deg,#c28b6b_0%,#6f1d2b_100%)]"
                  style={{
                    height: `${Math.max((item.scanCount / maxValue) * 100, item.scanCount > 0 ? 10 : 2)}%`,
                  }}
                  title={`${padHour(item.hour)}:00 — ${formatNumber(item.scanCount)} skenů`}
                />
              </div>
              <span className="text-[11px] font-medium text-stone-500">{padHour(item.hour)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-stone-200/80 pt-4 sm:grid-cols-3">
        <StatRow
          label="Ráno"
          value={formatNumber(sumHours(data, 6, 11))}
        />
        <StatRow
          label="Odpoledne"
          value={formatNumber(sumHours(data, 12, 17))}
        />
        <StatRow
          label="Večer"
          value={formatNumber(sumHours(data, 18, 23))}
        />
      </div>
    </div>
  );
}

function InlineEmptyState({ title }: { title: string }) {
  return (
    <EmptyState
      title={title}
      description="Jakmile backend vrátí data pro tuto část, objeví se zde konkrétní provozní přehled."
      icon={<ChartBarIcon className="h-6 w-6" />}
      className="border-stone-200 bg-stone-50/80"
    />
  );
}

function LoadingDisplay() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="animate-pulse space-y-6">
        <Surface padding="lg" className="h-44" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Surface key={`metric-skeleton-${index}`} padding="sm" className="h-40" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
          <Surface padding="lg" className="h-[420px]" />
          <Surface padding="lg" className="h-[420px]" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
          <Surface padding="lg" className="h-[460px]" />
          <Surface padding="lg" className="h-[460px]" />
        </div>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard / Analytics"
          title="Analytiku se nepodařilo načíst"
          description="Zkuste obnovit stránku nebo se vraťte později. Pokud problém přetrvá, zkontrolujte dostupnost backendu."
        />
        <Surface tone="muted">
          <EmptyState
            title="Načtení selhalo"
            description={message}
            icon={<ChartBarIcon className="h-6 w-6" />}
            action={<SecondaryButton onClick={() => window.location.reload()}>Obnovit</SecondaryButton>}
          />
        </Surface>
      </div>
    </div>
  );
}

function NoDataDisplay({ rangeLabel }: { rangeLabel: string }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Dashboard / Analytics"
          title="Zatím bez analytických dat"
          description="Jakmile začnou návštěvníci otevírat veřejné etikety, objeví se zde provozní přehled podle regionů, zařízení a času."
          meta={<Badge tone="burgundy">{rangeLabel}</Badge>}
        />
        <Surface tone="muted">
          <EmptyState
            title="Ve vybraném období nejsou zaznamenané skeny"
            description="Zkontrolujte veřejné odkazy u vín nebo se vraťte později po prvních reálných návštěvách."
            icon={<GlobeIcon className="h-6 w-6" />}
            action={<SecondaryButton href="/dashboard/wines">Otevřít katalog vín</SecondaryButton>}
          />
        </Surface>
      </div>
    </div>
  );
}

function getRangeLabel(range: DateRange) {
  switch (range) {
    case '7days':
      return 'Posledních 7 dní';
    case '30days':
      return 'Posledních 30 dní';
    case '90days':
      return 'Posledních 90 dní';
    default:
      return 'Posledních 12 měsíců';
  }
}

function getLanguageLabel(language: AnalyticsSummary['languages'][number]) {
  return language.languageName || language.language || language.languageCode.toUpperCase();
}

function formatNumber(value: number) {
  return value.toLocaleString('cs-CZ');
}

function getPercentage(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'short',
  });
}

function padHour(hour: number) {
  return hour.toString().padStart(2, '0');
}

function sumHours(data: Array<{ hour: number; scanCount: number }>, start: number, end: number) {
  return data.reduce((sum, item) => {
    if (item.hour >= start && item.hour <= end) {
      return sum + item.scanCount;
    }

    return sum;
  }, 0);
}
