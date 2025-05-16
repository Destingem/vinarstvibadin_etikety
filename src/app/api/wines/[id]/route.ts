import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { z } from 'zod';
import { getWineById, updateWine, deleteWine, adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';

// Schema for updating wine
// This matches exactly the Appwrite collection attributes
const wineUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Název vína je povinný' }).optional(),
  vintage: z.number().optional().nullable(),
  batch: z.string().optional().nullable(),
  alcoholContent: z.number().optional().nullable(),
  energyValueKJ: z.number().optional().nullable(),
  energyValueKcal: z.number().optional().nullable(), // Now included in Appwrite schema
  fat: z.number().optional().nullable(),
  saturatedFat: z.number().optional().nullable(),
  carbs: z.number().optional().nullable(),
  sugars: z.number().optional().nullable(),
  protein: z.number().optional().nullable(),
  salt: z.number().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  allergens: z.string().optional().nullable(),
  wineRegion: z.string().optional().nullable(),
  wineSubregion: z.string().optional().nullable(),
  wineVillage: z.string().optional().nullable(),
  wineTract: z.string().optional().nullable(),
  // updatedAt is managed by the updateWine function
});

// Get a specific wine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // In Next.js 15, params is a Promise, so we need to await it
    const { id: wineId } = await params;
    
    // Find wine by ID using Appwrite
    let wine;
    try {
      wine = await getWineById(wineId);
    } catch (error: any) {
      console.error('Error getting wine by ID:', error);
      
      // Check for 404 error
      if (error.code === 404) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při načítání vína' },
        { status: 500 }
      );
    }
    
    if (!wine) {
      return NextResponse.json(
        { message: 'Víno nebylo nalezeno' },
        { status: 404 }
      );
    }
    
    // Check if wine belongs to current user
    if (wine.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ wine });
  } catch (error) {
    console.error('Error fetching wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání vína' },
      { status: 500 }
    );
  }
}

// Update a wine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    const { id: wineId } = await params;
    const body = await request.json();
    
    // Validate request data
    const result = wineUpdateSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // Check if wine exists and belongs to user
    let existingWine;
    try {
      existingWine = await getWineById(wineId);
    } catch (error: any) {
      console.error('Error getting wine by ID:', error);
      
      // Check for 404 error
      if (error.code === 404) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při načítání vína' },
        { status: 500 }
      );
    }
    
    if (!existingWine) {
      return NextResponse.json(
        { message: 'Víno nebylo nalezeno' },
        { status: 404 }
      );
    }
    
    if (existingWine.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění upravovat toto víno' },
        { status: 403 }
      );
    }
    
    // Update wine using Appwrite
    // Now that energyValueKcal is in the schema, we can include it
    let updatedWine;
    try {
      updatedWine = await updateWine(wineId, result.data);
    } catch (error: any) {
      console.error('Error updating wine:', error);
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při aktualizaci vína' },
        { status: 500 }
      );
    }
    
    if (!updatedWine) {
      return NextResponse.json(
        { message: 'Nastala chyba při aktualizaci vína' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Víno bylo úspěšně aktualizováno',
      wine: updatedWine,
    });
  } catch (error) {
    console.error('Error updating wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při aktualizaci vína' },
      { status: 500 }
    );
  }
}

// Delete a wine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    const { id: wineId } = await params;
    
    // Check if wine exists and belongs to user
    let existingWine;
    try {
      existingWine = await getWineById(wineId);
    } catch (error: any) {
      console.error('Error getting wine by ID:', error);
      
      // Check for 404 error
      if (error.code === 404) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při načítání vína' },
        { status: 500 }
      );
    }
    
    if (!existingWine) {
      return NextResponse.json(
        { message: 'Víno nebylo nalezeno' },
        { status: 404 }
      );
    }
    
    if (existingWine.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění smazat toto víno' },
        { status: 403 }
      );
    }
    
    // Delete wine with Appwrite
    try {
      await deleteWine(wineId);
    } catch (error: any) {
      console.error('Error deleting wine:', error);
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při mazání vína' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Víno bylo úspěšně smazáno',
    });
  } catch (error) {
    console.error('Error deleting wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při mazání vína' },
      { status: 500 }
    );
  }
}