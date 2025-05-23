import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-middleware';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { Wine } from '@/lib/appwrite';

// GET /api/v1/wines/[id] - Get a specific wine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      const { id: wineId } = await params;
      
      // Get the wine from the database
      const wine = await adminDatabases.getDocument(
        DB_ID,
        WINES_COLLECTION_ID,
        wineId
      );
      
      // Check if the wine belongs to the authenticated user
      if (wine.userId !== ctx.userId) {
        return NextResponse.json(
          { error: 'Přístup odepřen', message: 'Nemáte oprávnění přistupovat k tomuto vínu' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(wine);
    } catch (error) {
      console.error('Error fetching wine:', error);
      
      // Check if the wine doesn't exist
      if ((error as any).code === 404) {
        return NextResponse.json(
          { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při načítání vína' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/v1/wines/[id] - Update a specific wine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      const { id: wineId } = await params;
      
      // Get the wine from the database to check ownership
      try {
        const existingWine = await adminDatabases.getDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wineId
        );
        
        // Check if the wine belongs to the authenticated user
        if (existingWine.userId !== ctx.userId) {
          return NextResponse.json(
            { error: 'Přístup odepřen', message: 'Nemáte oprávnění upravovat toto víno' },
            { status: 403 }
          );
        }
      } catch (error) {
        // Check if the wine doesn't exist
        if ((error as any).code === 404) {
          return NextResponse.json(
            { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
            { status: 404 }
          );
        }
        
        throw error;
      }
      
      // Get request body
      const body = await req.json();
      
      // Basic validation (would be more robust in production)
      if (!body.name) {
        return NextResponse.json(
          { error: 'Neplatné údaje', message: 'Název vína je povinný' },
          { status: 400 }
        );
      }
      
      // Prepare update data (don't allow changing userId)
      const updateData = {
        ...body,
        updatedAt: new Date().toISOString()
      };
      
      // Remove userId if it was included in the request
      delete updateData.userId;
      delete updateData.wineryName;
      delete updateData.winerySlug;
      
      // Update the wine in the database
      const updatedWine = await adminDatabases.updateDocument(
        DB_ID,
        WINES_COLLECTION_ID,
        wineId,
        updateData
      );
      
      return NextResponse.json({
        message: 'Víno bylo úspěšně aktualizováno',
        wine: updatedWine
      });
    } catch (error) {
      console.error('Error updating wine:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při aktualizaci vína' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/v1/wines/[id] - Delete a specific wine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      const { id: wineId } = await params;
      
      // Get the wine from the database to check ownership
      try {
        const existingWine = await adminDatabases.getDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wineId
        );
        
        // Check if the wine belongs to the authenticated user
        if (existingWine.userId !== ctx.userId) {
          return NextResponse.json(
            { error: 'Přístup odepřen', message: 'Nemáte oprávnění smazat toto víno' },
            { status: 403 }
          );
        }
      } catch (error) {
        // Check if the wine doesn't exist
        if ((error as any).code === 404) {
          return NextResponse.json(
            { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
            { status: 404 }
          );
        }
        
        throw error;
      }
      
      // Delete the wine from the database
      await adminDatabases.deleteDocument(
        DB_ID,
        WINES_COLLECTION_ID,
        wineId
      );
      
      return NextResponse.json({
        message: 'Víno bylo úspěšně smazáno'
      });
    } catch (error) {
      console.error('Error deleting wine:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při mazání vína' },
        { status: 500 }
      );
    }
  });
}