import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-middleware';
import { Query, adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { Wine } from '@/lib/appwrite';

// GET /api/v1/wines - Get all wines for the authenticated user
export async function GET(request: NextRequest) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const search = searchParams.get('search') || '';
      
      // Calculate pagination
      const offset = (page - 1) * limit;
      
      // Set up queries for Appwrite
      const queries = [
        Query.equal('userId', ctx.userId),
        Query.limit(limit),
        Query.offset(offset),
      ];
      
      // Add search query if provided
      if (search) {
        queries.push(Query.search('name', search));
      }
      
      // Get wines with pagination from Appwrite
      const response = await adminDatabases.listDocuments(
        DB_ID,
        WINES_COLLECTION_ID,
        queries
      );
      
      // Convert documents to Wine type
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
    } catch (error) {
      console.error('Error fetching wines:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při načítání vín' },
        { status: 500 }
      );
    }
  });
}

// POST /api/v1/wines - Create a new wine
export async function POST(request: NextRequest) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      // Get request body
      const body = await req.json();
      
      // Basic validation (would be more robust in production)
      if (!body.name) {
        return NextResponse.json(
          { error: 'Neplatné údaje', message: 'Název vína je povinný' },
          { status: 400 }
        );
      }
      
      // Create the wine data
      const wineData = {
        ...body,
        userId: ctx.userId,
        wineryName: ctx.user?.name || '',
        winerySlug: ctx.user?.name?.toLowerCase().replace(/\s+/g, '-') || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Create the wine in the database
      const wine = await adminDatabases.createDocument(
        DB_ID,
        WINES_COLLECTION_ID,
        'unique()',
        wineData
      );
      
      return NextResponse.json(
        { message: 'Víno bylo úspěšně vytvořeno', wine },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating wine:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při vytváření vína' },
        { status: 500 }
      );
    }
  });
}