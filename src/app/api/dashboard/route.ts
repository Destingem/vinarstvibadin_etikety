import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import prisma from '@/lib/prisma-client';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get winery data
    const winery = await prisma.winery.findUnique({
      where: { id: verifiedToken.userId },
      include: {
        _count: {
          select: { wines: true },
        },
      },
    });
    
    // Get recent wines
    const recentWines = await prisma.wine.findMany({
      where: { wineryId: verifiedToken.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    return NextResponse.json({
      winery,
      recentWines,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}