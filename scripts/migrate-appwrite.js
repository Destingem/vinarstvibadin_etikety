#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const EXPORT_PATH = process.env.MIGRATION_EXPORT_PATH || path.join(process.cwd(), 'appwrite.json');
const PAGE_SIZE = 100;
const WAIT_TIMEOUT_MS = 2 * 60 * 1000;
const WAIT_INTERVAL_MS = 2000;

const EXPECTED_COLLECTION_TOTALS = {
  'wine_db/6827655800216265c9fc': 29,
  'wine_db/memberships': 5,
  'analytics/scan_events': 75,
  'analytics/daily_scan_stats': 102,
  'analytics/regional_scan_stats': 110,
  'analytics/language_scan_stats': 108,
  'analytics/hourly_scan_stats': 110,
  'analytics/wine_popularity_rankings': 48,
  'api/api_keys': 5,
  'api/api_usage': 7,
  'api/rate_limits': 3,
};

const EXPECTED_USER_TOTAL = 8;

loadEnvFile(path.join(process.cwd(), '.env'));
loadEnvFile(path.join(process.cwd(), '.env.local'));

const source = getAppwriteConfig('MIGRATION_SOURCE');
const target = getAppwriteConfig('MIGRATION_TARGET');
const exportConfig = JSON.parse(fs.readFileSync(EXPORT_PATH, 'utf8'));

const exportedDatabases = new Map((exportConfig.databases || []).map((database) => [database.$id, database]));
const exportedCollections = (exportConfig.collections || []).map((collection) => ({
  ...collection,
  attributes: (collection.attributes || []).map(normalizeAttributeSpec),
  indexes: (collection.indexes || []).map((index) => ({
    key: index.key,
    type: index.type,
    attributes: index.attributes || [],
    orders: index.orders || [],
    lengths: index.lengths || [],
  })),
}));
const exportedCollectionsByDatabase = new Map();
for (const collection of exportedCollections) {
  if (!exportedCollectionsByDatabase.has(collection.databaseId)) {
    exportedCollectionsByDatabase.set(collection.databaseId, []);
  }

  exportedCollectionsByDatabase.get(collection.databaseId).push(collection);
}

main().catch((error) => {
  console.error('\nMigration failed:');
  console.error(error instanceof Error ? error.stack || error.message : error);
  process.exit(1);
});

async function main() {
  console.log('Appwrite migration started');
  console.log(`- Source: ${source.endpoint} (${source.projectId})`);
  console.log(`- Target: ${target.endpoint} (${target.projectId})`);
  console.log(`- Export: ${EXPORT_PATH}`);

  await verifyTargetCompatibility();
  await ensureSchema();
  await migrateUsers();
  await migrateDocuments();
  await verifyMigration();
  await checkPlatformAccess();

  console.log('\nMigration completed successfully.');
}

async function ensureSchema() {
  console.log('\n[1/4] Ensuring schema');

  for (const database of exportConfig.databases || []) {
    await ensureDatabase(database);
    const collections = exportedCollectionsByDatabase.get(database.$id) || [];

    for (const collection of collections) {
      await ensureCollection(database.$id, collection);
    }
  }
}

async function migrateUsers() {
  console.log('\n[2/4] Migrating users');

  const users = await listAllUsers(source);
  console.log(`- Source users: ${users.length}`);

  for (const user of users) {
    await ensureUser(user);
  }
}

async function migrateDocuments() {
  console.log('\n[3/4] Migrating documents');

  for (const collection of exportedCollections) {
    const collectionKey = `${collection.databaseId}/${collection.$id}`;
    const documents = await listAllDocuments(source, collection.databaseId, collection.$id);
    console.log(`- ${collectionKey}: ${documents.length} documents`);
    const sourceIds = new Set(documents.map((document) => document.$id));

    if (shouldRecreateDocuments()) {
      await deleteAllDocuments(target, collection);
    }

    for (const document of documents) {
      await upsertDocument(target, collection, document.$id, {
        data: sanitizeDocumentData(document),
        permissions: document.$permissions || [],
      });
    }

    await pruneExtraDocuments(target, collection, sourceIds);
  }
}

