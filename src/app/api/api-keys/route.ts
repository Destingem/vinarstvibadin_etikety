import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { createApiKey, getApiKeysByUserId } from '@/lib/api-service';
import { z } from 'zod';

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().min(1, { message: 'Název klíče je povinný' }).max(100),
  expiresAt: z.string().optional().nullable()
});

// GET /api/api-keys - Get all API keys for the authenticated user
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
    
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get all API keys for the user
    const apiKeys = await getApiKeysByUserId(userId);
    
    return NextResponse.json({ apiKeys });
  } catch (error) {
    console.error('Error getting API keys:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při načítání API klíčů' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create a new API key
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
    
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Parse and validate request body
    const body = await request.json();
    const result = createApiKeySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    // Create a new API key
    const apiKey = await createApiKey(
      userId,
      result.data.name,
      result.data.expiresAt || null
    );
    
    return NextResponse.json(
      { message: 'API klíč byl úspěšně vytvořen', apiKey },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při vytváření API klíče' },
      { status: 500 }
    );
  }
}