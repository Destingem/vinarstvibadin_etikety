import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
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
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      const userId = decoded.userId;
      
      // Get all wines for this winery
      const wines = await prisma.wine.findMany({
        where: {
          wineryId: userId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Return the exported data
      return NextResponse.json({
        wines: wines,
        exportDate: new Date().toISOString(),
        version: '1.0'
      });
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { message: 'Export dat selhal' },
      { status: 500 }
    );
  }
}