async function verifyMigration() {
  console.log('\n[4/4] Verifying migration');

  const sourceUsers = await getUsersTotal(source);
  const targetUsers = await getUsersTotal(target);
  console.log(`- Users: source=${sourceUsers}, target=${targetUsers}`);

  if (sourceUsers !== targetUsers) {
    throw new Error(`User total mismatch: source=${sourceUsers}, target=${targetUsers}`);
  }

  if (sourceUsers !== EXPECTED_USER_TOTAL) {
    console.warn(`! Source user total differs from planned count (${EXPECTED_USER_TOTAL}): ${sourceUsers}`);
  }

  for (const [collectionKey, expectedTotal] of Object.entries(EXPECTED_COLLECTION_TOTALS)) {
    const [databaseId, collectionId] = collectionKey.split('/');
    const sourceTotal = await getDocumentsTotal(source, databaseId, collectionId);
    const targetTotal = await getDocumentsTotal(target, databaseId, collectionId);

    console.log(`- ${collectionKey}: source=${sourceTotal}, target=${targetTotal}`);

    if (sourceTotal !== targetTotal) {
      throw new Error(`Document total mismatch for ${collectionKey}: source=${sourceTotal}, target=${targetTotal}`);
    }

    if (sourceTotal !== expectedTotal) {
      console.warn(`! ${collectionKey} differs from planned count (${expectedTotal}): ${sourceTotal}`);
    }
  }
}

async function checkPlatformAccess() {
  const hosts = (process.env.MIGRATION_TARGET_WEB_HOSTS || 'https://etiketa.wine,http://localhost:3232')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean);

  if (!hosts.length) {
    return;
  }

  const response = await appwriteRequest(target, 'GET', `/projects/${target.projectId}/platforms`, {
    expectedStatuses: [200, 401, 403, 404],
  });

  if (response.status === 200) {
    console.log(`- Platform read access available. Validate Web platforms manually for: ${hosts.join(', ')}`);
    return;
  }

  console.warn(`! Web platform automation skipped. Current target key lacks platform scopes (${response.status}). Required hosts: ${hosts.join(', ')}`);
}

async function verifyTargetCompatibility() {
  const version = await getPublicHealthVersion(target.endpoint);

  if (!version) {
    console.warn('! Could not determine target Appwrite version from /health/version. Proceeding without version guard.');
    return;
  }

  console.log(`- Target Appwrite version: ${version}`);

  if (compareSemver(version, '1.8.0') < 0) {
    throw new Error(
      `Target Appwrite ${version} is not supported for this migration cutover. ` +
      'Documents on 1.7.x do not expose $sequence on this deployment, which breaks Console document routes (document-undefined). ' +
      'Upgrade self-hosted Appwrite to 1.8.0+ first, run the Appwrite migrate command, then rerun this script. ' +
      'After upgrading, set MIGRATION_RECREATE_DOCUMENTS=1 to recreate documents with fresh server metadata.'
    );
  }
}

async function ensureDatabase(database) {
  const existing = await appwriteRequest(target, 'GET', `/databases/${database.$id}`, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 404) {
    console.log(`- Creating database ${database.$id}`);
    await appwriteRequest(target, 'POST', '/databases', {
      expectedStatuses: [201],
      body: {
        databaseId: database.$id,
        name: database.name,
        enabled: database.enabled,
      },
    });
    return;
  }

  if (existing.data.name !== database.name || existing.data.enabled !== database.enabled) {
    console.log(`- Updating database ${database.$id}`);
    await appwriteRequest(target, 'PUT', `/databases/${database.$id}`, {
      expectedStatuses: [200],
      body: {
        name: database.name,
        enabled: database.enabled,
      },
    });
  } else {
    console.log(`- Database ${database.$id} already exists`);
  }
}

async function ensureCollection(databaseId, collection) {
  const existing = await appwriteRequest(target, 'GET', `/databases/${databaseId}/collections/${collection.$id}`, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 404) {
    console.log(`- Creating collection ${databaseId}/${collection.$id}`);
    await appwriteRequest(target, 'POST', `/databases/${databaseId}/collections`, {
      expectedStatuses: [201],
      body: {
        collectionId: collection.$id,
        name: collection.name,
        permissions: collection.$permissions || [],
        documentSecurity: collection.documentSecurity,
        enabled: collection.enabled,
      },
    });
  } else {
    const permissions = collection.$permissions || [];
    const existingPermissions = existing.data.$permissions || [];
    if (
      existing.data.name !== collection.name ||
      existing.data.documentSecurity !== collection.documentSecurity ||
      existing.data.enabled !== collection.enabled ||
      !isEqualStringArray(existingPermissions, permissions)
    ) {
      console.log(`- Updating collection ${databaseId}/${collection.$id}`);
      await appwriteRequest(target, 'PUT', `/databases/${databaseId}/collections/${collection.$id}`, {
        expectedStatuses: [200],
        body: {
          name: collection.name,
          permissions,
          documentSecurity: collection.documentSecurity,
          enabled: collection.enabled,
        },
      });
    } else {
      console.log(`- Collection ${databaseId}/${collection.$id} already exists`);
    }
  }

  await syncCollectionResources(databaseId, collection);
}

