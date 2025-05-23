import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { deleteApiKey, getApiKeysByUserId } from '@/lib/api-service';

// DELETE /api/api-keys/[id] - Delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: keyId } = await params;
    
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
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