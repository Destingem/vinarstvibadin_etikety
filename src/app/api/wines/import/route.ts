import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID, Query, ID } from '@/lib/appwrite-client';
import { deobfuscateData } from '@/lib/encryption';
import { z } from 'zod';

// Schema for import validation
const importSchema = z.object({
  data: z.string()
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
    
    // Parse and validate request body
    const body = await request.json();
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
      const userId = decoded.userId;
      
      // Try to deobfuscate the data
      let importData;
      try {
        importData = deobfuscateData(data);
      } catch (deobfuscateError) {
        console.error('Deobfuscation error:', deobfuscateError);
        return NextResponse.json(
          { message: 'Soubor je poškozený nebo byl vytvořen jiným systémem exportu' },
          { status: 400 }
        );
      }
      
      // Validate the structure of the imported data
      if (!importData?.wines || !Array.isArray(importData.wines)) {
        return NextResponse.json(
          { message: 'Neplatný formát importovaných dat - chybí seznam vín' },
          { status: 400 }
        );
      }
      
      // Process each wine
      const importResults = {
        total: importData.wines.length,
        imported: 0,
        skipped: 0,
        errors: [] as string[]
      };
      
      for (const wine of importData.wines) {
        try {
          // Remove any existing IDs and metadata from imported wine
          const {
            $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId,
            ...wineData
          } = wine;
          
          // Check if wine with the same name, vintage and batch already exists
          const existingQuery = [
            Query.equal('userId', userId),
            Query.equal('name', wineData.name || '')
          ];
          
          // Add vintage to query if it exists
          if (wineData.vintage) {
            existingQuery.push(Query.equal('vintage', wineData.vintage));
          }
          
          // Add batch to query if it exists
          if (wineData.batch) {
            existingQuery.push(Query.equal('batch', wineData.batch));
          }
          
          const existingWines = await adminDatabases.listDocuments(
            DB_ID,
            WINES_COLLECTION_ID,
            existingQuery
          );
          
          // Skip if wine already exists
          if (existingWines.total > 0) {
            importResults.skipped++;
            continue;
          }
          
          // Ensure the wine has this user's ID
          wineData.userId = userId;
          
          // Create new wine
          await adminDatabases.createDocument(
            DB_ID,
            WINES_COLLECTION_ID,
            ID.unique(),
            wineData
          );
          
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