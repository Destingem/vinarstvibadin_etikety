import { listWineSourcesByOwnerUserId } from '@/server/repositories/wines';
import { WineryWineSchema, type AppwriteWineRecord } from '@/server/schemas/wine';

type ListWineryWinesOptions = {
  limit?: number;
  offset?: number;
  search?: string;
};

function getOptionalString(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizeVintage(value: AppwriteWineRecord['vintage']) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
  }

  return undefined;
}

export function normalizeWineRecord(record: AppwriteWineRecord) {
  const createdAt =
    getOptionalString(record.createdAt) ??
    getOptionalString(record.$createdAt) ??
    new Date(0).toISOString();

  const updatedAt =
    getOptionalString(record.updatedAt) ??
    getOptionalString(record.$updatedAt) ??
    createdAt;

  return WineryWineSchema.parse({
    id: record.$id,
    ownerUserId: record.userId,
    name: record.name,
    vintage: normalizeVintage(record.vintage),
    batch: getOptionalString(record.batch),
    alcoholContent: normalizeNumericValue(record.alcoholContent ?? record.alcohol),
    energyValueKJ: normalizeNumericValue(record.energyValueKJ),
    energyValueKcal: normalizeNumericValue(record.energyValueKcal),
    fat: normalizeNumericValue(record.fat),
    saturatedFat: normalizeNumericValue(record.saturatedFat),
    carbs: normalizeNumericValue(record.carbs),
    sugars: normalizeNumericValue(record.sugars),
    protein: normalizeNumericValue(record.protein),
    salt: normalizeNumericValue(record.salt),
    ingredients: getOptionalString(record.ingredients),
    additionalInfo: getOptionalString(record.additionalInfo),
    allergens: getOptionalString(record.allergens),
    wineRegion: getOptionalString(record.wineRegion),
    wineSubregion: getOptionalString(record.wineSubregion),
    wineVillage: getOptionalString(record.wineVillage),
    wineTract: getOptionalString(record.wineTract),
    createdAt,
    updatedAt,
    wineryName: getOptionalString(record.wineryName),
    winerySlug: getOptionalString(record.winerySlug),
  });
}

function normalizeNumericValue(value: AppwriteWineRecord[keyof AppwriteWineRecord]) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  }

  return undefined;
}

export async function listWineryWines(
  ownerUserId: string,
  options: ListWineryWinesOptions = {}
) {
  const { documents, total } = await listWineSourcesByOwnerUserId(
    ownerUserId,
    options
  );

  return {
    wines: documents.map(normalizeWineRecord),
    total,
  };
}
