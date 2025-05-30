import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { getWinesByUserId } from '@/lib/appwrite-client';

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
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Get user data (winery data)
    const user = await getUserById(verifiedToken.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get all wines for the user
    const allWines = await getWinesByUserId(verifiedToken.userId);
    
    return NextResponse.json({
      winery: {
        id: user.$id,
        email: user.email,
        name: user.name,
        _count: {
          wines: allWines.length
        }
      },
      allWines,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}