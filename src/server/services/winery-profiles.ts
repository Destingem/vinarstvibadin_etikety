import { createSlug } from '@/lib/auth-server';
import {
  findConflictingWineryProfileOwnerUserIdBySlug,
  findWineryProfileSourceByOwnerUserId,
  isWineryProfileDedicatedCollectionAvailable,
  persistWineryProfileSourceByOwnerUserId,
} from '@/server/repositories/winery-profiles';
import {
  WineryProfileAuthPayloadSchema,
  WineryProfileSchema,
  WineryProfileSettingsSchema,
  type AppwriteUserPreferences,
  type AppwriteUserRecord,
  type WineryProfile,
  type WineryProfileAuthPayload,
  type WineryProfileUpdateInput,
} from '@/server/schemas/winery-profile';

const ADMIN_EMAILS = new Set([
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz',
]);

const DEMO_EMAIL = 'demo@etiketa.wine';
const DEFAULT_LOCALE = 'cs';
const PROFILE_UPDATE_COOLDOWN_MONTHS = 6;

type ChangedProfileField = 'displayName' | 'slug' | 'locale' | 'settings';

export class WineryProfileRestrictionError extends Error {
  restrictedField: 'name' | 'slug';
  nextAllowedDate: string;

  constructor(message: string, restrictedField: 'name' | 'slug', nextAllowedDate: string) {
    super(message);
    this.name = 'WineryProfileRestrictionError';
    this.restrictedField = restrictedField;
    this.nextAllowedDate = nextAllowedDate;
  }
}

export class WineryProfileSlugConflictError extends Error {
  conflictingOwnerUserId: string;
  slug: string;

  constructor(slug: string, conflictingOwnerUserId: string) {
    super(`Slug vinařství "${slug}" je již obsazený`);
    this.name = 'WineryProfileSlugConflictError';
    this.slug = slug;
    this.conflictingOwnerUserId = conflictingOwnerUserId;
  }
}

function getNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function normalizeLocale(value: unknown): string {
  const rawLocale = getNonEmptyString(value);
  if (!rawLocale) {
    return DEFAULT_LOCALE;
  }

  return rawLocale.replace('_', '-');
}

function buildFallbackDisplayName(email: string, ownerUserId: string) {
  const emailPrefix = getNonEmptyString(email.split('@')[0]);

  if (emailPrefix) {
    return emailPrefix;
  }

  return `Vinarstvi ${ownerUserId.slice(0, 6)}`;
}

function buildFallbackSlug(displayName: string, ownerUserId: string) {
  const generatedSlug = createSlug(displayName);
  return generatedSlug || `winery-${ownerUserId.slice(0, 6)}`;
}

function extractSettings(preferences: AppwriteUserPreferences) {
  const { displayName, slug, locale, isAdmin, isDemo, ...settings } = preferences;
  return WineryProfileSettingsSchema.parse(settings);
}

function buildWineryProfile(sourceRecord: AppwriteUserRecord): WineryProfile {
  const preferences = sourceRecord.prefs ?? {};
  const normalizedEmail = sourceRecord.email.trim();
  const normalizedEmailLower = normalizedEmail.toLowerCase();
  const displayName =
    getNonEmptyString(preferences.displayName) ??
    getNonEmptyString(sourceRecord.name) ??
    buildFallbackDisplayName(normalizedEmail, sourceRecord.$id);

  const slug =
    getNonEmptyString(preferences.slug) ??
    buildFallbackSlug(displayName, sourceRecord.$id);

  const locale = normalizeLocale(preferences.locale);

  const isAdmin =
    typeof preferences.isAdmin === 'boolean'
      ? preferences.isAdmin
      : ADMIN_EMAILS.has(normalizedEmailLower);

  const isDemo =
    typeof preferences.isDemo === 'boolean'
      ? preferences.isDemo
      : normalizedEmailLower === DEMO_EMAIL;

  return WineryProfileSchema.parse({
    ownerUserId: sourceRecord.$id,
    email: normalizedEmail,
    displayName,
    slug,
    locale,
    isAdmin,
    isDemo,
    settings: extractSettings(preferences),
  });
}

function buildChangedFields(
  currentProfile: WineryProfile,
  nextProfile: WineryProfile,
): ChangedProfileField[] {
  const changedFields: ChangedProfileField[] = [];

  if (currentProfile.displayName !== nextProfile.displayName) {
    changedFields.push('displayName');
  }

  if (currentProfile.slug !== nextProfile.slug) {
    changedFields.push('slug');
  }

  if (currentProfile.locale !== nextProfile.locale) {
    changedFields.push('locale');
  }

  if (JSON.stringify(currentProfile.settings) !== JSON.stringify(nextProfile.settings)) {
    changedFields.push('settings');
  }

  return changedFields;
}

async function assertSlugAvailability(
  ownerUserId: string | null,
  slug: string,
) {
  const normalizedSlug = normalizeSlug(slug);
  const conflictingOwnerUserId =
    await findConflictingWineryProfileOwnerUserIdBySlug(normalizedSlug, ownerUserId ?? undefined);

  if (conflictingOwnerUserId) {
    throw new WineryProfileSlugConflictError(normalizedSlug, conflictingOwnerUserId);
  }
}

