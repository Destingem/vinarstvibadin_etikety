import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import prisma from '@/lib/prisma-client';
import { z } from 'zod';

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
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
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
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      const wineryId = decoded.userId;
      
      // Process each wine
      const importResults = {
        total: data.wines.length,
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };
      
      for (const wine of data.wines) {
        try {
          // Check if wine with the same name and vintage already exists
          const existingWine = await prisma.wine.findFirst({
            where: {
              wineryId: wineryId,
              name: wine.name,
              vintage: wine.vintage ? parseInt(wine.vintage) : null
            }
          });
          
          if (existingWine) {
            importResults.skipped++;
            continue;
          }
          
          // Create new wine
          await prisma.wine.create({
            data: {
              name: wine.name,
              vintage: wine.vintage ? parseInt(wine.vintage) : null,
              batch: wine.batch || null,
              // Add only properties that exist in the schema
              additionalInfo: wine.description || '',
              wineryId: wineryId
            }
          });
          
          importResults.imported++;
        } catch (wineError: any) {
          console.error('Error importing wine:', wineError);
          importResults.errors.push(`Chyba při importu vína ${wine.name}: ${wineError.message}`);
        }
      }
      
      // Return import results
      return NextResponse.json({
        message: `Import dokončen. Importováno: ${importResults.imported}, přeskočeno: ${importResults.skipped}${importResults.errors.length > 0 ? ', chyby: ' + importResults.errors.length : ''}`,
        results: importResults
      });
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Data import error:', error);
    return NextResponse.json(
      { message: 'Import dat selhal' },
      { status: 500 }
    );
  }
}