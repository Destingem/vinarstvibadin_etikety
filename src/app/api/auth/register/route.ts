import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSlug, createUser } from '@/lib/auth-server';
import {
  assertWineryProfileSlugAvailable,
  getWineryProfile,
  serializeWineryProfileForAuth,
  WineryProfileSlugConflictError,
} from '@/server/services/winery-profiles';

// Schema for registration validation
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Název musí mít alespoň 2 znaky' }),
  email: z.string().email({ message: 'Email není ve správném formátu' }),
  password: z.string().min(8, { message: 'Heslo musí mít alespoň 8 znaků' }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate request data
    const result = registerSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, email, password } = result.data;
    
    // Generate slug from winery name
    const slug = createSlug(name);

    try {
      await assertWineryProfileSlugAvailable(slug);
    } catch (slugError) {
      if (slugError instanceof WineryProfileSlugConflictError) {
        return NextResponse.json(
          { message: 'Slug vinařství je již obsazený' },
          { status: 409 }
        );
      }

      throw slugError;
    }
    
    try {
      // Create user with Appwrite Auth (preferences now set in createUser)
      const user = await createUser(email, password, name);
      const profile = await getWineryProfile(user.$id);
      
      return NextResponse.json(
        { 
          message: 'Registrace úspěšná', 
          userId: user.$id,
          name: name,
          email: user.email,
          slug: profile?.slug || slug,
          user: profile ? serializeWineryProfileForAuth(profile) : null,
          profile,
        },
        { status: 201 }
      );
    } catch (authError: any) {
      // Check for specific error codes
      if (authError.code === 409) {
        return NextResponse.json(
          { message: 'Email již existuje' },
          { status: 409 }
        );
      }
      
      console.error('Appwrite auth error:', authError);
      return NextResponse.json(
        { message: 'Nastala chyba při registraci uživatele' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při registraci' },
      { status: 500 }
    );
  }
}
