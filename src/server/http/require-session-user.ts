import { NextRequest, NextResponse } from 'next/server';
import {
  getRequestSessionUser,
  type SessionUser,
} from '@/server/auth/session';

type SessionRequirementResult =
  | { user: SessionUser; response: null }
  | { user: null; response: NextResponse };

export async function requireSessionUser(
  request: NextRequest
): Promise<SessionRequirementResult> {
  const user = await getRequestSessionUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}