async function ensureUser(sourceUser) {
  const existing = await appwriteRequest(target, 'GET', `/users/${sourceUser.$id}`, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 404) {
    console.log(`- Creating user ${sourceUser.email} (${sourceUser.$id})`);
    const route = getUserImportRoute(sourceUser.hash);

    await appwriteRequest(target, 'POST', route, {
      expectedStatuses: [201],
      body: {
        userId: sourceUser.$id,
        email: sourceUser.email,
        password: sourceUser.password,
        name: sourceUser.name,
      },
    });
  } else {
    console.log(`- User ${sourceUser.email} (${sourceUser.$id}) already exists`);
  }

  const currentUser = (await appwriteRequest(target, 'GET', `/users/${sourceUser.$id}`)).data;

  if (sourceUser.name !== currentUser.name) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/name`, {
      expectedStatuses: [200],
      body: { name: sourceUser.name },
    });
  }

  if (sourceUser.email !== currentUser.email) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/email`, {
      expectedStatuses: [200],
      body: { email: sourceUser.email },
    });
  }

  if (sourceUser.phone && sourceUser.phone !== currentUser.phone) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/phone`, {
      expectedStatuses: [200],
      body: { number: sourceUser.phone },
    });
  }

  if (!!sourceUser.emailVerification !== !!currentUser.emailVerification) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/verification`, {
      expectedStatuses: [200],
      body: { emailVerification: !!sourceUser.emailVerification },
    });
  }

  if (!!sourceUser.phoneVerification !== !!currentUser.phoneVerification) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/verification/phone`, {
      expectedStatuses: [200],
      body: { phoneVerification: !!sourceUser.phoneVerification },
    });
  }

  if (!!sourceUser.status !== !!currentUser.status) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/status`, {
      expectedStatuses: [200],
      body: { status: !!sourceUser.status },
    });
  }

  const sourceLabels = sourceUser.labels || [];
  const currentLabels = currentUser.labels || [];
  if (!isEqualStringArray(sourceLabels, currentLabels)) {
    await appwriteRequest(target, 'PUT', `/users/${sourceUser.$id}/labels`, {
      expectedStatuses: [200],
      body: { labels: sourceLabels },
    });
  }

  const sourcePrefs = sourceUser.prefs || {};
  const currentPrefs = (await appwriteRequest(target, 'GET', `/users/${sourceUser.$id}/prefs`)).data || {};

  if (!isEqualJson(sourcePrefs, currentPrefs)) {
    await appwriteRequest(target, 'PATCH', `/users/${sourceUser.$id}/prefs`, {
      expectedStatuses: [200],
      body: { prefs: sourcePrefs },
    });
  }
}

async function createAttribute(env, databaseId, collectionId, attribute) {
  const type = attribute.type;
  const body = {
    key: attribute.key,
    required: !!attribute.required,
    array: !!attribute.array,
  };

  if (type === 'string') {
    body.size = attribute.size;
  }

  if (type === 'integer' || type === 'float') {
    body.min = attribute.min;
    body.max = attribute.max;
  }

  if (attribute.default !== undefined && attribute.default !== null) {
    body.default = attribute.default;
  }

  await appwriteRequest(env, 'POST', `/databases/${databaseId}/collections/${collectionId}/attributes/${type}`, {
    expectedStatuses: [202],
    body,
  });
}

async function waitForCollectionResources(databaseId, collection) {
  await waitForCollectionAttributes(databaseId, collection.$id, collection.attributes.map((attribute) => attribute.key));
  await waitForCollectionIndexes(databaseId, collection.$id, collection.indexes.map((index) => index.key));
}