function assertUpdateWindowAllowed(
  lastUpdatedAt: string | undefined,
  restrictedField: 'name' | 'slug',
) {
  if (!lastUpdatedAt) {
    return;
  }

  const lastUpdate = new Date(lastUpdatedAt);

  if (Number.isNaN(lastUpdate.getTime())) {
    return;
  }

  const nextAllowedDate = new Date(lastUpdate);
  nextAllowedDate.setMonth(nextAllowedDate.getMonth() + PROFILE_UPDATE_COOLDOWN_MONTHS);

  if (nextAllowedDate > new Date()) {
    const fieldLabel =
      restrictedField === 'name' ? 'Název vinařství' : 'Slug vinařství';

    throw new WineryProfileRestrictionError(
      `${fieldLabel} lze změnit pouze jednou za 6 měsíců. Další změna bude možná od ${nextAllowedDate.toLocaleDateString('cs-CZ')}`,
      restrictedField,
      nextAllowedDate.toISOString(),
    );
  }
}

function buildUpdatePayload(
  currentProfile: WineryProfile,
  input: WineryProfileUpdateInput,
): {
  displayName?: string;
  slug?: string;
  locale?: string;
  settings?: Record<string, unknown>;
} {
  const displayName = getNonEmptyString(input.displayName ?? input.name);
  const slug = getNonEmptyString(input.slug);
  const locale = getNonEmptyString(input.locale);
  let settings =
    input.settings && Object.keys(input.settings).length > 0
      ? { ...input.settings }
      : undefined;
  const timestamp = new Date().toISOString();

  if (displayName && displayName !== currentProfile.displayName) {
    assertUpdateWindowAllowed(currentProfile.settings.lastWineryNameUpdate, 'name');
  }

  if (slug && slug !== currentProfile.slug) {
    assertUpdateWindowAllowed(currentProfile.settings.lastWinerySlugUpdate, 'slug');
  }

  if (displayName && displayName !== currentProfile.displayName) {
    (settings ??= {}).lastWineryNameUpdate = timestamp;
  }

  if (slug && slug !== currentProfile.slug) {
    (settings ??= {}).lastWinerySlugUpdate = timestamp;
  }

  return {
    displayName,
    slug,
    locale: locale ? normalizeLocale(locale) : undefined,
    settings,
  };
}

export async function getWineryProfile(ownerUserId: string): Promise<WineryProfile | null> {
  const sourceResult = await findWineryProfileSourceByOwnerUserId(ownerUserId);

  if (!sourceResult) {
    return null;
  }

  const profile = buildWineryProfile(sourceResult.record);

  if (
    sourceResult.source === 'prefs' &&
    (await isWineryProfileDedicatedCollectionAvailable())
  ) {
    await persistWineryProfileSourceByOwnerUserId(ownerUserId, profile).catch((error) => {
      console.warn(
        '[server.services.winery-profiles] Failed to seed dedicated profile persistence',
        error,
      );
    });
  }

  return profile;
}

export function serializeWineryProfileForAuth(
  profile: WineryProfile,
): WineryProfileAuthPayload {
  return WineryProfileAuthPayloadSchema.parse({
    ...profile,
    id: profile.ownerUserId,
    name: profile.displayName,
    hasCustomQRPrefs: Boolean(profile.settings.qrPresets),
  });
}

export async function updateWineryProfile(
  ownerUserId: string,
  input: WineryProfileUpdateInput,
): Promise<{
  profile: WineryProfile;
  changedFields: ChangedProfileField[];
}> {
  const currentProfile = await getWineryProfile(ownerUserId);

  if (!currentProfile) {
    throw new Error('Profil vinařství nebyl nalezen');
  }

  const updatePayload = buildUpdatePayload(currentProfile, input);
  const shouldUpdate =
    typeof updatePayload.displayName === 'string' ||
    typeof updatePayload.slug === 'string' ||
    typeof updatePayload.locale === 'string' ||
    Boolean(updatePayload.settings && Object.keys(updatePayload.settings).length > 0);

  if (!shouldUpdate) {
    return {
      profile: currentProfile,
      changedFields: [],
    };
  }

  if (typeof updatePayload.slug === 'string') {
    await assertSlugAvailability(ownerUserId, updatePayload.slug);
  }

  const nextProfile = buildWineryProfile({
    $id: ownerUserId,
    email: currentProfile.email,
    name: updatePayload.displayName ?? currentProfile.displayName,
    prefs: {
      ...currentProfile.settings,
      ...(updatePayload.settings ?? {}),
      displayName: updatePayload.displayName ?? currentProfile.displayName,
      slug: updatePayload.slug ?? currentProfile.slug,
      locale: updatePayload.locale ?? currentProfile.locale,
      isAdmin: currentProfile.isAdmin,
      isDemo: currentProfile.isDemo,
    },
  });

  const updatedSource = await persistWineryProfileSourceByOwnerUserId(
    ownerUserId,
    nextProfile,
  );

  if (!updatedSource) {
    throw new Error('Aktualizace profilu selhala');
  }

  const persistedProfile = buildWineryProfile(updatedSource.record);

  return {
    profile: persistedProfile,
    changedFields: buildChangedFields(currentProfile, persistedProfile),
  };
}

export async function assertWineryProfileSlugAvailable(
  slug: string,
  ownerUserId?: string,
) {
  await assertSlugAvailability(ownerUserId ?? null, slug);
}

export async function getWineryProfileBySlug(slug: string) {
  const normalizedSlug = normalizeSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const ownerUserId = await findConflictingWineryProfileOwnerUserIdBySlug(
    normalizedSlug,
  );

  if (!ownerUserId) {
    return null;
  }

  return getWineryProfile(ownerUserId);
}
