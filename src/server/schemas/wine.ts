import { z } from 'zod';

const numberishRecordField = z.union([z.number(), z.string()]).nullable().optional();

export const AppwriteWineRecordSchema = z
  .object({
    $id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    vintage: numberishRecordField,
    batch: z.string().nullable().optional(),
    alcohol: numberishRecordField,
    alcoholContent: numberishRecordField,
    energyValueKJ: numberishRecordField,
    energyValueKcal: numberishRecordField,
    fat: numberishRecordField,
    saturatedFat: numberishRecordField,
    carbs: numberishRecordField,
    sugars: numberishRecordField,
    protein: numberishRecordField,
    salt: numberishRecordField,
    ingredients: z.string().nullable().optional(),
    additionalInfo: z.string().nullable().optional(),
    allergens: z.string().nullable().optional(),
    wineRegion: z.string().nullable().optional(),
    wineSubregion: z.string().nullable().optional(),
    wineVillage: z.string().nullable().optional(),
    wineTract: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    $createdAt: z.string().optional(),
    $updatedAt: z.string().optional(),
    wineryName: z.string().nullable().optional(),
    winerySlug: z.string().nullable().optional(),
  })
  .catchall(z.unknown());

export const WineryWineSchema = z.object({
  id: z.string().min(1),
  ownerUserId: z.string().min(1),
  name: z.string().min(1),
  vintage: z.number().int().optional(),
  batch: z.string().optional(),
  alcoholContent: z.number().optional(),
  energyValueKJ: z.number().optional(),
  energyValueKcal: z.number().optional(),
  fat: z.number().optional(),
  saturatedFat: z.number().optional(),
  carbs: z.number().optional(),
  sugars: z.number().optional(),
  protein: z.number().optional(),
  salt: z.number().optional(),
  ingredients: z.string().optional(),
  additionalInfo: z.string().optional(),
  allergens: z.string().optional(),
  wineRegion: z.string().optional(),
  wineSubregion: z.string().optional(),
  wineVillage: z.string().optional(),
  wineTract: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  wineryName: z.string().optional(),
  winerySlug: z.string().optional(),
});

export const AppwriteWineWriteDataSchema = z
  .object({
    userId: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    vintage: z.number().int().nullable().optional(),
    batch: z.string().nullable().optional(),
    alcoholContent: z.number().nullable().optional(),
    energyValueKJ: z.number().nullable().optional(),
    energyValueKcal: z.number().nullable().optional(),
    fat: z.number().nullable().optional(),
    saturatedFat: z.number().nullable().optional(),
    carbs: z.number().nullable().optional(),
    sugars: z.number().nullable().optional(),
    protein: z.number().nullable().optional(),
    salt: z.number().nullable().optional(),
    ingredients: z.string().nullable().optional(),
    additionalInfo: z.string().nullable().optional(),
    allergens: z.string().nullable().optional(),
    wineRegion: z.string().nullable().optional(),
    wineSubregion: z.string().nullable().optional(),
    wineVillage: z.string().nullable().optional(),
    wineTract: z.string().nullable().optional(),
    wineryName: z.string().nullable().optional(),
    winerySlug: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .catchall(z.unknown());

export type AppwriteWineRecord = z.infer<typeof AppwriteWineRecordSchema>;
export type WineryWine = z.infer<typeof WineryWineSchema>;
export type AppwriteWineWriteData = z.infer<typeof AppwriteWineWriteDataSchema>;
