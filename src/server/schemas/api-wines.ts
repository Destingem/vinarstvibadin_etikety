import { z } from 'zod';

const numberishField = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    const parsedValue = Number.parseFloat(value);
    return Number.isFinite(parsedValue) ? parsedValue : undefined;
  });

const vintageField = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? value : Math.trunc(value);
    }

    if (!/^\d{4}$/.test(value)) {
      return Number.NaN;
    }

    return Number.parseInt(value, 10);
  })
  .refine((value) => value === undefined || Number.isFinite(value), {
    message: 'Ročník musí být čtyřmístné číslo',
  });

const nullableTextField = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : undefined;
  });

export const ApiWineListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().default(''),
});

export const ApiWineBaseInputSchema = z.object({
  name: z.string().trim().min(1, { message: 'Název vína je povinný' }),
  vintage: vintageField,
  batch: nullableTextField,
  alcohol: numberishField,
  alcoholContent: numberishField,
  energyValueKJ: numberishField,
  energyValueKcal: numberishField,
  fat: numberishField,
  saturatedFat: numberishField,
  carbs: numberishField,
  sugars: numberishField,
  protein: numberishField,
  salt: numberishField,
  ingredients: nullableTextField,
  additionalInfo: nullableTextField,
  allergens: nullableTextField,
  wineRegion: nullableTextField,
  wineSubregion: nullableTextField,
  wineVillage: nullableTextField,
  wineTract: nullableTextField,
});

export const CreateApiWineInputSchema = ApiWineBaseInputSchema;

export const UpdateApiWineInputSchema = ApiWineBaseInputSchema.partial().extend({
  name: z.string().trim().min(1, { message: 'Název vína je povinný' }),
});

export type ApiWineListQuery = z.infer<typeof ApiWineListQuerySchema>;
export type CreateApiWineInput = z.infer<typeof CreateApiWineInputSchema>;
export type UpdateApiWineInput = z.infer<typeof UpdateApiWineInputSchema>;
