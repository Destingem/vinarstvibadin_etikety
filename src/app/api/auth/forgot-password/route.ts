import { NextRequest, NextResponse } from 'next/server';
import { account } from '@/lib/appwrite-client';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Neplatný email' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: 'Neplatný email', errors: result.error.format() },
        { status: 400 }
      );
    }

    const { email } = result.data;

    try {
      // Use Appwrite's built-in password recovery
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`;
      
      await account.createRecovery(email, resetUrl);

      return NextResponse.json({
        message: 'E-mail pro obnovení hesla byl odeslán. Zkontrolujte svou e-mailovou schránku.',
        success: true
      });

    } catch (appwriteError: any) {
      console.error('Appwrite password recovery error:', appwriteError);
      
      // Handle specific Appwrite errors
      if (appwriteError.code === 404) {
        return NextResponse.json(
          { message: 'Uživatel s tímto e-mailem nebyl nalezen' },
          { status: 404 }
        );
      }
      
      if (appwriteError.code === 429) {
        return NextResponse.json(
          { message: 'Příliš mnoho pokusů. Zkuste to znovu později.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { message: 'Nastala chyba při odesílání e-mailu pro obnovení hesla' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při zpracování požadavku' },
      { status: 500 }
    );
  }
}