import { Client } from 'appwrite';

const LOCAL_APP_URL = 'http://localhost:3232';

function requireEnv(value: string | undefined, key: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicAppwriteEnv() {
  // Client bundles only get NEXT_PUBLIC_* vars when referenced statically.
  const projectId = requireEnv(
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID'
  );
  const endpoint = requireEnv(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    'NEXT_PUBLIC_APPWRITE_ENDPOINT'
  );

  return {
    endpoint,
    projectId,
    projectName: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME || projectId,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || LOCAL_APP_URL,
  };
}

export function getServerAppwriteEnv() {
  return {
    endpoint: requireEnv(process.env.APPWRITE_ENDPOINT, 'APPWRITE_ENDPOINT'),
    projectId: requireEnv(process.env.APPWRITE_PROJECT_ID, 'APPWRITE_PROJECT_ID'),
    apiKey: requireEnv(process.env.APPWRITE_KEY, 'APPWRITE_KEY'),
  };
}

export function createPublicAppwriteClient() {
  const env = getPublicAppwriteEnv();

  return new Client()
    .setEndpoint(env.endpoint)
    .setProject(env.projectId);
}

export function createAdminAppwriteClient() {
  const env = getServerAppwriteEnv();
  const client = new Client()
    .setEndpoint(env.endpoint)
    .setProject(env.projectId);
  const typedClient = client as any;

  if (typeof typedClient.setKey === 'function') {
    typedClient.setKey(env.apiKey);
  } else if (typeof typedClient.setApiKey === 'function') {
    typedClient.setApiKey(env.apiKey);
  } else {
    typedClient.headers = {
      ...(typedClient.headers || {}),
      'X-Appwrite-Key': env.apiKey,
    };
  }

  return client;
}

export function getAppwriteAdminHeaders(headers: Record<string, string> = {}) {
  const env = getServerAppwriteEnv();

  return {
    'X-Appwrite-Project': env.projectId,
    'X-Appwrite-Key': env.apiKey,
    ...headers,
  };
}

export function getAppwriteUrl(path: string) {
  const { endpoint } = getServerAppwriteEnv();

  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${endpoint}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getAuthContextFingerprint() {
  const env = getPublicAppwriteEnv();
  return `${env.endpoint}|${env.projectId}`;
}
