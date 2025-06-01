import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, ApiScope, hasScope } from './api-service';
import { getServerUser, getUserById } from './auth-server';
import { adminDatabases, API_DB_ID, ID } from './appwrite-client';
import { checkRateLimit, getUserMembershipTier } from './rate-limiter';
import { CommonErrors, generateRequestId } from './api-errors';

export type ApiContext = {
  userId: string;
  keyId: string;
  requestId: string;
  scopes: ApiScope[];
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
};

// Collection for API usage analytics
export const API_USAGE_COLLECTION_ID = 'api_usage';

// Track API usage
async function trackApiUsage(
  userId: string,
  keyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTime: number
) {
  try {
    await adminDatabases.createDocument(
      API_DB_ID,
      API_USAGE_COLLECTION_ID,
      ID.unique(),
      {
        userId,
        keyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0], // For daily aggregation
        hour: new Date().getHours() // For hourly aggregation
      }
    );
  } catch (error) {
    console.error('Error tracking API usage:', error);
    // Don't fail the request if analytics tracking fails
  }
}

// Middleware for API routes that require authentication via API key
export async function withApiAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = generateRequestId();
  let userId = '';
  let keyId = '';
  
  try {
    // Get the API key from the header or URL parameter
    let apiKey = req.headers.get('X-API-Key');
    
    // If no header, check URL parameter
    if (!apiKey) {
      const url = new URL(req.url);
      apiKey = url.searchParams.get('key');
    }
    
    if (!apiKey) {
      const response = CommonErrors.missingApiKey();
      
      // Track failed request
      if (userId && keyId) {
        const responseTime = Date.now() - startTime;
        await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, 401, responseTime);
      }
      
      return response;
    }
    
    // Validate the API key
    const { valid, userId: validUserId, keyId: validKeyId, scopes } = await validateApiKey(apiKey);
    userId = validUserId || '';
    keyId = validKeyId || '';
    
    if (!valid || !userId || !keyId) {
      const response = CommonErrors.invalidApiKey();
      
      // Track failed request
      const responseTime = Date.now() - startTime;
      await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, 401, responseTime);
      
      return response;
    }
    
    // Get user information
    const user = await getUserById(userId);
    
    if (!user) {
      const response = CommonErrors.userNotFound();
      
      // Track failed request
      const responseTime = Date.now() - startTime;
      await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, 401, responseTime);
      
      return response;
    }

    // Check rate limiting
    const membershipTier = await getUserMembershipTier(userId);
    const rateLimitResult = await checkRateLimit(keyId, userId, membershipTier);
    
    if (!rateLimitResult.allowed) {
      const response = CommonErrors.rateLimitExceeded(
        rateLimitResult.retryAfter || 60,
        rateLimitResult.resetTime
      );
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', membershipTier === 'premium' ? '300' : '60');
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.getTime().toString());
      response.headers.set('Retry-After', rateLimitResult.retryAfter?.toString() || '60');
      
      // Track rate limited request
      const responseTime = Date.now() - startTime;
      await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, 429, responseTime);
      
      return response;
    }
    
    // Create context with user info
    const context: ApiContext = {
      userId,
      keyId,
      requestId,
      scopes,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email
      }
    };
    
    // Call the handler with the request and context
    const response = await handler(req, context);
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', membershipTier === 'premium' ? '300' : '60');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.getTime().toString());
    
    // Track successful request
    const responseTime = Date.now() - startTime;
    await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, response.status, responseTime);
    
    return response;
  } catch (error) {
    console.error('API authentication error:', error);
    
    const response = CommonErrors.internalServerError({
      message: 'Chyba při ověřování API klíče',
      requestId
    });
    
    // Track error request
    if (userId && keyId) {
      const responseTime = Date.now() - startTime;
      await trackApiUsage(userId, keyId, req.nextUrl.pathname, req.method, 500, responseTime);
    }
    
    return response;
  }
}

// Helper function to check scopes before executing handler
export function withScope(requiredScope: ApiScope) {
  return function(
    handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>
  ) {
    return async function(req: NextRequest, ctx: ApiContext): Promise<NextResponse> {
      if (!hasScope(ctx.scopes, requiredScope)) {
        return CommonErrors.accessDenied(`požadováno oprávnění: ${requiredScope}`);
      }
      
      return handler(req, ctx);
    };
  };
}

// Middleware for routes that accept either JWT token or API key
export async function withAnyAuth(
  req: NextRequest,
  handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try API key first from header or URL parameter
    let apiKey = req.headers.get('X-API-Key');
    
    // If no header, check URL parameter
    if (!apiKey) {
      const url = new URL(req.url);
      apiKey = url.searchParams.get('key');
    }
    
    if (apiKey) {
      // Validate the API key
      const { valid, userId, keyId, scopes } = await validateApiKey(apiKey);
      
      if (valid && userId && keyId) {
        // Get user information
        const user = await getUserById(userId);
        
        if (user) {
          // Create context with user info
          const context: ApiContext = {
            userId,
            keyId,
            requestId: generateRequestId(),
            scopes: scopes || [ApiScope.ALL],
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
            requestId: generateRequestId(),
            scopes: [ApiScope.ALL], // JWT auth gets all scopes
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