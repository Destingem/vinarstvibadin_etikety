import { getMembershipByUserId, updateMembership } from '@/lib/appwrite';
import {
  createWineSource,
  findExistingWineSourceByIdentity,
  listWineSourcesByOwnerUserId,
} from '@/server/repositories/wines';
import { type WineryProfile } from '@/server/schemas/winery-profile';
import { type AppwriteWineWriteData } from '@/server/schemas/wine';

type DemoWineSeed = {
  name: string;
  vintage: number;
  batch: string;
  alcoholContent: number;
  ingredients: string;
  allergens: string;
  wineRegion: string;
  wineVillage: string;
  additionalInfo: string;
  createdAt: string;
};

const DEMO_WINE_SEEDS: DemoWineSeed[] = [
  {
    name: 'Ryzlink rynsky',
    vintage: 2023,
    batch: 'RR-2301',
    alcoholContent: 12.5,
    ingredients: 'Hrozny, oxid siřičitý',
    allergens: 'Oxid siřičitý a siřičitany',
    wineRegion: 'Mikulovská',
    wineVillage: 'Pavlov',
    additionalInfo: 'Suché bílé víno pro ukázku veřejné etikety a QR workflow.',
    createdAt: '2025-05-30T09:00:00.000Z',
  },
  {
    name: 'Veltlinske zelene',
    vintage: 2024,
    batch: 'VZ-2402',
    alcoholContent: 11.5,
    ingredients: 'Hrozny, oxid siřičitý',
    allergens: 'Oxid siřičitý a siřičitany',
    wineRegion: 'Znojemská',
    wineVillage: 'Hnanice',
    additionalInfo: 'Svěží bílé víno se vzorovými nutričními údaji pro demo účet.',
    createdAt: '2025-06-05T09:00:00.000Z',
  },
  {
    name: 'Frankovka rose',
    vintage: 2024,
    batch: 'FR-2403',
    alcoholContent: 12,
    ingredients: 'Hrozny, oxid siřičitý',
    allergens: 'Oxid siřičitý a siřičitany',
    wineRegion: 'Velkopavlovická',
    wineVillage: 'Velké Pavlovice',
    additionalInfo: 'Růžové víno pro kontrolu šarže, QR kódu a veřejné stránky.',
    createdAt: '2025-06-12T09:00:00.000Z',
  },
  {
    name: 'Cuvee rezerva',
    vintage: 2022,
    batch: 'CR-2201',
    alcoholContent: 13.5,
    ingredients: 'Hrozny, oxid siřičitý',
    allergens: 'Oxid siřičitý a siřičitany',
    wineRegion: 'Slovácká',
    wineVillage: 'Bzenec',
    additionalInfo: 'Plnější červené víno jako ukázka pro katalog, analytics a export.',
    createdAt: '2025-06-20T09:00:00.000Z',
  },
];

function buildDemoWineData(
  ownerUserId: string,
  profile: WineryProfile,
  seed: DemoWineSeed,
): AppwriteWineWriteData {
  return {
    userId: ownerUserId,
    name: seed.name,
    vintage: seed.vintage,
    batch: seed.batch,
    alcoholContent: seed.alcoholContent,
    ingredients: seed.ingredients,
    additionalInfo: seed.additionalInfo,
    allergens: seed.allergens,
    wineRegion: seed.wineRegion,
    wineVillage: seed.wineVillage,
    wineryName: profile.displayName,
    winerySlug: profile.slug,
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  };
}

async function syncDemoMembershipCount(ownerUserId: string, nextCount: number) {
  const membership = await getMembershipByUserId(ownerUserId);

  if (!membership?.$id || membership.currentWineCount === nextCount) {
    return;
  }

  await updateMembership(membership.$id, {
    currentWineCount: nextCount,
  });
}

export async function ensureDemoCatalog(profile: WineryProfile) {
  if (!profile.isDemo) {
    return {
      seeded: false,
      total: 0,
    };
  }

  let seededCount = 0;

  for (const seed of DEMO_WINE_SEEDS) {
    const existingWine = await findExistingWineSourceByIdentity(profile.ownerUserId, {
      name: seed.name,
      vintage: seed.vintage,
      batch: seed.batch,
    });

    if (existingWine) {
      continue;
    }

    await createWineSource(buildDemoWineData(profile.ownerUserId, profile, seed));
    seededCount += 1;
  }

  const currentWineSources = await listWineSourcesByOwnerUserId(profile.ownerUserId, {
    limit: 1,
  });

  await syncDemoMembershipCount(profile.ownerUserId, currentWineSources.total);

  return {
    seeded: seededCount > 0,
    total: currentWineSources.total,
  };
}
