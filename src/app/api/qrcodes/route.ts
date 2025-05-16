import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken } from '@/lib/auth-server';
import { generateQRCode, createWineQRCodeUrl } from '@/lib/qr-code';
import { getWineById } from '@/lib/appwrite-client';

export async function GET(request: NextRequest) {
  
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get('wineId');
    
    if (!wineId) {
      return NextResponse.json(
        { message: 'Chybí ID vína' },
        { status: 400 }
      );
    }
    
    // Find wine by ID using Appwrite
    try {
      const wine = await getWineById(wineId);
      
      if (!wine) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      // Check if wine belongs to current user
      if (wine.userId !== userId) {
        return NextResponse.json(
          { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
          { status: 403 }
        );
      }
      
      // Generate QR code URL - use winerySlug directly from the wine object
      const qrCodeUrl = createWineQRCodeUrl(wine.winerySlug || 'unknown', wine.$id);
      
      // Generate QR code
      const qrCodeDataUrl = await generateQRCode(qrCodeUrl);
      
      return NextResponse.json({
        qrCode: qrCodeDataUrl,
        url: qrCodeUrl,
        wine: {
          id: wine.$id,
          name: wine.name,
          vintage: wine.vintage,
          batch: wine.batch,
        },
      });
    } catch (error: any) {
      console.error('Error fetching wine or generating QR code:', error);
      
      // Check for 404 error from Appwrite
      if (error.code === 404) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při generování QR kódu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při generování QR kódu' },
      { status: 500 }
    );
  }
}