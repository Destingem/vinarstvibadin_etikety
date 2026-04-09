import { NextRequest, NextResponse } from 'next/server';
import { checkWineLimit, incrementWineCount } from '@/lib/appwrite';
import { requireSessionUser } from '@/server/http/require-session-user';
import { DuplicateWineInputSchema } from '@/server/schemas/internal-wines';
import { duplicateOwnedWine } from '@/server/services/api-wines';

function createOwnershipErrorResponse(status: 'forbidden' | 'not_found') {
  if (status === 'forbidden') {
    return NextResponse.json(
      { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
      { status: 403 }
    );
  }

  return NextResponse.json(
    { message: 'Víno nebylo nalezeno' },
    { status: 404 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const limitCheck = await checkWineLimit(session.user.id);

    if (!limitCheck.canCreate) {
      const limitText = limitCheck.limit === -1 ? '∞' : limitCheck.limit.toString();
      const yearInfo =
        limitCheck.yearlyLimit > 0
          ? ` (${limitCheck.yearlyLimit} vín ročně × ${limitCheck.yearsSinceStart} ${limitCheck.yearsSinceStart === 1 ? 'rok' : limitCheck.yearsSinceStart < 5 ? 'roky' : 'let'})`
          : '';

      return NextResponse.json(
        {
          message: `Dosáhli jste limitu pro vytváření vín. Aktuální využití: ${limitCheck.currentCount}/${limitText}${yearInfo}. Kopírování vína se počítá jako vytvoření nového vína.`,
          error: 'WINE_LIMIT_EXCEEDED',
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          yearlyLimit: limitCheck.yearlyLimit,
          yearsSinceStart: limitCheck.yearsSinceStart,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsedInput = DuplicateWineInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: parsedInput.error.format() },
        { status: 400 }
      );
    }

    const result = await duplicateOwnedWine(session.user.id, parsedInput.data);

    if (result.status !== 'ok') {
      return createOwnershipErrorResponse(result.status);
    }

    try {
      await incrementWineCount(session.user.id);
    } catch (error) {
      console.error('Error incrementing wine count after duplication:', error);
    }

    return NextResponse.json({
      message: 'Víno bylo úspěšně zkopírováno',
      wine: result.wine,
    });
  } catch (error) {
    console.error('Error duplicating wine:', error);

    return NextResponse.json(
      { message: 'Nastala chyba při kopírování vína' },
      { status: 500 }
    );
  }
}
