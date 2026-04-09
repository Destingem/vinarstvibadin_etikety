import { NextResponse } from 'next/server';

const REQUIRED_READY_ENV_KEYS = [
  'JWT_SECRET',
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_KEY',
  'NEXT_PUBLIC_APPWRITE_ENDPOINT',
  'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
  'NEXT_PUBLIC_APP_URL',
  'ENCRYPTION_KEY',
] as const;

function getMissingRuntimeConfig() {
  return REQUIRED_READY_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export async function GET() {
  const missing = getMissingRuntimeConfig();
  const ready = missing.length === 0;

  return NextResponse.json(
    {
      status: ready ? 'ready' : 'not_ready',
      service: 'etiketa.wine',
      missing,
      timestamp: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 }
  );
}
