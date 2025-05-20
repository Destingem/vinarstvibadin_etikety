import { NextRequest, NextResponse } from 'next/server';
import { serverStorage, LOGOS_BUCKET_ID } from '@/lib/appwrite-storage';

/**
 * Proxy to fetch logo files from Appwrite Storage
 * This route bypasses CORS issues by having the server fetch the logo
 */
export async function GET(request: NextRequest) {
  // Extract fileId from query parameters
  const url = new URL(request.url);
  const fileId = url.searchParams.get('fileId');

  // Log the request
  console.log(`[logo-proxy] Received request for fileId: ${fileId}`);

  // Validate fileId parameter
  if (!fileId) {
    console.error('[logo-proxy] Missing fileId parameter');
    return NextResponse.json(
      { error: 'Missing fileId parameter' },
      { status: 400 }
    );
  }

  try {
    // Fetch the file from Appwrite
    console.log(`[logo-proxy] Fetching file ${fileId} from Appwrite Storage`);
    const fileBuffer = await serverStorage.getFileDownload(LOGOS_BUCKET_ID, fileId);

    // Get file details to determine Content-Type
    const fileDetails = await serverStorage.getFile(LOGOS_BUCKET_ID, fileId);
    const contentType = fileDetails.mimeType || 'application/octet-stream';
    
    console.log(`[logo-proxy] File fetched successfully. MIME type: ${contentType}`);

    // Create response with appropriate headers
    const response = new NextResponse(fileBuffer);

    // Set content headers
    response.headers.set('Content-Type', contentType);
    
    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Set cache control (optional)
    response.headers.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    return response;
  } catch (error) {
    // Check for specific error types
    if (error instanceof Error && error.message.includes('File not found')) {
      console.error(`[logo-proxy] File not found: ${fileId}`, error);
      return NextResponse.json(
        { error: `File not found: ${fileId}` },
        { status: 404 }
      );
    }

    // Handle other errors
    console.error(`[logo-proxy] Error fetching file: ${fileId}`, error);
    return NextResponse.json(
      { 
        error: 'Error fetching file',
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  console.log('[logo-proxy] Handling OPTIONS request (CORS preflight)');
  
  const response = new NextResponse(null, { status: 204 }); // No content
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Access-Control-Max-Age', '86400'); // Cache preflight for 24 hours
  
  return response;
}