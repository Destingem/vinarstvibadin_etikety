import {
  createWineSource,
  deleteWineSource,
  findExistingWineSourceByIdentity,
  getOwnedWineSourceById,
  listWineSourcesByOwnerUserId,
  updateWineSource,
} from '@/server/repositories/wines';
import {
  type ApiWineListQuery,
  CreateApiWineInputSchema,
  type CreateApiWineInput,
  type UpdateApiWineInput,
} from '@/server/schemas/api-wines';
import {
  type DuplicateWineInput,
  type InternalWineUpdateInput,
} from '@/server/schemas/internal-wines';
import { type WineryProfile } from '@/server/schemas/winery-profile';
import { type AppwriteWineWriteData } from '@/server/schemas/wine';
import { getWineryProfile } from '@/server/services/winery-profiles';
import { listWineryWines, normalizeWineRecord } from '@/server/services/wines';

function nullableString(value: string | undefined) {
  return value ?? null;
}

function nullableNumber(value: number | undefined) {
  return value ?? null;
}

function getStringFromUnknown(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function stripUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function serializeWineryProfileForApi(profile: WineryProfile) {
  return {
    ownerUserId: profile.ownerUserId,
    displayName: profile.displayName,
    slug: profile.slug,
    locale: profile.locale,
    isAdmin: profile.isAdmin,
    isDemo: profile.isDemo,
  };
}

function serializeWineForApi(
  wine: Awaited<ReturnType<typeof listWineryWines>>['wines'][number],
  wineryProfile: WineryProfile
) {
  const wineryName = wine.wineryName ?? wineryProfile.displayName;
  const winerySlug = wine.winerySlug ?? wineryProfile.slug;

  return {
    id: wine.id,
    $id: wine.id,
    ownerUserId: wine.ownerUserId,
    userId: wine.ownerUserId,
    name: wine.name,
    vintage: nullableNumber(wine.vintage),
    batch: nullableString(wine.batch),
    alcoholContent: nullableNumber(wine.alcoholContent),
    energyValueKJ: nullableNumber(wine.energyValueKJ),
    energyValueKcal: nullableNumber(wine.energyValueKcal),
    fat: nullableNumber(wine.fat),
    saturatedFat: nullableNumber(wine.saturatedFat),
    carbs: nullableNumber(wine.carbs),
    sugars: nullableNumber(wine.sugars),
    protein: nullableNumber(wine.protein),
    salt: nullableNumber(wine.salt),
    ingredients: nullableString(wine.ingredients),
    additionalInfo: nullableString(wine.additionalInfo),
    allergens: nullableString(wine.allergens),
    wineRegion: nullableString(wine.wineRegion),
    wineSubregion: nullableString(wine.wineSubregion),
    wineVillage: nullableString(wine.wineVillage),
    wineTract: nullableString(wine.wineTract),
    createdAt: wine.createdAt,
    updatedAt: wine.updatedAt,
    wineryName,
    winerySlug,
    wineryProfile: serializeWineryProfileForApi(wineryProfile),
  };
}

function normalizeWriteInput(
  input: CreateApiWineInput | UpdateApiWineInput | InternalWineUpdateInput,
  wineryProfile: WineryProfile,
  ownerUserId: string,
  mode: 'create' | 'update'
): AppwriteWineWriteData {
  const now = new Date().toISOString();
  const normalizedAlcohol =
    input.alcoholContent ?? input.alcohol ?? undefined;

  const normalizedData = stripUndefined({
    name: input.name?.trim(),
    vintage: input.vintage ?? undefined,
    batch: input.batch ?? null,
    alcoholContent: normalizedAlcohol ?? null,
    energyValueKJ: input.energyValueKJ ?? null,
    energyValueKcal: input.energyValueKcal ?? null,
    fat: input.fat ?? null,
    saturatedFat: input.saturatedFat ?? null,
    carbs: input.carbs ?? null,
    sugars: input.sugars ?? null,
    protein: input.protein ?? null,
    salt: input.salt ?? null,
    ingredients: input.ingredients ?? null,
    additionalInfo: input.additionalInfo ?? null,
    allergens: input.allergens ?? null,
    wineRegion: input.wineRegion ?? null,
    wineSubregion: input.wineSubregion ?? null,
    wineVillage: input.wineVillage ?? null,
    wineTract: input.wineTract ?? null,
    wineryName: wineryProfile.displayName,
    winerySlug: wineryProfile.slug,
    updatedAt: now,
    ...(mode === 'create'
      ? {
          userId: ownerUserId,
          createdAt: now,
        }
      : {}),
  });

  return normalizedData;
}

function normalizeImportedWineInput(rawWine: unknown) {
  if (!rawWine || typeof rawWine !== 'object') {
    return null;
  }

  const candidate = rawWine as Record<string, unknown>;
  const parsedInput = CreateApiWineInputSchema.safeParse({
    name: candidate.name,
    vintage: candidate.vintage,
    batch: candidate.batch,
    alcohol: candidate.alcohol,
    alcoholContent: candidate.alcoholContent,
    energyValueKJ: candidate.energyValueKJ,
    energyValueKcal: candidate.energyValueKcal,
    fat: candidate.fat,
    saturatedFat: candidate.saturatedFat,
    carbs: candidate.carbs,
    sugars: candidate.sugars,
    protein: candidate.protein,
    salt: candidate.salt,
    ingredients: candidate.ingredients,
    additionalInfo: candidate.additionalInfo,
    allergens: candidate.allergens,
    wineRegion: candidate.wineRegion,
    wineSubregion: candidate.wineSubregion,
    wineVillage: candidate.wineVillage,
    wineTract: candidate.wineTract,
  });

  if (!parsedInput.success) {
    return null;
  }

  return parsedInput.data;
}

export async function listApiWines(
  ownerUserId: string,
  query: ApiWineListQuery
) {
  const [wineryProfile, wineResult] = await Promise.all([
    getWineryProfile(ownerUserId),
    listWineryWines(ownerUserId, {
      limit: query.limit,
      offset: (query.page - 1) * query.limit,
      search: query.search,
    }),
  ]);

  if (!wineryProfile) {
    return null;
  }

  return {
    wines: wineResult.wines.map((wine) => serializeWineForApi(wine, wineryProfile)),
    pagination: {
      page: query.page,
      limit: query.limit,
      totalCount: wineResult.total,
      totalPages: Math.ceil(wineResult.total / query.limit),
    },
  };
}

export async function getOwnedApiWine(ownerUserId: string, wineId: string) {
  const ownershipResult = await getOwnedWineSourceById(ownerUserId, wineId);

  if (ownershipResult.status !== 'ok') {
    return ownershipResult;
  }

  const wineSource = ownershipResult.wine;

  if (!wineSource) {
    return { status: 'not_found' as const };
  }

  const wineryProfile = await getWineryProfile(ownerUserId);

  if (!wineryProfile) {
    return { status: 'not_found' as const };
  }

  return {
    status: 'ok' as const,
    wine: serializeWineForApi(normalizeWineRecord(wineSource), wineryProfile),
  };
}

export async function createApiWine(
  ownerUserId: string,
  input: CreateApiWineInput
) {
  const wineryProfile = await getWineryProfile(ownerUserId);

  if (!wineryProfile) {
    return null;
  }

  const createdWine = await createWineSource(
    normalizeWriteInput(input, wineryProfile, ownerUserId, 'create')
  );

  return serializeWineForApi(normalizeWineRecord(createdWine), wineryProfile);
}

export async function updateOwnedApiWine(
  ownerUserId: string,
  wineId: string,
  input: UpdateApiWineInput | InternalWineUpdateInput
) {
  const ownershipResult = await getOwnedWineSourceById(ownerUserId, wineId);

  if (ownershipResult.status !== 'ok') {
    return ownershipResult;
  }

  const wineryProfile = await getWineryProfile(ownerUserId);

  if (!wineryProfile) {
    return { status: 'not_found' as const };
  }

  await updateWineSource(
    wineId,
    normalizeWriteInput(input, wineryProfile, ownerUserId, 'update')
  );

  const updatedWineResult = await getOwnedApiWine(ownerUserId, wineId);
  return updatedWineResult;
}

export async function deleteOwnedApiWine(ownerUserId: string, wineId: string) {
  const ownershipResult = await getOwnedWineSourceById(ownerUserId, wineId);

  if (ownershipResult.status !== 'ok') {
    return ownershipResult;
  }

  await deleteWineSource(wineId);

  return {
    status: 'ok' as const,
  };
}

export async function duplicateOwnedWine(
  ownerUserId: string,
  input: DuplicateWineInput
) {
  const ownershipResult = await getOwnedWineSourceById(ownerUserId, input.wineId);

  if (ownershipResult.status !== 'ok') {
    return ownershipResult;
  }

  const wineryProfile = await getWineryProfile(ownerUserId);

  if (!wineryProfile) {
    return { status: 'not_found' as const };
  }

  const wineSource = ownershipResult.wine;

  if (!wineSource) {
    return { status: 'not_found' as const };
  }

  const sourceWine = normalizeWineRecord(wineSource);
  const duplicatedWine = await createWineSource(
    normalizeWriteInput(
      {
        name: sourceWine.name,
        vintage: input.newVintage ?? sourceWine.vintage,
        batch:
          input.newBatch ??
          (sourceWine.batch ? `${sourceWine.batch} (kopie)` : '(kopie)'),
        alcoholContent: sourceWine.alcoholContent,
        energyValueKJ: sourceWine.energyValueKJ,
        energyValueKcal: sourceWine.energyValueKcal,
        fat: sourceWine.fat,
        saturatedFat: sourceWine.saturatedFat,
        carbs: sourceWine.carbs,
        sugars: sourceWine.sugars,
        protein: sourceWine.protein,
        salt: sourceWine.salt,
        ingredients: sourceWine.ingredients,
        additionalInfo: sourceWine.additionalInfo,
        allergens: sourceWine.allergens,
        wineRegion: sourceWine.wineRegion,
        wineSubregion: sourceWine.wineSubregion,
        wineVillage: sourceWine.wineVillage,
        wineTract: sourceWine.wineTract,
      },
      wineryProfile,
      ownerUserId,
      'create'
    )
  );

  return {
    status: 'ok' as const,
    wine: serializeWineForApi(normalizeWineRecord(duplicatedWine), wineryProfile),
  };
}

export async function exportOwnedWines(ownerUserId: string) {
  const [wineryProfile, wineResult] = await Promise.all([
    getWineryProfile(ownerUserId),
    listWineSourcesByOwnerUserId(ownerUserId, {
      limit: 5000,
      offset: 0,
      search: '',
    }),
  ]);

  if (!wineryProfile) {
    return null;
  }

  const exportDate = new Date().toISOString();

  return {
    exportDate,
    totalWines: wineResult.documents.length,
    payload: {
      wines: wineResult.documents,
      exportDate,
      version: '1.0',
      metadata: {
        totalWines: wineResult.documents.length,
        ownerUserId,
        userId: ownerUserId,
        wineryProfile: serializeWineryProfileForApi(wineryProfile),
      },
    },
  };
}

export async function importOwnedWines(ownerUserId: string, wines: unknown[]) {
  const wineryProfile = await getWineryProfile(ownerUserId);

  if (!wineryProfile) {
    return null;
  }

  const importResults = {
    total: wines.length,
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const rawWine of wines) {
    try {
      const parsedInput = normalizeImportedWineInput(rawWine);

      if (!parsedInput) {
        importResults.errors.push('Chyba při importu vína: neplatný formát dat');
        continue;
      }

      const existingWine = await findExistingWineSourceByIdentity(ownerUserId, {
        name: parsedInput.name,
        vintage: parsedInput.vintage,
        batch: parsedInput.batch,
      });

      if (existingWine) {
        importResults.skipped++;
        continue;
      }

      await createWineSource(
        normalizeWriteInput(parsedInput, wineryProfile, ownerUserId, 'create')
      );

      importResults.imported++;
    } catch (error) {
      console.error('Error importing wine in service layer:', error);

      const rawWineRecord =
        rawWine && typeof rawWine === 'object'
          ? (rawWine as Record<string, unknown>)
          : null;

      const wineName =
        getStringFromUnknown(rawWineRecord?.name) ?? 'bez názvu';

      importResults.errors.push(
        `Chyba při importu vína ${wineName}: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
      );
    }
  }

  return importResults;
}