async function syncCollectionResources(databaseId, collection) {
  const existingAttributes = await listCollectionAttributes(target, databaseId, collection.$id);
  const existingAttributeKeys = new Set(existingAttributes.map((attribute) => attribute.key));

  for (const attribute of collection.attributes) {
    if (!existingAttributeKeys.has(attribute.key)) {
      console.log(`  - Creating attribute ${collection.$id}.${attribute.key}`);
      await createAttribute(target, databaseId, collection.$id, attribute);
    }
  }

  await waitForCollectionAttributes(databaseId, collection.$id, collection.attributes.map((attribute) => attribute.key));

  const existingIndexes = await listCollectionIndexes(target, databaseId, collection.$id);
  const existingIndexKeys = new Set(existingIndexes.map((index) => index.key));

  for (const index of collection.indexes) {
    if (!existingIndexKeys.has(index.key)) {
      console.log(`  - Creating index ${collection.$id}.${index.key}`);
      await appwriteRequest(target, 'POST', `/databases/${databaseId}/collections/${collection.$id}/indexes`, {
        expectedStatuses: [202],
        body: index,
      });
    }
  }

  await waitForCollectionIndexes(databaseId, collection.$id, collection.indexes.map((index) => index.key));
}

async function waitForCollectionAttributes(databaseId, collectionId, expectedKeys) {
  if (!expectedKeys.length) {
    return;
  }

  await waitForResources({
    label: `attributes for ${databaseId}/${collectionId}`,
    expectedKeys,
    list: async () => {
      const attributes = await listCollectionAttributes(target, databaseId, collectionId);
      return attributes.map((attribute) => ({
        key: attribute.key,
        status: attribute.status || 'available',
        error: attribute.error,
      }));
    },
  });
}

async function waitForCollectionIndexes(databaseId, collectionId, expectedKeys) {
  if (!expectedKeys.length) {
    return;
  }

  await waitForResources({
    label: `indexes for ${databaseId}/${collectionId}`,
    expectedKeys,
    list: async () => {
      const indexes = await listCollectionIndexes(target, databaseId, collectionId);
      return indexes.map((index) => ({
        key: index.key,
        status: index.status || 'available',
        error: index.error,
      }));
    },
  });
}

async function waitForResources({ label, expectedKeys, list }) {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const resources = await list();
    const resourceMap = new Map(resources.map((resource) => [resource.key, resource]));
    const missing = expectedKeys.filter((key) => !resourceMap.has(key));
    const failed = expectedKeys
      .map((key) => resourceMap.get(key))
      .filter(Boolean)
      .filter((resource) => ['failed', 'stuck'].includes(resource.status));

    if (failed.length) {
      const summary = failed.map((resource) => `${resource.key}:${resource.status}:${resource.error || 'unknown error'}`).join(', ');
      throw new Error(`Failed while waiting for ${label}: ${summary}`);
    }

    const pending = expectedKeys
      .map((key) => resourceMap.get(key))
      .filter(Boolean)
      .filter((resource) => !['available'].includes(resource.status));

    if (!missing.length && !pending.length) {
      return;
    }

    await wait(WAIT_INTERVAL_MS);
  }

  throw new Error(`Timed out while waiting for ${label}`);
}

async function listAllUsers(env) {
  return listAll(env, '/users', 'users');
}

async function listAllDocuments(env, databaseId, collectionId) {
  return listAll(env, `/databases/${databaseId}/collections/${collectionId}/documents`, 'documents');
}

async function listAll(env, pathName, key) {
  const items = [];
  let cursorAfter = null;
  let total = null;

  while (true) {
    const separator = pathName.includes('?') ? '&' : '?';
    const queries = [`limit=${PAGE_SIZE}`];

    if (cursorAfter) {
      queries.push(`queries[]=${encodeURIComponent(JSON.stringify({
        method: 'cursorAfter',
        values: [cursorAfter],
      }))}`);
    }

    const response = await appwriteRequest(env, 'GET', `${pathName}${separator}${queries.join('&')}`);
    const batch = response.data[key] || [];
    total = typeof response.data.total === 'number' ? response.data.total : total;
    items.push(...batch);

    if (!batch.length) {
      return items;
    }

    cursorAfter = batch[batch.length - 1].$id;

    if (total !== null && items.length >= total) {
      return items;
    }
  }
}

async function listCollectionAttributes(env, databaseId, collectionId) {
  const response = await appwriteRequest(env, 'GET', `/databases/${databaseId}/collections/${collectionId}/attributes`);
  return response.data.attributes || [];
}

async function listCollectionIndexes(env, databaseId, collectionId) {
  const response = await appwriteRequest(env, 'GET', `/databases/${databaseId}/collections/${collectionId}/indexes`);
  return response.data.indexes || [];
}

async function getUsersTotal(env) {
  const response = await appwriteRequest(env, 'GET', '/users?limit=1');
  return response.data.total || 0;
}

