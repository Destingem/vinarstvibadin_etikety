const DB_ID = 'wine_db';
const COLLECTION_ID = 'winery_profiles';

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const endpoint = requireEnv('APPWRITE_ENDPOINT').replace(/\/$/, '');
const projectId = requireEnv('APPWRITE_PROJECT_ID');
const apiKey = requireEnv('APPWRITE_KEY');

function appwriteUrl(path) {
  return `${endpoint}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(method, path, body) {
  const response = await fetch(appwriteUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    return response.status === 204 ? null : response.json();
  }

  const errorText = await response.text();

  if (response.status === 409) {
    return null;
  }

  throw new Error(`${method} ${path} failed (${response.status}): ${errorText}`);
}

async function waitForAttribute(key) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const data = await request(
      'GET',
      `/databases/${DB_ID}/collections/${COLLECTION_ID}/attributes`,
    );

    const attribute = Array.isArray(data?.attributes)
      ? data.attributes.find((entry) => entry.key === key)
      : null;

    if (!attribute || attribute.status === 'available') {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for attribute ${key}`);
}

async function waitForIndex(key) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const data = await request(
      'GET',
      `/databases/${DB_ID}/collections/${COLLECTION_ID}/indexes`,
    );

    const index = Array.isArray(data?.indexes)
      ? data.indexes.find((entry) => entry.key === key)
      : null;

    if (!index || index.status === 'available') {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for index ${key}`);
}

async function ensureCollection() {
  const existing = await request(
    'GET',
    `/databases/${DB_ID}/collections/${COLLECTION_ID}`,
  ).catch(() => null);

  if (existing) {
    console.log(`Collection ${COLLECTION_ID} already exists`);
    return;
  }

  await request('POST', `/databases/${DB_ID}/collections`, {
    collectionId: COLLECTION_ID,
    name: 'winery_profiles',
    documentSecurity: false,
    enabled: true,
    permissions: [],
  });

  console.log(`Created collection ${COLLECTION_ID}`);
}

async function ensureAttributes() {
  const attributes = [
    ['string', { key: 'ownerUserId', size: 255, required: true }],
    ['string', { key: 'email', size: 255, required: true }],
    ['string', { key: 'displayName', size: 255, required: true }],
    ['string', { key: 'slug', size: 255, required: true }],
    ['string', { key: 'locale', size: 16, required: true, default: 'cs' }],
    ['string', { key: 'settingsJson', size: 16384, required: false, default: '{}' }],
    ['boolean', { key: 'isAdmin', required: false, default: false }],
    ['boolean', { key: 'isDemo', required: false, default: false }],
    ['datetime', { key: 'createdAt', required: false }],
    ['datetime', { key: 'updatedAt', required: false }],
  ];

  for (const [type, payload] of attributes) {
    await request(
      'POST',
      `/databases/${DB_ID}/collections/${COLLECTION_ID}/attributes/${type}`,
      payload,
    );
    await waitForAttribute(payload.key);
    console.log(`Ensured attribute ${payload.key}`);
  }
}

async function ensureIndexes() {
  const indexes = [
    {
      key: 'ownerUserId_unique',
      type: 'unique',
      attributes: ['ownerUserId'],
      orders: ['ASC'],
    },
    {
      key: 'slug_unique',
      type: 'unique',
      attributes: ['slug'],
      orders: ['ASC'],
    },
    {
      key: 'email_idx',
      type: 'key',
      attributes: ['email'],
      orders: ['ASC'],
    },
  ];

  for (const index of indexes) {
    await request(
      'POST',
      `/databases/${DB_ID}/collections/${COLLECTION_ID}/indexes`,
      index,
    );
    await waitForIndex(index.key);
    console.log(`Ensured index ${index.key}`);
  }
}

async function main() {
  await ensureCollection();
  await ensureAttributes();
  await ensureIndexes();
  console.log('winery_profiles setup complete');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
