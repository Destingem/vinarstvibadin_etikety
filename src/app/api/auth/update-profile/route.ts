import { NextRequest, NextResponse } from 'next/server';
import { WineryProfileUpdateInputSchema } from '@/server/schemas/winery-profile';
import {
  WineryProfileRestrictionError,
  WineryProfileSlugConflictError,
  serializeWineryProfileForAuth,
  updateWineryProfile,
} from '@/server/services/winery-profiles';
import { getRequestSessionUser } from '@/server/auth/session';

function buildSuccessMessage(changedFields: Array<'displayName' | 'slug' | 'locale' | 'settings'>) {
  if (changedFields.includes('displayName') && changedFields.includes('slug')) {
    return 'Profil byl úspěšně aktualizován';
  }

  if (changedFields.includes('displayName')) {
    return 'Název vinařství byl úspěšně aktualizován';
  }

  if (changedFields.includes('slug')) {
    return 'Slug vinařství byl úspěšně aktualizován';
  }

  if (changedFields.includes('locale')) {
    return 'Jazyk profilu byl úspěšně aktualizován';
  }

  if (changedFields.includes('settings')) {
    return 'Nastavení profilu bylo úspěšně aktualizováno';
  }

  return 'Žádné změny nebyly provedeny';
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const result = WineryProfileUpdateInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 },
      );
    }

    const { profile, changedFields } = await updateWineryProfile(
      sessionUser.id,
      result.data,
    );

    return NextResponse.json({
      message: buildSuccessMessage(changedFields),
      user: serializeWineryProfileForAuth(profile),
      profile,
    });
  } catch (error) {
    if (error instanceof WineryProfileRestrictionError) {
      return NextResponse.json(
        {
          message: error.message,
          nextAllowedDate: error.nextAllowedDate,
          restrictedField: error.restrictedField,
        },
        { status: 429 },
      );
    }

    if (error instanceof WineryProfileSlugConflictError) {
      return NextResponse.json(
        {
          message: error.message,
          conflictingOwnerUserId: error.conflictingOwnerUserId,
          slug: error.slug,
        },
        { status: 409 },
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Aktualizace profilu selhala' },
      { status: 500 },
    );
  }
}
