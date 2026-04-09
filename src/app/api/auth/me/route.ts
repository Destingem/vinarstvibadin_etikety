import { NextRequest, NextResponse } from 'next/server';
import { getRequestSessionUser } from '@/server/auth/session';
import {
  getWineryProfile,
  serializeWineryProfileForAuth,
} from '@/server/services/winery-profiles';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 },
      );
    }

    const profile = await getWineryProfile(sessionUser.id);

    if (!profile) {
      return NextResponse.json(
        { message: 'Profil vinařství nebyl nalezen' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: serializeWineryProfileForAuth(profile),
      profile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při získávání údajů o uživateli' },
      { status: 500 },
    );
  }
}
