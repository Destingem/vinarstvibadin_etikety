import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { loginUser, createSlug, createJwtToken } from '@/lib/auth-server';
import { Client, Account } from 'appwrite';

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
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vinarstviqr');
      
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
      
      // Step 2: Get the user ID from the session
      let userId;
      if (session.userId) {
        userId = session.userId;
      } else if (session.$id) {
        userId = session.$id;
      } else if (session.user && session.user.$id) {
        userId = session.user.$id;
      } else {
        console.log("Session structure:", JSON.stringify(session));
        throw new Error("Could not extract user ID from session");
      }
      console.log("Extracted user ID:", userId);
      
      // We're still getting "missing scope" when trying to get user data via Account
      // Let's create a fake user object with minimal data
      // Appwrite will have set the session cookie, so the user will be authenticated
      console.log("Skipping user data fetch due to permission issues");
      
      // Try to get the real user data from Appwrite
      let userData;
      try {
        // Get user using the admin client with API key for full access
        const userResponse = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${userId}`, {
          headers: {
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
            'X-Appwrite-Key': process.env.APPWRITE_KEY || ''
          }
        });
        
        if (userResponse.ok) {
          userData = await userResponse.json();
          console.log("Successfully fetched user data from Appwrite API");
        } else {
          console.error("Failed to fetch user data from Appwrite API:", await userResponse.text());
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError);
      }
      
      // Use the fetched data or fallback to basic info
      const user = userData || {
        $id: userId,
        name: email.split('@')[0], // Fallback to email username if API call failed
        email: email,
        prefs: {} // Empty prefs
      };
      
      // Step 4: Create a JWT token for our application's use
      const token = createJwtToken(userId);
      
      console.log("Login successful for user:", userId);
      
      // Generate a slug from the company name
      // Type assertion to avoid TypeScript errors
      const prefs = user.prefs as { slug?: string } || {};
      // Create slug from user's full name (company name), not from email
      const slug = prefs.slug || createSlug(user.name);
      
      // Return success response with token and user data
      return NextResponse.json({
        message: 'Přihlášení úspěšné',
        user: {
          id: user.$id,
          name: user.name,
          email: user.email,
          slug: slug
        },
        token: token,
        sessionId: session.$id
      });
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