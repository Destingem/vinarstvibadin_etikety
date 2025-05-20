import { promises as fs } from 'fs';
import path from 'path';
import { serverStorage, LOGOS_BUCKET_ID } from './appwrite-storage';

/**
 * Downloads a logo from Appwrite Storage and saves it to the public directory
 * 
 * @param fileId - The ID of the file in Appwrite Storage
 * @returns The public URL path to the saved image
 */
export async function downloadAndSaveLogo(fileId: string): Promise<string> {
  try {
    if (!fileId) {
      throw new Error('File ID is required');
    }

    console.log(`Downloading logo with file ID: ${fileId}`);
    
    // Get file details to determine file extension
    const fileDetails = await serverStorage.getFile(LOGOS_BUCKET_ID, fileId);
    
    // Extract file extension from mime type
    const mimeType = fileDetails.mimeType;
    let fileExtension = 'png'; // Default extension
    
    if (mimeType) {
      const mimeTypeParts = mimeType.split('/');
      if (mimeTypeParts.length > 1) {
        fileExtension = mimeTypeParts[1];
        // Handle special cases
        if (fileExtension === 'jpeg') fileExtension = 'jpg';
        if (fileExtension.includes('+')) fileExtension = fileExtension.split('+')[0];
      }
    }
    
    // Create logos directory if it doesn't exist
    const logosDir = path.join(process.cwd(), 'public', 'logos');
    try {
      await fs.mkdir(logosDir, { recursive: true });
    } catch (error) {
      console.error('Error creating logos directory:', error);
      throw new Error(`Failed to create logos directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Download file from Appwrite
    const fileBuffer = await serverStorage.getFileDownload(LOGOS_BUCKET_ID, fileId);
    
    // Save file to public/logos directory
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = path.join(logosDir, fileName);
    
    await fs.writeFile(filePath, Buffer.from(await fileBuffer.arrayBuffer()));
    
    console.log(`Logo saved to: ${filePath}`);
    
    // Return the public URL path
    return `/logos/${fileName}`;
  } catch (error) {
    console.error('Error downloading and saving logo:', error);
    throw new Error(`Failed to download and save logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}