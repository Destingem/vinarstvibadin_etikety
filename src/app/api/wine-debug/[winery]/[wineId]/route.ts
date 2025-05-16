import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ winery: string; wineId: string }> }
) {
  console.log('[API] WineDebug API called with params:', params);
  
  // In Next.js 15, params should be awaited
  const { winery, wineId } = await params;
  
  try {
    // Get the wine from the database
    const wine = await prisma.wine.findUnique({
      where: {
        id: wineId,
      },
      include: {
        winery: true,
      },
    });

    if (!wine) {
      return NextResponse.json(
        { message: 'Wine not found', params },
        { status: 404 }
      );
    }

    // Check if the wine belongs to the winery
    if (wine.winery.slug.toLowerCase() !== winery.toLowerCase()) {
      return NextResponse.json(
        { 
          message: 'Wine does not belong to this winery', 
          params,
          winery: {
            id: wine.winery.id,
            name: wine.winery.name,
            slug: wine.winery.slug
          }
        },
        { status: 404 }
      );
    }

    // Return the wine data
    return NextResponse.json({
      message: 'Wine found',
      wine: {
        id: wine.id,
        name: wine.name,
        vintage: wine.vintage,
        batch: wine.batch,
      },
      winery: {
        id: wine.winery.id,
        name: wine.winery.name,
        slug: wine.winery.slug,
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