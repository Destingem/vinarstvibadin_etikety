import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-middleware';
import { getWineAnalytics } from '@/lib/analytics-api';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';

// GET /api/v1/analytics/wine/[wineId] - Get analytics for a specific wine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wineId: string }> }
) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      const { wineId } = await params;
      
      // Get the wine from the database to check ownership
      try {
        const wine = await adminDatabases.getDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wineId
        );
        
        // Check if the wine belongs to the authenticated user
        if (wine.userId !== ctx.userId) {
          return NextResponse.json(
            { error: 'Přístup odepřen', message: 'Nemáte oprávnění zobrazit analytiku pro toto víno' },
            { status: 403 }
          );
        }
        
        // Get query parameters
        const { searchParams } = new URL(req.url);
        const range = searchParams.get('range') || '30days';
        
        // Get wine analytics
        const analytics = await getWineAnalytics(wineId, range);
        
        // Return analytics data
        return NextResponse.json({
          wine: {
            id: wine.$id,
            name: wine.name,
            vintage: wine.vintage,
            batch: wine.batch,
          },
          analytics
        });
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
    } catch (error) {
      console.error('Error fetching wine analytics:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při načítání analytických dat pro víno' },
        { status: 500 }
      );
    }
  });
}