import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite-client';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  userId: z.string().min(1, { message: 'User ID je povinné' }),
  secret: z.string().min(1, { message: 'Secret je povinné' }),
  password: z.string().min(6, { message: 'Heslo musí mít alespoň 6 znaků' }),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Hesla se neshodují",
  path: ["passwordConfirm"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = resetPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatné údaje', errors: result.error.format() },
        { status: 400 }
      );
    }

    const { userId, secret, password } = result.data;

    try {
      // Use Appwrite's built-in password recovery completion
      await account.updateRecovery(userId, secret, password, password);

      return NextResponse.json({
        message: 'Heslo bylo úspěšně změněno. Nyní se můžete přihlásit s novým heslem.',
        success: true
      });

    } catch (appwriteError: any) {
      console.error('Appwrite password reset error:', appwriteError);
      
      // Handle specific Appwrite errors
      if (appwriteError.code === 401) {
        return NextResponse.json(
          { message: 'Neplatný nebo vypršelý token pro obnovení hesla' },
          { status: 401 }
        );
      }
      
      if (appwriteError.code === 404) {
        return NextResponse.json(
          { message: 'Uživatel nebyl nalezen' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Nastala chyba při změně hesla' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při zpracování požadavku' },
      { status: 500 }
    );
  }
}