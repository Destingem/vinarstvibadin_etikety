import { NextRequest, NextResponse } from 'next/server';
import { deleteApiKey, getApiKeysByUserId } from '@/lib/api-service';
import { getRequestSessionUser } from '@/server/auth/session';

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: keyId } = await params;

    const sessionUser = await getRequestSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }

    const userId = sessionUser.id;
    
    // Check if the API key belongs to the user
    const userKeys = await getApiKeysByUserId(userId);
    const keyBelongsToUser = userKeys.some(key => key.id === keyId);
    
    if (!keyBelongsToUser) {
      return NextResponse.json(
        { message: 'API klíč nepatří tomuto uživateli nebo neexistuje' },
        { status: 403 }
      );
    }
    
    // Delete the API key
    await deleteApiKey(keyId);
    
    return NextResponse.json(
      { message: 'API klíč byl úspěšně smazán' }
    );
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při mazání API klíče' },
      { status: 500 }
    );
  }
}