async function getDocumentsTotal(env, databaseId, collectionId) {
  const response = await appwriteRequest(env, 'GET', `/databases/${databaseId}/collections/${collectionId}/documents?limit=1`);
  return response.data.total || 0;
}

async function upsertDocument(env, collection, documentId, payload) {
  const { databaseId, $id: collectionId } = collection;
  const documentPath = `/databases/${databaseId}/collections/${collectionId}/documents/${documentId}`;
  const createPath = `/databases/${databaseId}/collections/${collectionId}/documents`;
  const createResponse = await appwriteRequest(env, 'POST', createPath, {
    expectedStatuses: [201, 409],
    body: {
      documentId,
      ...payload,
    },
  });

  if (createResponse.status === 201) {
    return;
  }

  const existing = await appwriteRequest(env, 'GET', documentPath, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 200) {
    await appwriteRequest(env, 'PATCH', documentPath, {
      expectedStatuses: [200],
      body: payload,
    });
    return;
  }

  const conflictingDocument = await findConflictingDocument(env, collection, payload.data);

  if (conflictingDocument) {
    if (!isSameDocumentPayload(conflictingDocument, payload)) {
      throw new Error(
        `Unique-index conflict for ${databaseId}/${collectionId}/${documentId}: found ${conflictingDocument.$id} with different payload after ${createResponse.data.type || '409'}`
      );
    }

    console.warn(`! Replacing conflicting document ${conflictingDocument.$id} with source ID ${documentId} in ${databaseId}/${collectionId}`);
    await appwriteRequest(env, 'DELETE', `/databases/${databaseId}/collections/${collectionId}/documents/${conflictingDocument.$id}`, {
      expectedStatuses: [204],
    });
  } else {
    await wait(WAIT_INTERVAL_MS);
  }

  const retryResponse = await appwriteRequest(env, 'POST', createPath, {
    expectedStatuses: [201, 409],
    body: {
      documentId,
      ...payload,
    },
  });

  if (retryResponse.status !== 201) {
    const retryExisting = await appwriteRequest(env, 'GET', documentPath, {
      expectedStatuses: [200, 404],
    });

    if (retryExisting.status === 200) {
      await appwriteRequest(env, 'PATCH', documentPath, {
        expectedStatuses: [200],
        body: payload,
      });
      return;
    }

    const retryConflict = await findConflictingDocument(env, collection, payload.data);
    if (retryConflict) {
      throw new Error(
        `Persistent unique-index conflict for ${databaseId}/${collectionId}/${documentId}: ${retryConflict.$id} blocks import after ${retryResponse.data.type || '409'}`
      );
    }

    throw new Error(
      `Could not create ${databaseId}/${collectionId}/${documentId}: ${retryResponse.data.type || '409'} ${retryResponse.data.message || ''}`.trim()
    );
  }
}

async function findConflictingDocument(env, collection, payloadData) {
  const uniqueIndexes = (collection.indexes || []).filter((index) => index.type === 'unique' && (index.attributes || []).length);

  if (!uniqueIndexes.length) {
    return null;
  }

  const documents = await listAllDocuments(env, collection.databaseId, collection.$id);

  for (const index of uniqueIndexes) {
    const match = documents.find((document) =>
      index.attributes.every((attribute) => areEqualValues(document[attribute], payloadData[attribute]))
    );

    if (match) {
      return match;
    }
  }

  return null;
}

async function pruneExtraDocuments(env, collection, sourceIds) {
  const targetDocuments = await listAllDocuments(env, collection.databaseId, collection.$id);
  const extraDocuments = targetDocuments.filter((document) => !sourceIds.has(document.$id));

  for (const document of extraDocuments) {
    console.warn(`! Removing extra target document ${document.$id} from ${collection.databaseId}/${collection.$id}`);
    await appwriteRequest(env, 'DELETE', `/databases/${collection.databaseId}/collections/${collection.$id}/documents/${document.$id}`, {
      expectedStatuses: [204],
    });
  }
}

async function deleteAllDocuments(env, collection) {
  const targetDocuments = await listAllDocuments(env, collection.databaseId, collection.$id);

  if (!targetDocuments.length) {
    return;
  }

  console.warn(`! Recreating documents in ${collection.databaseId}/${collection.$id}; deleting ${targetDocuments.length} existing target documents first`);

  for (const document of targetDocuments) {
    await appwriteRequest(env, 'DELETE', `/databases/${collection.databaseId}/collections/${collection.$id}/documents/${document.$id}`, {
      expectedStatuses: [204],
    });
  }
}

