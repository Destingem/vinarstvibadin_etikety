import { NextRequest, NextResponse } from 'next/server';
import { downloadAndSaveLogo } from '@/lib/logo-downloader';

/**
 * API route to download a logo from Appwrite Storage and save it to the public directory
 * @param request - The Next.js request object
 * @returns A response containing the public URL path to the saved image
 */
export async function GET(request: NextRequest) {
  try {
    // Extract fileId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const fileId = searchParams.get('fileId');
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }
    
    // Download and save the logo
    const publicPath = await downloadAndSaveLogo(fileId);
    
    // Return the public URL path
    return NextResponse.json({ url: publicPath });
  } catch (error) {
    console.error('Error in logo download API route:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}