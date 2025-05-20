import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, createSlug } from '@/lib/auth-server';
import { z } from 'zod';
import { createWine, getWinesByUserId, Query, adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { Wine } from '@/lib/appwrite';

// Schema for creating/updating wine 
// This matches exactly the Appwrite collection attributes
const wineSchema = z.object({
  name: z.string().min(1, { message: 'Název vína je povinný' }),
  vintage: z.number().optional().nullable(),
  batch: z.string().optional().nullable(),
  alcoholContent: z.number().optional().nullable(),
  energyValueKJ: z.number().optional().nullable(),
  energyValueKcal: z.number().optional().nullable(), // Now included in Appwrite schema
  fat: z.number().optional().nullable(),
  saturatedFat: z.number().optional().nullable(),
  carbs: z.number().optional().nullable(),
  sugars: z.number().optional().nullable(),
  protein: z.number().optional().nullable(),
  salt: z.number().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  additionalInfo: z.string().optional().nullable(),
  allergens: z.string().optional().nullable(),
  wineRegion: z.string().optional().nullable(),
  wineSubregion: z.string().optional().nullable(),
  wineVillage: z.string().optional().nullable(),
  wineTract: z.string().optional().nullable(),
  // We'll handle these separately
  // createdAt and updatedAt are managed by the createWine function
  // userId, wineryName, and winerySlug are added before sending to the database
});

// Get all wines for the current user
export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Set up queries for Appwrite
    const queries = [
      Query.equal('userId', userId),
      Query.limit(limit),
      Query.offset(offset),
    ];
    
    // Add search query if provided
    if (search) {
      queries.push(Query.search('name', search));
    }
    
    // Get wines with pagination from Appwrite using admin client
    // This ensures we have the necessary permissions
    try {
      const response = await adminDatabases.listDocuments(
        DB_ID,
        WINES_COLLECTION_ID,
        queries
      );
    
    // Convert documents to Wine type using unknown as an intermediate step to satisfy TypeScript
    const wines = response.documents as unknown as Wine[];
    const totalCount = response.total;
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      wines,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
    } catch (dbError: any) {
      console.error('Error querying wines from database:', dbError);
      return NextResponse.json(
        { message: dbError.message || 'Nastala chyba při načítání vín z databáze' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching wines:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání vín' },
      { status: 500 }
    );
  }
}

// Create a new wine
export async function POST(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Try to get user info from token payload or request headers
    let userName = '';
    let userSlug = '';
    
    // Check if we have user data in the token
    try {
      // First try to get from headers (now with decoding because we encode it on the client)
      const userDataHeader = request.headers.get('X-User-Data');
      if (userDataHeader) {
        try {
          // Decode the URL-encoded header
          const decodedHeader = decodeURIComponent(userDataHeader);
          const userData = JSON.parse(decodedHeader);
          userName = userData.name || '';
          userSlug = userData.slug || '';
        } catch (e) {
          console.error('Error parsing user data header:', e);
        }
      }
      
      // If no name from headers, we need to fetch it from the API
      if (!userName && userId) {
        try {
          // Try to get user info from the /api/auth/me endpoint
          const response = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            userName = userData.user?.name || '';
            userSlug = userData.user?.slug || '';
          }
          
          // If we still don't have a name or slug, fall back to default values
          if (!userName) {
            userName = `User ${userId.substring(0, 6)}`;
          }
          
          // Create a fallback slug if needed
          if (!userSlug) {
            // Always create slug from winery name, not from email or ID
            userSlug = userName.toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
          }
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          
          // Use default values if everything fails
          userName = 'Winery';
          userSlug = 'winery-' + userId.substring(0, 6);
        }
      }
    } catch (e) {
      console.error('Error parsing user data from header:', e);
    }
    
    const body = await request.json();
    
    // Validate request data
    const result = wineSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // Make sure userName and userSlug are using the full winery name
    if (!userName || !userSlug) {
      try {
        // Fetch directly from the API
        const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${userId}`, {
          headers: {
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
            'X-Appwrite-Key': process.env.APPWRITE_KEY || ''
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          userName = userData.name;
          userSlug = createSlug(userData.name);
          console.log("Retrieved winery data from API for wine creation:", { name: userName, slug: userSlug });
        }
      } catch (error) {
        console.error("Failed to fetch winery data from API:", error);
      }
    }
    
    // Create new wine in Appwrite
    // Now that energyValueKcal is in the schema, we can include it
    const wineData = {
      ...result.data,
      userId: userId,
      wineryName: userName,
      winerySlug: userSlug,
    };
    
    let newWine;
    try {
      newWine = await createWine(wineData);
    } catch (error: any) {
      console.error('Error creating wine:', error);
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při vytváření vína' },
        { status: 500 }
      );
    }
    
    if (!newWine) {
      return NextResponse.json(
        { message: 'Nastala chyba při vytváření vína' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Víno bylo úspěšně vytvořeno', wine: newWine },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření vína' },
      { status: 500 }
    );
  }
}