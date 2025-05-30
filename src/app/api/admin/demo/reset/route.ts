import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID, MEMBERSHIPS_COLLECTION_ID, Query } from '@/lib/appwrite-client';

// Admin emails and demo constants
const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

const DEMO_USER_EMAIL = 'demo@etiketa.wine';

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header (optional for demo reset)
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // For demo account reset, we allow both admin access and public access (since it's just a demo)
    if (token) {
      // If token is provided, verify admin access
      try {
        const verifiedToken = verifyJwtToken(token);
        const user = await getUserById(verifiedToken.userId);
        const userEmail = user?.email;
        if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
          return NextResponse.json(
            { message: 'Nemáte oprávnění k této operaci' },
            { status: 403 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { message: 'Neplatný token' },
          { status: 401 }
        );
      }
    }
    // If no token provided, it's likely a cron job - allow it since it's just demo account
    
    const body = await request.json().catch(() => ({}));
    const demoUserId = body.demoUserId;
    
    if (!demoUserId) {
      return NextResponse.json(
        { message: 'ID demo uživatele je povinné' },
        { status: 400 }
      );
    }
    
    let deletedWines = 0;
    let resetMembership = false;
    
    try {
      // 1. Delete all wines belonging to the demo user
      const wines = await adminDatabases.listDocuments(
        DB_ID,
        WINES_COLLECTION_ID,
        [Query.equal('userId', demoUserId)]
      );
      
      for (const wine of wines.documents) {
        await adminDatabases.deleteDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wine.$id
        );
        deletedWines++;
      }
      
      // 2. Reset demo user's membership wine count
      const memberships = await adminDatabases.listDocuments(
        DB_ID,
        MEMBERSHIPS_COLLECTION_ID,
        [Query.equal('appwriteUserId', demoUserId)]
      );
      
      for (const membership of memberships.documents) {
        await adminDatabases.updateDocument(
          DB_ID,
          MEMBERSHIPS_COLLECTION_ID,
          membership.$id,
          {
            currentWineCount: 0,
            resetYear: new Date().getFullYear()
          }
        );
        resetMembership = true;
      }
      
      return NextResponse.json({
        message: 'Demo účet byl úspěšně resetován',
        details: {
          deletedWines,
          resetMembership,
          resetTime: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Error resetting demo account:', error);
      return NextResponse.json(
        { 
          message: 'Chyba při resetování demo účtu',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error processing demo reset request:', error);
    return NextResponse.json(
      { message: 'Chyba při zpracování požadavku' },
      { status: 500 }
    );
  }
}