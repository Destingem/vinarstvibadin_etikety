import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-middleware';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
import { generateQRCodeSVG } from '@/lib/qr-code';

// GET /api/v1/qrcodes/wine/[wineId] - Generate QR code for a specific wine
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wineId: string }> }
) {
  return withApiAuth(request, async (req, ctx) => {
    try {
      const { wineId } = await params;
      
      // Get the wine from the database to check ownership
      try {
        const wine = await adminDatabases.getDocument(
          DB_ID,
          WINES_COLLECTION_ID,
          wineId
        );
        
        // Check if the wine belongs to the authenticated user
        if (wine.userId !== ctx.userId) {
          return NextResponse.json(
            { error: 'Přístup odepřen', message: 'Nemáte oprávnění generovat QR kód pro toto víno' },
            { status: 403 }
          );
        }
        
        // Get format from query params (svg, png, base64)
        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'svg';
        const size = parseInt(searchParams.get('size') || '300');
        
        // Generate the URL for the QR code
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://etiketa.wine';
        const qrUrl = `${baseUrl}/${wine.winerySlug}/${wine.$id}`;
        
        // Generate QR code SVG
        const qrSvg = await generateQRCodeSVG(qrUrl, {
          size,
          color: '#000000',
          backgroundColor: '#ffffff',
          // Add more options as needed
        });
        
        // Return appropriate response based on format
        if (format === 'svg') {
          return new NextResponse(qrSvg, {
            headers: {
              'Content-Type': 'image/svg+xml',
              'Content-Disposition': `attachment; filename="qrcode-${wine.$id}.svg"`,
            },
          });
        } else if (format === 'json') {
          return NextResponse.json({
            qrcode: qrSvg,
            url: qrUrl,
            wine: {
              id: wine.$id,
              name: wine.name,
              vintage: wine.vintage,
              batch: wine.batch,
            },
          });
        } else {
          return NextResponse.json(
            { error: 'Neplatný formát', message: 'Podporované formáty jsou: svg, json' },
            { status: 400 }
          );
        }
      } catch (error) {
        // Check if the wine doesn't exist
        if ((error as any).code === 404) {
          return NextResponse.json(
            { error: 'Víno nenalezeno', message: 'Požadované víno nebylo nalezeno' },
            { status: 404 }
          );
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      return NextResponse.json(
        { error: 'Interní chyba serveru', message: 'Nastala chyba při generování QR kódu' },
        { status: 500 }
      );
    }
  });
}