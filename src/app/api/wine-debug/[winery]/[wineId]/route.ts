import { NextRequest, NextResponse } from 'next/server';
import { getWineById } from '@/lib/appwrite-client';
import { getUserById } from '@/lib/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ winery: string; wineId: string }> }
) {
  console.log('[API] WineDebug API called with params:', params);
  
  // In Next.js 15, params should be awaited
  const { winery, wineId } = await params;
  
  try {
    // Get the wine from Appwrite
    const wine = await getWineById(wineId);

    if (!wine) {
      return NextResponse.json(
        { message: 'Wine not found', params },
        { status: 404 }
      );
    }

    // Get the user (winery) details
    const user = await getUserById(wine.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Winery not found', params },
        { status: 404 }
      );
    }

    // Get slug from user preferences
    const userSlug = user.prefs?.slug || '';

    // Check if the wine belongs to the winery
    if (userSlug.toLowerCase() !== winery.toLowerCase()) {
      return NextResponse.json(
        { 
          message: 'Wine does not belong to this winery', 
          params,
          winery: {
            id: user.$id,
            name: user.name,
            slug: userSlug
          }
        },
        { status: 404 }
      );
    }

    // Return the wine data
    return NextResponse.json({
      message: 'Wine found',
      wine: {
        id: wine.$id,
        name: wine.name,
        vintage: wine.vintage,
        batch: wine.batch,
      },
      winery: {
        id: user.$id,
        name: user.name,
        slug: userSlug,
      },
      params,
    });
  } catch (error) {
    console.error('[API] Error getting wine:', error);
    return NextResponse.json(
      { 
        message: 'Error getting wine', 
        error: error instanceof Error ? error.message : String(error),
        params
      },
      { status: 500 }
    );
  }
}