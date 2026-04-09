import { NextRequest, NextResponse } from 'next/server';
import { checkWineLimit, incrementWineCount } from '@/lib/appwrite';
import { deobfuscateData } from '@/lib/encryption';
import { requireSessionUser } from '@/server/http/require-session-user';
import { ImportWinePayloadSchema } from '@/server/schemas/internal-wines';
import { importOwnedWines } from '@/server/services/api-wines';

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser(request);

    if (session.response) {
      return session.response;
    }

    const body = await request.json();
    const parsedPayload = ImportWinePayloadSchema.safeParse(body);

    if (!parsedPayload.success) {
      return NextResponse.json(
        {
          message: 'Neplatný formát importovaných dat',
          errors: parsedPayload.error.format(),
        },
        { status: 400 }
      );
    }

    let importData: unknown;

    try {
      importData = deobfuscateData(parsedPayload.data.data);
    } catch (deobfuscateError) {
      console.error('Deobfuscation error:', deobfuscateError);
      return NextResponse.json(
        { message: 'Soubor je poškozený nebo byl vytvořen jiným systémem exportu' },
        { status: 400 }
      );
    }

    const importedWines =
      importData &&
      typeof importData === 'object' &&
      'wines' in importData &&
      Array.isArray(importData.wines)
        ? importData.wines
        : null;

    if (!importedWines) {
      return NextResponse.json(
        { message: 'Neplatný formát importovaných dat - chybí seznam vín' },
        { status: 400 }
      );
    }

    const limitCheck = await checkWineLimit(session.user.id);
    const winesToImport = importedWines.length;

    if (!limitCheck.canCreate) {
      const limitText = limitCheck.limit === -1 ? '∞' : limitCheck.limit.toString();
      const yearInfo =
        limitCheck.yearlyLimit > 0
          ? ` (${limitCheck.yearlyLimit} vín ročně × ${limitCheck.yearsSinceStart} ${limitCheck.yearsSinceStart === 1 ? 'rok' : limitCheck.yearsSinceStart < 5 ? 'roky' : 'let'})`
          : '';

      return NextResponse.json(
        {
          message: `Dosáhli jste limitu pro vytváření vín. Aktuální využití: ${limitCheck.currentCount}/${limitText}${yearInfo}. Nemůžete importovat žádná další vína.`,
          error: 'WINE_LIMIT_EXCEEDED',
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          yearlyLimit: limitCheck.yearlyLimit,
          yearsSinceStart: limitCheck.yearsSinceStart,
        },
        { status: 403 }
      );
    }

    const remainingWines =
      limitCheck.limit === -1 ? winesToImport : limitCheck.limit - limitCheck.currentCount;

    if (limitCheck.limit !== -1 && winesToImport > remainingWines) {
      const yearInfo =
        limitCheck.yearlyLimit > 0
          ? ` (${limitCheck.yearlyLimit} vín ročně × ${limitCheck.yearsSinceStart} ${limitCheck.yearsSinceStart === 1 ? 'rok' : limitCheck.yearsSinceStart < 5 ? 'roky' : 'let'})`
          : '';

      return NextResponse.json(
        {
          message: `Import ${winesToImport} vín by překročil váš limit. Zbývá ${remainingWines} vín z celkového limitu ${limitCheck.limit}${yearInfo}.`,
          error: 'WINE_LIMIT_WOULD_EXCEED',
          currentCount: limitCheck.currentCount,
          limit: limitCheck.limit,
          remainingWines,
          requestedImport: winesToImport,
        },
        { status: 403 }
      );
    }

    const importResults = await importOwnedWines(session.user.id, importedWines);

    if (!importResults) {
      return NextResponse.json(
        { message: 'Účet nebyl nalezen' },
        { status: 404 }
      );
    }

    for (let index = 0; index < importResults.imported; index += 1) {
      try {
        await incrementWineCount(session.user.id);
      } catch (error) {
        console.error('Error incrementing wine count during import:', error);
        break;
      }
    }

    return NextResponse.json({
      message: `Import dokončen. Importováno: ${importResults.imported}, přeskočeno: ${importResults.skipped}${importResults.errors.length > 0 ? `, chyby: ${importResults.errors.length}` : ''}`,
      results: importResults,
    });
  } catch (error) {
    console.error('Data import error:', error);
    return NextResponse.json(
      { message: 'Import dat selhal' },
      { status: 500 }
    );
  }
}
