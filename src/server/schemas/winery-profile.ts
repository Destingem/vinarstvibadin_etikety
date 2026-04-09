import { z } from 'zod';

export const WineryProfileSettingsSchema = z
  .object({
    qrPresets: z.string().optional(),
    lastReset: z.string().optional(),
    lastWineryNameUpdate: z.string().optional(),
    lastWinerySlugUpdate: z.string().optional(),
  })
  .catchall(z.unknown());

export const WineryProfileSettingsUpdateSchema = WineryProfileSettingsSchema.partial();

export const AppwriteUserPreferencesSchema = z
  .object({
    displayName: z.string().optional(),
    slug: z.string().optional(),
    locale: z.string().optional(),
    isAdmin: z.boolean().optional(),
    isDemo: z.boolean().optional(),
  })
  .catchall(z.unknown());

export const AppwriteUserRecordSchema = z.object({
  $id: z.string().min(1),
  email: z.string().min(1),
  name: z.string().optional().default(''),
  prefs: AppwriteUserPreferencesSchema.optional().default({}),
});

export const WineryProfileSchema = z.object({
  ownerUserId: z.string().min(1),
  email: z.string().min(1),
  displayName: z.string().min(1),
  slug: z.string().min(1),
  locale: z.string().min(1),
  isAdmin: z.boolean(),
  isDemo: z.boolean(),
  settings: WineryProfileSettingsSchema,
});

export const WineryProfileDocumentSchema = WineryProfileSchema.extend({
  $id: z.string().min(1),
  ownerUserId: z.string().min(1).optional(),
}).passthrough();

export const WineryProfileAuthPayloadSchema = WineryProfileSchema.extend({
  id: z.string().min(1),
  name: z.string().min(1),
  hasCustomQRPrefs: z.boolean(),
});

export const WineryProfileUpdateInputSchema = z
  .object({
    displayName: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).optional(),
    email: z.string().email().optional(),
    slug: z
      .string()
      .trim()
      .min(1)
      .regex(/^[a-z0-9-]+$/, {
        message: 'Slug může obsahovat pouze malá písmena, číslice a pomlčky',
      })
      .optional(),
    locale: z.string().trim().min(1).max(16).optional(),
    settings: WineryProfileSettingsUpdateSchema.optional(),
    updateField: z.enum(['name', 'email', 'slug', 'all']).optional(),
  })
  .superRefine((value, ctx) => {
    const hasMutation =
      Boolean(value.displayName ?? value.name) ||
      Boolean(value.slug) ||
      Boolean(value.locale) ||
      Boolean(value.settings && Object.keys(value.settings).length > 0);

    if (!hasMutation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Požadavek neobsahuje žádnou změnu profilu',
        path: ['displayName'],
      });
    }
  });

export type AppwriteUserPreferences = z.infer<typeof AppwriteUserPreferencesSchema>;
export type AppwriteUserRecord = z.infer<typeof AppwriteUserRecordSchema>;
export type WineryProfileSettings = z.infer<typeof WineryProfileSettingsSchema>;
export type WineryProfile = z.infer<typeof WineryProfileSchema>;
export type WineryProfileAuthPayload = z.infer<typeof WineryProfileAuthPayloadSchema>;
export type WineryProfileUpdateInput = z.infer<typeof WineryProfileUpdateInputSchema>;
