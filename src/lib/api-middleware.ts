import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from './api-service';
import { getServerUser, getUserById } from './auth-server';

export type ApiContext = {
  userId: string;
  keyId: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// Middleware for API routes that require authentication via API key
export async function withApiAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get the API key from the header
    const apiKey = req.headers.get('X-API-Key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chybí API klíč', message: 'Přístup k API vyžaduje platný API klíč v hlavičce X-API-Key' },
        { status: 401 }
      );
    }
    
    // Validate the API key
    const { valid, userId, keyId } = await validateApiKey(apiKey);
    
    if (!valid || !userId || !keyId) {
      return NextResponse.json(
        { error: 'Neplatný API klíč', message: 'Poskytnutý API klíč je neplatný nebo byl zrušen' },
        { status: 401 }
      );
    }
    
    // Get user information
    const user = await getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Uživatel nenalezen', message: 'Uživatel spojený s tímto API klíčem nebyl nalezen' },
        { status: 401 }
      );
    }
    
    // Create context with user info
    const context: ApiContext = {
      userId,
      keyId,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email
      }
    };
    
    // Call the handler with the request and context
    return handler(req, context);
  } catch (error) {
    console.error('API authentication error:', error);
    
    return NextResponse.json(
      { error: 'Chyba autentizace', message: 'Nastala chyba při ověřování API klíče' },
      { status: 500 }
    );
  }
}

// Middleware for routes that accept either JWT token or API key
export async function withAnyAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try API key first
    const apiKey = req.headers.get('X-API-Key');
    
    if (apiKey) {
      // Validate the API key
      const { valid, userId, keyId } = await validateApiKey(apiKey);
      
      if (valid && userId && keyId) {
        // Get user information
        const user = await getUserById(userId);
        
        if (user) {
          // Create context with user info
          const context: ApiContext = {
            userId,
            keyId,
            user: {
              id: user.$id,
              name: user.name,
              email: user.email
            }
          };
          
          // Call the handler with the request and context
          return handler(req, context);
        }
      }
    }
    
    // If API key fails or is not present, try JWT token
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (token) {
      try {
        // Try to get server user from JWT token
        const serverUser = await getServerUser();
        
        if (serverUser) {
          // Create context with user info from JWT
          const context: ApiContext = {
            userId: serverUser.id,
            keyId: '', // No key ID for JWT auth
            user: {
              id: serverUser.id,
              name: serverUser.name,
              email: serverUser.email
            }
          };
          
          // Call the handler with the request and context
          return handler(req, context);
        }
      } catch (tokenError) {
        console.error('JWT validation error:', tokenError);
      }
    }
    
    // If both auth methods fail
    return NextResponse.json(
      { error: 'Neautorizováno', message: 'Požadavek vyžaduje platný API klíč nebo přihlášení' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Authentication error:', error);
    
    return NextResponse.json(
      { error: 'Chyba autentizace', message: 'Nastala chyba při ověřování přístupu' },
      { status: 500 }
    );
  }
}