import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById, createSlug } from '@/lib/auth-server';

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
      
      // Get user by ID using our helper function that has proper API key setup
      const user = await getUserById(decoded.userId);
      
      // Return user information
      return NextResponse.json({ 
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          slug: user.prefs?.slug || createSlug(user.name)
        }
      });
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { message: 'Neplatný token nebo uživatel neexistuje' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při získávání údajů o uživateli' },
      { status: 500 }
    );
  }
}

