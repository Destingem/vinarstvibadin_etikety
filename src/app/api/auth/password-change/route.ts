import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserById } from '@/lib/auth-server';
import { getAppwriteAdminHeaders, getAppwriteUrl, getServerAppwriteEnv } from '@/lib/appwrite-env';
import { getRequestSessionUser } from '@/server/auth/session';

// Schema for password change validation
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Současné heslo je povinné' }),
  newPassword: z.string().min(6, { message: 'Nové heslo musí mít alespoň 6 znaků' }),
});

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
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
    
    const user = await getUserById(sessionUser.id);

    try {
      const serverEnv = getServerAppwriteEnv();

      const sessionResponse = await fetch(getAppwriteUrl('/account/sessions/email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': serverEnv.projectId,
        },
        body: JSON.stringify({
          email: user.email,
          password: currentPassword,
        }),
      });

      if (!sessionResponse.ok) {
        return NextResponse.json(
          { message: 'Současné heslo není správné' },
          { status: 401 }
        );
      }

      const updateResponse = await fetch(getAppwriteUrl(`/users/${user.$id}/password`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAppwriteAdminHeaders(),
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(`Error updating password: ${updateResponse.status}`, errorText);
        throw new Error('Změna hesla selhala.');
      }

      return NextResponse.json({ message: 'Heslo bylo úspěšně změněno' });
    } catch (authError) {
      console.error('Auth error:', authError);
      throw new Error('Ověření současného hesla selhalo');
    }
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { message: 'Změna hesla selhala' },
      { status: 500 }
    );
  }
}
