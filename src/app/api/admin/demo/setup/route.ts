import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { adminDatabases, DB_ID, MEMBERSHIPS_COLLECTION_ID, ID } from '@/lib/appwrite-client';

// Admin emails - only these users can set up demo account
const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

// Demo account constants
const DEMO_ACCOUNT = {
  email: 'demo@etiketa.wine',
  password: 'demo123456',
  name: 'Demo Účet',
  userId: 'demo-user-id' // This will be the actual Appwrite user ID after creation
};

export async function POST(request: NextRequest) {
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
    
    // Verify the token and check admin access
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    // Get user email from request or fetch from user data (admin check)
    const body = await request.json();
    let userEmail = body.userEmail;
    
    // If no email in request, fetch user data to get email
    if (!userEmail && verifiedToken.userId) {
      const user = await getUserById(verifiedToken.userId);
      userEmail = user?.email;
    }
    
    if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění k této operaci' },
        { status: 403 }
      );
    }
    
    // First, we need to create the demo user in Appwrite
    // This should be done manually in Appwrite console or via server API
    
    // For now, let's assume the demo user exists and create/update the membership
    const demoUserId = body.demoUserId || DEMO_ACCOUNT.userId;
    
    if (!demoUserId) {
      return NextResponse.json(
        { 
          message: 'Demo uživatel musí být nejprve vytvořen v Appwrite konzoli',
          instructions: [
            '1. Přihlaste se do Appwrite konzole',
            '2. Vytvořte nového uživatele s emailem: demo@etiketa.wine',
            '3. Nastavte heslo: demo123456',
            '4. Zadejte ID tohoto uživatele do požadavku'
          ]
        },
        { status: 400 }
      );
    }
    
    // Check if demo membership already exists
    try {
      const existingMemberships = await adminDatabases.listDocuments(
        DB_ID,
        MEMBERSHIPS_COLLECTION_ID,
        [/* Query.equal('appwriteUserId', demoUserId) */] // Commented out to avoid import issues
      );
      
      let membershipId = null;
      
      // Delete existing demo membership if it exists
      for (const membership of existingMemberships.documents) {
        if ((membership as any).appwriteUserId === demoUserId) {
          await adminDatabases.deleteDocument(
            DB_ID,
            MEMBERSHIPS_COLLECTION_ID,
            membership.$id
          );
        }
      }
    } catch (error) {
      console.log('No existing membership found or error checking:', error);
    }
    
    // Create new unlimited membership for demo account
    const currentYear = new Date().getFullYear();
    const expiresAt = new Date();
    expiresAt.setFullYear(currentYear + 10); // Valid for 10 years
    
    const demoMembership = await adminDatabases.createDocument(
      DB_ID,
      MEMBERSHIPS_COLLECTION_ID,
      ID.unique(),
      {
        appwriteUserId: demoUserId,
        plan: 'DEMO',
        wineLimit: -1, // Unlimited
        currentWineCount: 0,
        expiresAt: expiresAt.toISOString(),
        isActive: true,
        resetYear: currentYear
      }
    );
    
    return NextResponse.json({
      message: 'Demo účet byl úspěšně nastaven',
      demoAccount: {
        email: DEMO_ACCOUNT.email,
        password: DEMO_ACCOUNT.password,
        name: DEMO_ACCOUNT.name,
        userId: demoUserId,
        membership: demoMembership
      }
    });
    
  } catch (error) {
    console.error('Error setting up demo account:', error);
    return NextResponse.json(
      { message: 'Chyba při nastavování demo účtu' },
      { status: 500 }
    );
  }
}