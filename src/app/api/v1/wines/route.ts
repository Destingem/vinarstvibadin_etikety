import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, withScope } from '@/lib/api-middleware';
import { Query, adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { Wine } from '@/lib/appwrite';
import { CommonErrors, createSuccessResponse, ValidationErrorBuilder } from '@/lib/api-errors';
import { ApiScope } from '@/lib/api-service';

// GET /api/v1/wines - Get all wines for the authenticated user
export async function GET(request: NextRequest) {
  return withApiAuth(request, withScope(ApiScope.WINES_READ)(async (req, ctx) => {
    try {
      // Get query parameters
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100); // Max 100 per page
      const search = searchParams.get('search') || '';
      
      // Validate query parameters
      const validator = new ValidationErrorBuilder();
      
      if (page < 1) {
        validator.addError('page', 'Stránka musí být číslo větší než 0');
      }
      
      if (limit < 1 || limit > 100) {
        validator.addError('limit', 'Limit musí být mezi 1 a 100');
      }
      
      if (validator.hasErrors()) {
        return validator.build();
      }
      
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
      
      return createSuccessResponse(
        wines,
        200,
        {
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
          },
          requestId: ctx.requestId
        }
      );
    } catch (error) {
      console.error('Error fetching wines:', error);
      return CommonErrors.internalServerError({
        message: 'Nastala chyba při načítání vín',
        requestId: ctx.requestId
      });
    }
  }));
}

// POST /api/v1/wines - Create a new wine
export async function POST(request: NextRequest) {
  return withApiAuth(request, withScope(ApiScope.WINES_WRITE)(async (req, ctx) => {
    try {
      // Get request body
      const body = await req.json();
      
      // Validate request body
      const validator = new ValidationErrorBuilder();
      
      if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        validator.addError('name', 'Název vína je povinný');
      }
      
      if (body.vintage && (typeof body.vintage !== 'string' || !/^\d{4}$/.test(body.vintage))) {
        validator.addError('vintage', 'Ročník musí být čtyřmístné číslo');
      }
      
      if (body.alcohol && (typeof body.alcohol !== 'number' || body.alcohol < 0 || body.alcohol > 100)) {
        validator.addError('alcohol', 'Obsah alkoholu musí být číslo mezi 0 a 100');
      }
      
      if (validator.hasErrors()) {
        return validator.build();
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
      
      return createSuccessResponse(
        wine,
        201,
        {
          requestId: ctx.requestId
        }
      );
    } catch (error) {
      console.error('Error creating wine:', error);
      return CommonErrors.internalServerError({
        message: 'Nastala chyba při vytváření vína',
        requestId: ctx.requestId
      });
    }
  }));
}