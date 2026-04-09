import { NextRequest, NextResponse } from 'next/server';
import { getWinesByUserId, createWine } from '@/lib/appwrite-client';
import { z } from 'zod';
import { getRequestSessionUser } from '@/server/auth/session';

// Schema for a single wine
const wineSchema = z.object({
  name: z.string(),
  vintage: z.string().optional(), // We'll parse this to Int during processing
  batch: z.string().optional(),
  description: z.string().optional() // Will be mapped to additionalInfo
});

// Schema for import validation
const importSchema = z.object({
  data: z.object({
    wines: z.array(wineSchema),
    exportDate: z.string(),
    version: z.string()
  })
});

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = importSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatný formát importovaných dat', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { data } = result.data;
    
    const wineryId = sessionUser.id;
    const importResults = {
      total: data.wines.length,
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const existingWines = await getWinesByUserId(wineryId);

    for (const wine of data.wines) {
      try {
        const duplicateWine = existingWines.find((existing) =>
          existing.name === wine.name &&
          existing.vintage === (wine.vintage ? parseInt(wine.vintage) : null)
        );

        if (duplicateWine) {
          importResults.skipped++;
          continue;
        }

        await createWine(
          {
            name: wine.name,
            vintage: wine.vintage ? parseInt(wine.vintage) : null,
            batch: wine.batch || null,
            additionalInfo: wine.description || '',
          },
          wineryId
        );

        importResults.imported++;
      } catch (wineError: any) {
        console.error('Error importing wine:', wineError);
        importResults.errors.push(`Chyba při importu vína ${wine.name}: ${wineError.message}`);
      }
    }

    return NextResponse.json({
      message: `Import dokončen. Importováno: ${importResults.imported}, přeskočeno: ${importResults.skipped}${importResults.errors.length > 0 ? ', chyby: ' + importResults.errors.length : ''}`,
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
