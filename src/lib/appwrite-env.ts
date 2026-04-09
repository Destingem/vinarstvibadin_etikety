import { Client } from 'appwrite';

const LOCAL_APP_URL = 'http://localhost:3232';

function getRequiredEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getPublicAppwriteEnv() {
  const projectId = getRequiredEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID');

  return {
    endpoint: getRequiredEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'),
    projectId,
    projectName: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_NAME || projectId,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || LOCAL_APP_URL,
  };
}

export function getServerAppwriteEnv() {
  return {
    endpoint: getRequiredEnv('APPWRITE_ENDPOINT'),
    projectId: getRequiredEnv('APPWRITE_PROJECT_ID'),
    apiKey: getRequiredEnv('APPWRITE_KEY'),
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
