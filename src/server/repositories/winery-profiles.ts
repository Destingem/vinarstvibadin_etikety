import { ID, Query, adminDatabases, DB_ID } from '@/lib/appwrite-client';
import { createSlug, getUserByIdStrict } from '@/lib/auth-server';
import { getAppwriteAdminHeaders, getAppwriteUrl } from '@/lib/appwrite-env';
import {
  AppwriteUserPreferencesSchema,
  AppwriteUserRecordSchema,
  WineryProfileDocumentSchema,
  type AppwriteUserPreferences,
  type AppwriteUserRecord,
  type WineryProfile,
} from '@/server/schemas/winery-profile';

const WINERY_PROFILES_COLLECTION_ID = 'winery_profiles';
const LEGACY_USERS_PAGE_SIZE = 100;

let dedicatedCollectionAvailability: boolean | null = null;

export type WineryProfileSourceResult = {
  record: AppwriteUserRecord;
  source: 'collection' | 'prefs';
};

function logInvalidUserPayload(error: unknown) {
  console.error(
    '[server.repositories.winery-profiles] Invalid Appwrite user payload',
    error,
  );
}

function parseUserRecord(record: unknown): AppwriteUserRecord | null {
  const parsedRecord = AppwriteUserRecordSchema.safeParse(record);

  if (!parsedRecord.success) {
    logInvalidUserPayload(parsedRecord.error.flatten());
    return null;
  }

  return parsedRecord.data;
}

function parseWineryProfileDocument(record: unknown): AppwriteUserRecord | null {
  const parsedRecord = WineryProfileDocumentSchema.safeParse(record);

  if (!parsedRecord.success) {
    console.error(
      '[server.repositories.winery-profiles] Invalid winery_profiles document',
      parsedRecord.error.flatten(),
    );
    return null;
  }

  const document = parsedRecord.data;
  const prefs: AppwriteUserPreferences = {
    ...document.settings,
    displayName: document.displayName,
    slug: document.slug,
    locale: document.locale,
    isAdmin: document.isAdmin,
    isDemo: document.isDemo,
  };

  return parseUserRecord({
    $id: document.ownerUserId || document.$id,
    email: document.email,
    name: document.displayName,
    prefs,
  });
}

function buildWineryProfileDocument(profile: WineryProfile) {
  return {
    ownerUserId: profile.ownerUserId,
    email: profile.email,
    displayName: profile.displayName,
    slug: profile.slug,
    locale: profile.locale,
    isAdmin: profile.isAdmin,
    isDemo: profile.isDemo,
    settings: profile.settings,
  };
}

function isAppwriteNotFoundError(error: unknown) {
  return Boolean((error as { code?: number } | null | undefined)?.code === 404);
}

