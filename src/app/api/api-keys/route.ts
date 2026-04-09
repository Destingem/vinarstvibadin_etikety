import { NextRequest, NextResponse } from 'next/server';
import { ApiScope, createApiKey, DEFAULT_API_KEY_SCOPES, getApiKeysByUserId } from '@/lib/api-service';
import { z } from 'zod';
import { getRequestSessionUser } from '@/server/auth/session';

// Schema for creating a new API key
const createApiKeySchema = z.object({
  name: z.string().min(1, { message: 'Název klíče je povinný' }).max(100),
  expiresAt: z.string().optional().nullable(),
  scopes: z.array(z.nativeEnum(ApiScope)).min(1).optional(),
});

// GET /api/api-keys - Get all API keys for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }

    const userId = sessionUser.id;
    
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
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }

    const userId = sessionUser.id;
    
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
      result.data.expiresAt || null,
      result.data.scopes?.length ? result.data.scopes : DEFAULT_API_KEY_SCOPES
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
