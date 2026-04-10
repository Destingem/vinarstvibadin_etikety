import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createJwtToken } from '@/lib/auth-server';
import { Client, Account } from 'appwrite';
import { applySessionCookie } from '@/server/auth/session';
import { getAppwriteSessionUserId } from '@/server/auth/appwrite-session';
import { ensureDemoCatalog } from '@/server/services/demo-catalog';
import {
  getWineryProfile,
  serializeWineryProfileForAuth,
} from '@/server/services/winery-profiles';
import { getPublicAppwriteEnv } from '@/lib/appwrite-env';

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Email není ve správném formátu' }),
  password: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { email, password } = result.data;
    
    try {
      console.log("Attempting login with email:", email);
      
      // Create a client without API key - this is critical!
      // The API key gives us admin access which conflicts with user authentication
      const publicEnv = getPublicAppwriteEnv();
      const client = new Client()
        .setEndpoint(publicEnv.endpoint)
        .setProject(publicEnv.projectId);
      
      const account = new Account(client);
      
      // Step 1: Create an email session
      let session;
      try {
        console.log("Attempting to create session with methods:", {
          createEmailPasswordSession: typeof (account as any).createEmailPasswordSession === 'function',
          createEmailSession: typeof (account as any).createEmailSession === 'function',
          createSession: typeof (account as any).createSession === 'function'
        });
        
        // Try different methods based on what's available
        // Using type assertions to avoid TypeScript errors
        if (typeof (account as any).createEmailPasswordSession === 'function') {
          session = await (account as any).createEmailPasswordSession(email, password);
          console.log("Created email-password session");
        } else if (typeof (account as any).createEmailSession === 'function') {
          session = await (account as any).createEmailSession(email, password);
          console.log("Created email session");
        } else if (typeof (account as any).createSession === 'function') {
          session = await (account as any).createSession('email', email, password);
          console.log("Created session with email provider");
        } else {
          throw new Error('No compatible login method found');
        }
        
        console.log("Session created successfully. Properties:", Object.keys(session));
      } catch (e) {
        console.error("Session creation failed:", e);
        throw e;
      }
      
      // Step 2: Get the user ID from the session.
      // Do not treat session.$id as a user identifier; that is the session ID.
      const userId = getAppwriteSessionUserId(session);
      console.log("Extracted user ID:", userId);
      
      const profile = await getWineryProfile(userId);

      if (!profile) {
        return NextResponse.json(
          { message: 'Profil vinařství nebyl nalezen' },
          { status: 404 }
        );
      }

      await ensureDemoCatalog(profile);
      
      // Issue the real token only via HttpOnly session cookie.
      const token = createJwtToken(userId, '7d');

      const response = NextResponse.json({
        message: 'Přihlášení úspěšné',
        user: serializeWineryProfileForAuth(profile),
        profile,
        token: 'session',
        sessionId: session.$id
      });
      applySessionCookie(response, token);
      return response;
    } catch (error) {
      console.error('Auth error:', error);
      
      // Type assertion for error handling
      const authError = error as { code?: number; message?: string };
      
      // Better error handling
      if (authError.code === 401) {
        return NextResponse.json(
          { message: 'Nesprávný email nebo heslo' },
          { status: 401 }
        );
      } else if (authError.code === 429) {
        return NextResponse.json(
          { message: 'Příliš mnoho pokusů o přihlášení, zkuste to později' },
          { status: 429 }
        );
      }
      
      // Default error
      return NextResponse.json(
        { message: 'Nastala chyba při přihlášení' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Při přihlášení nastala chyba' },
      { status: 500 }
    );
  }
}