async function patchAppwriteUser(path: string, body: Record<string, unknown>) {
  const response = await fetch(getAppwriteUrl(path), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAppwriteAdminHeaders(),
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Appwrite update failed (${response.status}): ${errorBody}`);
  }
}

async function isDedicatedCollectionAvailable() {
  if (dedicatedCollectionAvailability !== null) {
    return dedicatedCollectionAvailability;
  }

  try {
    await adminDatabases.listDocuments(DB_ID, WINERY_PROFILES_COLLECTION_ID, [
      Query.limit(1),
    ]);
    dedicatedCollectionAvailability = true;
  } catch (error) {
    dedicatedCollectionAvailability = false;
  }

  return dedicatedCollectionAvailability;
}

export async function isWineryProfileDedicatedCollectionAvailable() {
  return isDedicatedCollectionAvailable();
}

async function readDedicatedProfileSource(
  ownerUserId: string,
): Promise<AppwriteUserRecord | null> {
  if (!(await isDedicatedCollectionAvailable())) {
    return null;
  }

  try {
    const document = await adminDatabases.getDocument(
      DB_ID,
      WINERY_PROFILES_COLLECTION_ID,
      ownerUserId,
    );

    return parseWineryProfileDocument(document);
  } catch (error) {
    if (isAppwriteNotFoundError(error)) {
      return null;
    }

    console.warn(
      '[server.repositories.winery-profiles] Dedicated profile read failed, falling back to user prefs',
      error,
    );
    return null;
  }
}

async function upsertDedicatedProfileSource(profile: WineryProfile) {
  if (!(await isDedicatedCollectionAvailable())) {
    return null;
  }

  const payload = buildWineryProfileDocument(profile);

  try {
    await adminDatabases.updateDocument(
      DB_ID,
      WINERY_PROFILES_COLLECTION_ID,
      profile.ownerUserId,
      payload,
    );
  } catch (error) {
    if (!isAppwriteNotFoundError(error)) {
      throw error;
    }

    await adminDatabases.createDocument(
      DB_ID,
      WINERY_PROFILES_COLLECTION_ID,
      ID.custom(profile.ownerUserId),
      payload,
    );
  }

  return readDedicatedProfileSource(profile.ownerUserId);
}

async function listLegacyUsersPage(offset: number, limit: number) {
  const url = new URL(getAppwriteUrl('/users'));
  url.searchParams.append('queries[0]', Query.limit(limit));
  url.searchParams.append('queries[1]', Query.offset(offset));

  const response = await fetch(url, {
    headers: getAppwriteAdminHeaders(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Appwrite users list failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const users: unknown[] = Array.isArray(data.users)
    ? data.users
    : Array.isArray(data.documents)
      ? data.documents
      : [];

  return users
    .map((user: unknown) => parseUserRecord(user))
    .filter((user): user is AppwriteUserRecord => user !== null);
}

function getEffectiveLegacySlug(user: AppwriteUserRecord) {
  const prefs = AppwriteUserPreferencesSchema.parse(user.prefs ?? {});
  const displayName = prefs.displayName || user.name || user.email.split('@')[0];
  const explicitSlug = typeof prefs.slug === 'string' ? prefs.slug.trim() : '';

  if (explicitSlug) {
    return explicitSlug.toLowerCase();
  }

  const generatedSlug = createSlug(displayName);
  return generatedSlug || `winery-${user.$id.slice(0, 6)}`;
}

export async function findWineryProfileSourceByOwnerUserId(
  ownerUserId: string,
): Promise<WineryProfileSourceResult | null> {
  const dedicatedSource = await readDedicatedProfileSource(ownerUserId);

  if (dedicatedSource) {
    return {
      record: dedicatedSource,
      source: 'collection',
    };
  }

  const record = await getUserByIdStrict(ownerUserId);

  if (!record) {
    return null;
  }

  const parsedRecord = parseUserRecord(record);

  if (!parsedRecord) {
    return null;
  }

  return {
    record: parsedRecord,
    source: 'prefs',
  };
}

export async function persistWineryProfileSourceByOwnerUserId(
  ownerUserId: string,
  profile: WineryProfile,
): Promise<WineryProfileSourceResult | null> {
  let collectionRecord: AppwriteUserRecord | null = null;
  let prefsRecord: AppwriteUserRecord | null = null;

  try {
    collectionRecord = await upsertDedicatedProfileSource(profile);
  } catch (error) {
    console.warn(
      '[server.repositories.winery-profiles] Dedicated profile write failed, falling back to user prefs',
      error,
    );
  }

  const nextPrefs: AppwriteUserPreferences = {
    ...profile.settings,
    displayName: profile.displayName,
    slug: profile.slug,
    locale: profile.locale,
    isAdmin: profile.isAdmin,
    isDemo: profile.isDemo,
  };

  try {
    if (profile.displayName) {
      await patchAppwriteUser(`/users/${ownerUserId}/name`, {
        name: profile.displayName,
      });
    }

    await patchAppwriteUser(`/users/${ownerUserId}/prefs`, {
      prefs: nextPrefs,
    });
  } catch (error) {
    console.warn(
      '[server.repositories.winery-profiles] Appwrite prefs mirror failed',
      error,
    );
  }

  if (collectionRecord) {
    return {
      record: collectionRecord,
      source: 'collection',
    };
  }

  const legacyRecord = await getUserByIdStrict(ownerUserId);

  if (legacyRecord) {
    prefsRecord = parseUserRecord(legacyRecord);
  }

  if (prefsRecord) {
    return {
      record: prefsRecord,
      source: 'prefs',
    };
  }

  return null;
}

export async function findConflictingWineryProfileOwnerUserIdBySlug(
  slug: string,
  excludedOwnerUserId?: string,
): Promise<string | null> {
  const normalizedSlug = slug.trim().toLowerCase();

  if (!normalizedSlug) {
    return null;
  }

  if (await isDedicatedCollectionAvailable()) {
    try {
      const response = await adminDatabases.listDocuments(
        DB_ID,
        WINERY_PROFILES_COLLECTION_ID,
        [Query.equal('slug', normalizedSlug), Query.limit(2)],
      );

      const conflictingDocument = response.documents.find((document: unknown) => {
        const candidateOwnerUserId =
          typeof (document as { ownerUserId?: string }).ownerUserId === 'string'
            ? (document as { ownerUserId?: string }).ownerUserId
            : (document as { $id?: string }).$id;

        return candidateOwnerUserId !== excludedOwnerUserId;
      });

      if (conflictingDocument) {
        const conflictingOwnerUserId =
          typeof (conflictingDocument as { ownerUserId?: string }).ownerUserId ===
          'string'
            ? (conflictingDocument as { ownerUserId?: string }).ownerUserId
            : (conflictingDocument as { $id?: string }).$id;

        if (!conflictingOwnerUserId) {
          return null;
        }

        return conflictingOwnerUserId;
      }
    } catch (error) {
      console.warn(
        '[server.repositories.winery-profiles] Dedicated slug lookup failed, falling back to legacy user scan',
        error,
      );
    }
  }

  let offset = 0;

  while (true) {
    const users = await listLegacyUsersPage(offset, LEGACY_USERS_PAGE_SIZE);

    if (users.length === 0) {
      break;
    }

    const conflict = users.find((user: AppwriteUserRecord) => {
      if (user.$id === excludedOwnerUserId) {
        return false;
      }

      return getEffectiveLegacySlug(user) === normalizedSlug;
    });

    if (conflict) {
      return conflict.$id;
    }

    if (users.length < LEGACY_USERS_PAGE_SIZE) {
      break;
    }

    offset += LEGACY_USERS_PAGE_SIZE;
  }

  return null;
}
