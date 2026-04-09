import { NextRequest, NextResponse } from 'next/server';

function createUnauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function createCronNotConfiguredResponse() {
  return NextResponse.json(
    { error: 'Cron auth not configured' },
    { status: 503 }
  );
}

export function requireCronAuth(request: NextRequest): NextResponse | null {
  const expectedSecret = process.env.CRON_SECRET?.trim();

  if (!expectedSecret) {
    console.error('[cron-auth] CRON_SECRET is missing');
    return createCronNotConfiguredResponse();
  }

  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  const providedSecret = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (!providedSecret || providedSecret !== expectedSecret) {
    return createUnauthorizedResponse();
  }

  return null;
}
