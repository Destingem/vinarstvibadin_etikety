import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma-client';

export async function GET() {
  try {
    console.log('API route: Testing database connection');
    
    // Try to count wineries
    const wineriesCount = await prisma.winery.count();
    
    // Check a specific wine
    const wine = await prisma.wine.findUnique({
      where: {
        id: '12f6753c-736c-414d-8832-433d550f9187'
      },
      include: {
        winery: true
      }
    });
    
    const wineData = wine ? {
      id: wine.id,
      name: wine.name,
      winerySlug: wine.winery.slug
    } : null;
    
    return NextResponse.json({ 
      success: true, 
      message: `Database connection successful. Found ${wineriesCount} wineries.`,
      wine: wineData
    });
  } catch (error) {
    console.error('API route: Error connecting to database:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error connecting to database',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}