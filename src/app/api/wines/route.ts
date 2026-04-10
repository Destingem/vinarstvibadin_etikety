import { NextRequest, NextResponse } from 'next/server';
import { checkWineLimit, incrementWineCount } from '@/lib/appwrite';
import {
  CreateApiWineInputSchema,
  InternalApiWineListQuerySchema,
} from '@/server/schemas/api-wines';
import { requireSessionUser } from '@/server/http/require-session-user';
import { createApiWine, listApiWines } from '@/server/services/api-wines';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const parsedQuery = InternalApiWineListQuerySchema.safeParse({
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
      search: request.nextUrl.searchParams.get('search') ?? undefined,
    });

    if (!parsedQuery.success) {
      return NextResponse.json(
        { message: 'Neplatné parametry dotazu', errors: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const result = await listApiWines(session.user.id, parsedQuery.data);

    if (!result) {
      return NextResponse.json(
        { message: 'Účet nebyl nalezen' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching wines:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání vín' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const body = await request.json();
    const parsedInput = CreateApiWineInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: parsedInput.error.format() },
        { status: 400 }
      );
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
          message: `Dosáhli jste limitu pro vytváření vín. Aktuální využití: ${limitCheck.currentCount}/${limitText}${yearInfo}`,
          error: 'WINE_LIMIT_EXCEEDED',
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          yearlyLimit: limitCheck.yearlyLimit,
          yearsSinceStart: limitCheck.yearsSinceStart,
        },
        { status: 403 }
      );
    }

    const wine = await createApiWine(session.user.id, parsedInput.data);

    if (!wine) {
      return NextResponse.json(
        { message: 'Účet nebyl nalezen' },
        { status: 404 }
      );
    }

    try {
      await incrementWineCount(session.user.id);
    } catch (error) {
      console.error('Error incrementing wine count after create:', error);
    }

    return NextResponse.json(
      {
        message: 'Víno bylo úspěšně vytvořeno',
        wine,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření vína' },
      { status: 500 }
    );
  }
}