function isSameDocumentPayload(document, payload) {
  const sanitizedDocument = sanitizeDocumentData(document);
  return deepEqual(sanitizedDocument, payload.data) && deepEqual(document.$permissions || [], payload.permissions || []);
}

function deepEqual(left, right) {
  if (left === right) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => deepEqual(value, right[index]));
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const leftKeys = Object.keys(left).sort();
    const rightKeys = Object.keys(right).sort();

    return deepEqual(leftKeys, rightKeys) && leftKeys.every((key) => deepEqual(left[key], right[key]));
  }

  return false;
}

function areEqualValues(left, right) {
  if (left === right) {
    return true;
  }

  if (left === null || left === undefined) {
    return right === null || right === undefined;
  }

  if (right === null || right === undefined) {
    return false;
  }

  return String(left) === String(right);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

async function appwriteRequest(env, method, pathName, { expectedStatuses = [200], body } = {}) {
  const response = await fetch(`${env.endpoint}${pathName}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      'X-Appwrite-Project': env.projectId,
      'X-Appwrite-Key': env.apiKey,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = parseResponseBody(text);

  if (!expectedStatuses.includes(response.status)) {
    throw new Error(`${method} ${pathName} failed with ${response.status}: ${text}`);
  }

  return {
    status: response.status,
    data,
  };
}

function sanitizeDocumentData(document) {
  const data = {};

  for (const [key, value] of Object.entries(document)) {
    if (!key.startsWith('$')) {
      data[key] = value;
    }
  }

  return data;
}

function normalizeAttributeSpec(attribute) {
  const normalized = {
    ...attribute,
    type: attribute.type === 'double' ? 'float' : attribute.type,
  };

  if (normalized.type === 'integer') {
    if (!Number.isSafeInteger(normalized.min)) {
      delete normalized.min;
    }

    if (!Number.isSafeInteger(normalized.max)) {
      delete normalized.max;
    }
  }

  if (normalized.type === 'float') {
    if (!isMeaningfulFloatBound(normalized.min)) {
      delete normalized.min;
    }

    if (!isMeaningfulFloatBound(normalized.max)) {
      delete normalized.max;
    }
  }

  if (normalized.default === null) {
    delete normalized.default;
  }

  return normalized;
}

function getUserImportRoute(hashType) {
  const routeMap = {
    argon2: '/users/argon2',
    bcrypt: '/users/bcrypt',
    md5: '/users/md5',
    phpass: '/users/phpass',
    scrypt: '/users/scrypt',
    'scrypt-modified': '/users/scrypt-modified',
    scryptModified: '/users/scrypt-modified',
    sha: '/users/sha',
  };

  const route = routeMap[hashType];

  if (!route) {
    throw new Error(`Unsupported user hash type: ${hashType}`);
  }

  return route;
}

function isEqualJson(a, b) {
  return JSON.stringify(sortJson(a)) === JSON.stringify(sortJson(b));
}

function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = sortJson(value[key]);
        return accumulator;
      }, {});
  }

  return value;
}

function isEqualStringArray(a = [], b = []) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

function isMeaningfulFloatBound(value) {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) < 1e100;
}

function parseResponseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function getPublicHealthVersion(endpoint) {
  try {
    const response = await fetch(`${endpoint}/health/version`);

    if (!response.ok) {
      return null;
    }

    const data = parseResponseBody(await response.text());
    return data && typeof data.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

function compareSemver(left, right) {
  const leftParts = String(left).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const rightParts = String(right).split('.').map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = leftParts[index] || 0;
    const rightValue = rightParts[index] || 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

function shouldRecreateDocuments() {
  return ['1', 'true', 'yes'].includes(String(process.env.MIGRATION_RECREATE_DOCUMENTS || '').toLowerCase());
}

function getAppwriteConfig(prefix) {
  const apiKey = process.env[`${prefix}_API_KEY`] || process.env[`${prefix}_KEY`];

  return {
    endpoint: getRequiredValue(`${prefix}_ENDPOINT`),
    projectId: getRequiredValue(`${prefix}_PROJECT_ID`),
    apiKey: apiKey || getRequiredValue(`${prefix}_API_KEY`),
  };
}

function getRequiredValue(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required migration environment variable: ${key}`);
  }

  return value;
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key] !== undefined) {
      continue;
    }

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
