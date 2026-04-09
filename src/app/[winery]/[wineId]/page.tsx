import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getWineById as getLegacyWineById } from '@/lib/appwrite';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { getWineryProfileBySlug } from '@/server/services/winery-profiles';
import AnalyticsTracker from './analytics-integration';

type RouteParams = Promise<{ winery: string; wineId: string }>;

type RawWineDocument = Record<string, unknown> & {
  $id?: string;
};

type WineryInfo = {
  $id: string;
  name: string;
  slug: string;
};

type NutritionInfo = {
  energyValueKJ?: number;
  energyValueKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  protein?: number;
  salt?: number;
};

type OriginInfo = {
  region?: string;
  subregion?: string;
  village?: string;
  tract?: string;
};

type DigitalLabelWine = {
  $id: string;
  name: string;
  vintage?: number;
  batch?: string;
  alcoholContent?: number;
  ingredients?: string;
  allergens?: string;
  additionalInfo?: string;
  winery: WineryInfo;
  nutrition: NutritionInfo;
  origin: OriginInfo;
};

const numberFormatter = new Intl.NumberFormat('cs-CZ', {
  maximumFractionDigits: 2,
});

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (!normalized) {
      return undefined;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function pickString(document: RawWineDocument, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(document[key]);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function pickNumber(document: RawWineDocument, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = asNumber(document[key]);
    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

function normalizeSlug(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const slug = value.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
  return slug || undefined;
}

function prettifyWineryName(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const cleanValue = value.trim();
  if (!cleanValue) {
    return undefined;
  }

  return cleanValue
    .split(/[.-]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatValue(value?: number, suffix?: string): string {
  if (value === undefined) {
    return 'Neuvedeno';
  }

  return suffix ? `${numberFormatter.format(value)} ${suffix}` : numberFormatter.format(value);
}

function formatAlcohol(value?: number): string {
  return value === undefined ? 'Neuvedeno' : `${numberFormatter.format(value)} % obj.`;
}

function buildCanonicalPath(wine: DigitalLabelWine): string {
  return `/${encodeURIComponent(wine.winery.slug)}/${encodeURIComponent(wine.$id)}`;
}

function hasNutritionData(nutrition: NutritionInfo): boolean {
  return Object.values(nutrition).some((value) => value !== undefined);
}

function hasOriginData(origin: OriginInfo): boolean {
  return Object.values(origin).some(Boolean);
}

function resolveAllergenText(wine: DigitalLabelWine): string | undefined {
  if (wine.allergens) {
    return wine.allergens;
  }

  if (wine.ingredients && wine.ingredients.toLowerCase().includes('siřič')) {
    return 'Obsahuje siřičitany';
  }

  return undefined;
}

async function fetchRawWineDocument(wineId: string): Promise<RawWineDocument | null> {
  try {
    const wine = await adminDatabases.getDocument(DB_ID, WINES_COLLECTION_ID, wineId);
    return wine as RawWineDocument;
  } catch (error) {
    console.error('[PublicLabel] Admin fetch failed:', error);
  }

  try {
    const wine = await getLegacyWineById(wineId);
    return (wine as RawWineDocument | null) ?? null;
  } catch (error) {
    console.error('[PublicLabel] Legacy fetch failed:', error);
    return null;
  }
}

async function getWineData(requestedWinerySlug: string, wineId: string): Promise<DigitalLabelWine | null> {
  const document = await fetchRawWineDocument(wineId);

  if (!document) {
    return null;
  }

  const canonicalSlugFromWine = normalizeSlug(pickString(document, ['winerySlug']));
  const requestedSlug = normalizeSlug(requestedWinerySlug);
  const wineryProfile =
    (canonicalSlugFromWine &&
      (await getWineryProfileBySlug(canonicalSlugFromWine).catch(() => null))) ||
    (requestedSlug && requestedSlug !== canonicalSlugFromWine
      ? await getWineryProfileBySlug(requestedSlug).catch(() => null)
      : null);

  const canonicalSlug =
    normalizeSlug(wineryProfile?.slug) ||
    canonicalSlugFromWine ||
    requestedSlug ||
    'vinarstvi';

  const wineryOwnerId =
    wineryProfile?.ownerUserId ||
    pickString(document, ['userId', 'wineryId', '$id']) ||
    wineId;
  const wineryName =
    wineryProfile?.displayName ||
    pickString(document, ['wineryName']) ||
    prettifyWineryName(canonicalSlug) ||
    'Vinařství';

  return {
    $id: pickString(document, ['$id']) || wineId,
    name: pickString(document, ['name']) || `Víno ${wineId}`,
    vintage: pickNumber(document, ['vintage']),
    batch: pickString(document, ['batch']),
    alcoholContent: pickNumber(document, ['alcoholContent']),
    ingredients: pickString(document, ['ingredients']),
    allergens: pickString(document, ['allergens']),
    additionalInfo: pickString(document, ['additionalInfo']),
    winery: {
      $id: wineryOwnerId,
      name: wineryName,
      slug: canonicalSlug,
    },
    nutrition: {
      energyValueKJ: pickNumber(document, ['energyValueKJ']),
      energyValueKcal: pickNumber(document, ['energyValueKcal']),
      fat: pickNumber(document, ['fat']),
      saturatedFat: pickNumber(document, ['saturatedFat']),
      carbs: pickNumber(document, ['carbs']),
      sugars: pickNumber(document, ['sugars']),
      protein: pickNumber(document, ['protein']),
      salt: pickNumber(document, ['salt']),
    },
    origin: {
      region: pickString(document, ['wineRegion', 'wineRegio']),
      subregion: pickString(document, ['wineSubregion']),
      village: pickString(document, ['wineVillage']),
      tract: pickString(document, ['wineTract']),
    },
  };
}

export async function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Promise<Metadata> {
  const { winery, wineId } = await params;
  const wine = await getWineData(winery, wineId);

  if (!wine) {
    return {
      title: 'Digitální etiketa nenalezena',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonicalPath = buildCanonicalPath(wine);
  const description = `Digitální etiketa vína ${wine.name} od vinařství ${wine.winery.name}.`;

  return {
    title: `${wine.name} | ${wine.winery.name}`,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${wine.name} | ${wine.winery.name}`,
      description,
      url: canonicalPath,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title: `${wine.name} | ${wine.winery.name}`,
      description,
    },
  };
}

export default async function WinePage({
  params,
}: {
  params: RouteParams;
}) {
  const { winery, wineId } = await params;
  const wine = await getWineData(winery, wineId);

  if (!wine) {
    notFound();
  }

  if (wine.winery.slug !== winery) {
    permanentRedirect(buildCanonicalPath(wine));
  }

  const allergens = resolveAllergenText(wine);
  const nutritionAvailable = hasNutritionData(wine.nutrition);
  const originAvailable = hasOriginData(wine.origin);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf6f1_0%,#f6efe7_48%,#fbf8f4_100%)] text-stone-900">
      <AnalyticsTracker wineId={wine.$id} />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-14">
        <header className="mb-8">
          <div className="overflow-hidden rounded-[2rem] border border-[rgba(110,54,36,0.12)] bg-white/80 shadow-[0_28px_80px_rgba(56,30,18,0.10)] backdrop-blur-xl">
            <div className="bg-[linear-gradient(135deg,rgba(112,24,42,0.10),rgba(255,255,255,0))] px-6 py-6 sm:px-8 lg:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[rgb(112,24,42)]">
                Digitalni etiketa
              </p>
              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
                <div>
                  <h1 className="font-serif text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
                    {wine.name}
                  </h1>
                  <p className="mt-3 text-lg text-stone-700 sm:text-xl">{wine.winery.name}</p>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                    Veřejná stránka s povinnými informacemi k vínu podle nařízení EU 2021/2117.
                    Produktové nebo prodejní sdělení je záměrně až níže.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {wine.vintage !== undefined && <Badge>Rocnik {wine.vintage}</Badge>}
                    {wine.batch && <Badge>Sarze {wine.batch}</Badge>}
                    {wine.origin.region && <Badge>{wine.origin.region}</Badge>}
                  </div>
                </div>

                <aside className="rounded-[1.75rem] border border-[rgba(112,24,42,0.14)] bg-[rgba(253,248,244,0.92)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(112,24,42)]">
                    Rychly prehled
                  </p>
                  <dl className="mt-5 space-y-4">
                    <SummaryRow label="Obsah alkoholu" value={formatAlcohol(wine.alcoholContent)} />
                    <SummaryRow label="Alergeny" value={allergens || 'Neuvedeno'} />
                    <SummaryRow label="Vyrobce / plnic" value={wine.winery.name} />
                    <SummaryRow
                      label="Puvod"
                      value={wine.origin.region || wine.origin.subregion || 'Neuvedeno'}
                    />
                  </dl>
                </aside>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
          <div className="space-y-6">
            <SectionCard
              eyebrow="Povinne udaje"
              title="Zakladni informace k vinu"
              description="Tyto informace maji na verejne strance prednost pred marketingovym obsahem."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem label="Vyrobce / plnic" value={wine.winery.name} />
                <DetailItem label="Obsah alkoholu" value={formatAlcohol(wine.alcoholContent)} />
                <DetailItem label="Slozeni" value={wine.ingredients || 'Slozeni nebylo doplneno.'} />
                <DetailItem label="Alergeny" value={allergens || 'Alergeny nebyly doplneny.'} />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Na 100 ml"
              title="Vyživove udaje"
              description="Hodnoty se zobrazuji jen podle podkladu vlozenych vinařstvim."
            >
              {nutritionAvailable ? (
                <div className="overflow-hidden rounded-[1.5rem] border border-stone-200/70 bg-stone-50/70">
                  <NutritionRow
                    label="Energeticka hodnota"
                    primary={
                      wine.nutrition.energyValueKJ !== undefined
                        ? `${numberFormatter.format(wine.nutrition.energyValueKJ)} kJ`
                        : undefined
                    }
                    secondary={
                      wine.nutrition.energyValueKcal !== undefined
                        ? `${numberFormatter.format(wine.nutrition.energyValueKcal)} kcal`
                        : undefined
                    }
                  />
                  <NutritionRow label="Tuky" primary={formatValue(wine.nutrition.fat, 'g')} />
                  <NutritionRow
                    label="z toho nasycene mastne kyseliny"
                    primary={formatValue(wine.nutrition.saturatedFat, 'g')}
                    muted
                  />
                  <NutritionRow label="Sacharidy" primary={formatValue(wine.nutrition.carbs, 'g')} />
                  <NutritionRow
                    label="z toho cukry"
                    primary={formatValue(wine.nutrition.sugars, 'g')}
                    muted
                  />
                  <NutritionRow label="Bilkoviny" primary={formatValue(wine.nutrition.protein, 'g')} />
                  <NutritionRow label="Sul" primary={formatValue(wine.nutrition.salt, 'g')} last />
                </div>
              ) : (
                <EmptyState>
                  Vyživove udaje u tohoto vina zatim nebyly doplneny.
                </EmptyState>
              )}
            </SectionCard>

            {originAvailable && (
              <SectionCard
                eyebrow="Puvod hroznu"
                title="Puvod"
                description="Pokud bylo doplneno, zobrazuje se oblast, podoblast, obec a trat."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailItem label="Vinarska oblast" value={wine.origin.region || 'Neuvedeno'} />
                  <DetailItem
                    label="Vinarska podoblast"
                    value={wine.origin.subregion || 'Neuvedeno'}
                  />
                  <DetailItem label="Obec" value={wine.origin.village || 'Neuvedeno'} />
                  <DetailItem label="Trat" value={wine.origin.tract || 'Neuvedeno'} />
                </div>
              </SectionCard>
            )}

            {wine.additionalInfo && (
              <SectionCard
                eyebrow="Doplnujici text"
                title="Dalsi informace"
                description="Sekce slouzi pro doplneni dalsich verejnych informaci k vinu."
              >
                <p className="whitespace-pre-line text-base leading-7 text-stone-700">
                  {wine.additionalInfo}
                </p>
              </SectionCard>
            )}
          </div>

          <aside className="space-y-6">
            <SectionCard
              eyebrow="Identifikace"
              title="Udaje k lahvi"
              description="Strucny prehled pro orientaci pri kontrole nebo dotazu zakaznika."
              compact
            >
              <dl className="space-y-3">
                <MetaRow label="Nazev vina" value={wine.name} />
                <MetaRow label="Rocnik" value={wine.vintage !== undefined ? String(wine.vintage) : 'Neuvedeno'} />
                <MetaRow label="Sarze" value={wine.batch || 'Neuvedeno'} />
                <MetaRow label="Slug vinařstvi" value={wine.winery.slug} />
              </dl>
            </SectionCard>

            <SectionCard
              eyebrow="Pravni kontext"
              title="Poznamka k digitalni etikete"
              description="Tato verze stranky uprednostnuje regulatorni a identifikacni informace."
              compact
            >
              <p className="text-sm leading-6 text-stone-600">
                Pokud nektery udaj chybi, stranka ho nedomysli ani nenahrazuje fikci. Zobrazuje
                pouze to, co je k danemu vinu dostupne v systemu.
              </p>
            </SectionCard>
          </aside>
        </div>

        <section className="mt-6">
          <div className="overflow-hidden rounded-[2rem] border border-[rgba(112,24,42,0.14)] bg-[linear-gradient(135deg,rgba(112,24,42,0.08),rgba(255,255,255,0.92))] p-6 shadow-[0_24px_60px_rgba(56,30,18,0.08)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(112,24,42)]">
              Dostupnost u vinarstvi
            </p>
            <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]">
              <div>
                <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
                  Mate zajem o toto vino?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-700 sm:text-base">
                  Pro aktualni dostupnost, cenu nebo odber kontaktujte primo vinařstvi{' '}
                  <span className="font-semibold text-stone-900">{wine.winery.name}</span>.
                  Pri dotazu pomuze uvest nazev vina
                  {wine.batch ? ` a sarzi ${wine.batch}` : ''}.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-5">
                <dl className="space-y-3">
                  <MetaRow label="Vino" value={wine.name} />
                  {wine.batch && <MetaRow label="Sarze" value={wine.batch} />}
                  {wine.vintage !== undefined && (
                    <MetaRow label="Rocnik" value={String(wine.vintage)} />
                  )}
                </dl>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-6 text-center text-sm text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} {wine.winery.name}. Digitalni etiketa podle EU
            2021/2117.
          </p>
        </footer>
      </div>
    </main>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[rgba(110,54,36,0.12)] bg-white/82 shadow-[0_28px_80px_rgba(56,30,18,0.08)] backdrop-blur-xl">
      <div className={compact ? 'px-5 py-5 sm:px-6' : 'px-6 py-6 sm:px-8 sm:py-8'}>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(112,24,42)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-serif text-2xl text-stone-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-[rgba(112,24,42,0.14)] bg-[rgba(112,24,42,0.06)] px-3 py-1 text-sm font-medium text-[rgb(112,24,42)]">
      {children}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-stone-200/70 pb-4 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="mt-1 text-base font-medium text-stone-900">{value}</dd>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-stone-200/70 bg-stone-50/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-sm leading-7 text-stone-800 sm:text-base">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-stone-200/70 pb-3 last:border-b-0 last:pb-0">
      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</dt>
      <dd className="text-sm leading-6 text-stone-800">{value}</dd>
    </div>
  );
}

function NutritionRow({
  label,
  primary,
  secondary,
  muted = false,
  last = false,
}: {
  label: string;
  primary?: string;
  secondary?: string;
  muted?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center ${
        last ? '' : 'border-b border-stone-200/70'
      }`}
    >
      <dt className={muted ? 'text-sm text-stone-500' : 'text-sm font-medium text-stone-800'}>{label}</dt>
      <dd className="text-sm font-medium text-stone-900 sm:text-right">
        {primary || 'Neuvedeno'}
        {secondary ? <span className="text-stone-500"> / {secondary}</span> : null}
      </dd>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-stone-50/50 px-5 py-6 text-sm leading-6 text-stone-600">
      {children}
    </div>
  );
}
