import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyJwtToken, getUserById } from '@/lib/auth-server';
import { Client } from 'appwrite';

// Schema for password change validation
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Současné heslo je povinné' }),
  newPassword: z.string().min(6, { message: 'Nové heslo musí mít alespoň 6 znaků' }),
});

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
    
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = passwordChangeSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { currentPassword, newPassword } = result.data;
    
    try {
      // Verify JWT token
      const decoded = verifyJwtToken(token);
      
      // Get user by ID
      const user = await getUserById(decoded.userId);
      
      // First verify the current password by creating a session
      // This endpoint doesn't require JWT, just the credentials
      try {
        // We try to create a session to validate the current password
        const sessionResponse = await fetch(`${process.env.APPWRITE_ENDPOINT}/account/sessions/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
          },
          body: JSON.stringify({
            email: user.email,
            password: currentPassword
          }),
        });
        
        if (!sessionResponse.ok) {
          // If we can't create a session, the current password is wrong
          return NextResponse.json(
            { message: 'Současné heslo není správné' },
            { status: 401 }
          );
        }
        
        // Current password is correct, proceed to change password using direct API call
        const updateResponse = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${user.$id}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
            'X-Appwrite-Key': process.env.APPWRITE_KEY || '',
          },
          body: JSON.stringify({ 
            password: newPassword 
          }),
        });
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error(`Error updating password: ${updateResponse.status}`, errorText);
          throw new Error('Změna hesla selhala.');
        }
        
        console.log('Password updated successfully');
        
        // Return success response
        return NextResponse.json({ message: 'Heslo bylo úspěšně změněno' });
        
      } catch (authError) {
        console.error('Auth error:', authError);
        throw new Error('Ověření současného hesla selhalo');
      }
    } catch (tokenError) {
      console.error('Token error:', tokenError);
      return NextResponse.json(
        { message: 'Neplatný token nebo vypršela platnost přihlášení' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: 'Změna hesla selhala' },
      { status: 500 }
    );
  }
}