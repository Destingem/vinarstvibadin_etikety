import { z } from 'zod';
import { ApiWineBaseInputSchema } from '@/server/schemas/api-wines';

export const InternalWineUpdateInputSchema = ApiWineBaseInputSchema.partial();

export const DuplicateWineInputSchema = z.object({
  wineId: z.string().trim().min(1, { message: 'Chybí ID vína' }),
  newBatch: z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') {
        return undefined;
      }

      const normalizedValue = value.trim();
      return normalizedValue ? normalizedValue : undefined;
    }),
  newVintage: z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      if (typeof value === 'number') {
        return Number.isInteger(value) ? value : Math.trunc(value);
      }

      const parsedValue = Number.parseInt(value, 10);
      return Number.isNaN(parsedValue) ? Number.NaN : parsedValue;
    })
    .refine((value) => value === undefined || Number.isFinite(value), {
      message: 'Ročník musí být číslo',
    }),
});

export const ImportWinePayloadSchema = z.object({
  data: z.string().min(1, { message: 'Chybí importovaná data' }),
});

export type InternalWineUpdateInput = z.infer<typeof InternalWineUpdateInputSchema>;
export type DuplicateWineInput = z.infer<typeof DuplicateWineInputSchema>;
export type ImportWinePayload = z.infer<typeof ImportWinePayloadSchema>;
