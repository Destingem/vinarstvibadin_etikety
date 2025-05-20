import { Client, Storage, ID } from 'appwrite';

// Initialize client-side Appwrite client (browser-safe)
const clientSideClient = new Client()
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set endpoint explicitly for client side
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  clientSideClient.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
}

// Export client-side storage service
export const clientStorage = new Storage(clientSideClient);

// Initialize server-side admin client with API key for privileged operations
const serverSideClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set API key for admin operations
if (process.env.APPWRITE_KEY) {
  // Use type assertion to avoid TypeScript errors
  const client = serverSideClient as any;
  
  // Check if setApiKey exists on the client
  if (typeof client.setApiKey === 'function') {
    client.setApiKey(process.env.APPWRITE_KEY);
  } else {
    console.warn('Appwrite SDK method setApiKey not available - API key not set');
    console.warn('This may cause some server-side operations to fail');
  }
}

// Export server-side storage service
export const serverStorage = new Storage(serverSideClient);

// Storage constants
export const LOGOS_BUCKET_ID = 'logos';

// Helper types
export interface UploadResult {
  fileId: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
}

/**
 * Determines if code is running on the server or client
 */
export const isServer = () => typeof window === 'undefined';

/**
 * Get the appropriate storage instance based on environment
 */
export const getStorage = () => {
  return isServer() ? serverStorage : clientStorage;
};

/**
 * Upload a file to the logos bucket
 * @param file - The file to upload
 * @param fileId - Optional file ID, if not provided a unique ID will be generated
 * @returns The uploaded file information
 */
export async function uploadLogo(file: File, fileId?: string): Promise<UploadResult> {
  try {
    // Use server storage if available, otherwise use client storage
    const storage = getStorage();
    
    // Create a unique ID if not provided
    const uniqueFileId = fileId || ID.unique();
    
    // Upload the file
    const result = await storage.createFile(
      LOGOS_BUCKET_ID,
      uniqueFileId,
      file
    );
    
    // Get the file preview URL
    const url = getFilePreview(result.$id);
    
    return {
      fileId: result.$id,
      name: result.name,
      mimeType: result.$permissions.join(', '),
      size: result.sizeOriginal,
      url
    };
  } catch (error) {
    console.error('Error uploading logo:', error);
    throw new Error(`Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a file preview URL
 * @param fileId - The ID of the file
 * @returns The file preview URL
 */
export function getFilePreview(fileId: string): string {
  try {
    const storage = getStorage();
    
    return storage.getFilePreview(
      LOGOS_BUCKET_ID,
      fileId,
      2000, // width
      2000, // height
      'center', // gravity
      100 // quality
    ).toString();
  } catch (error) {
    console.error('Error getting file preview:', error);
    throw new Error(`Failed to get file preview: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a file download URL
 * @param fileId - The ID of the file
 * @returns The file download URL
 */
export function getFileDownloadURL(fileId: string): string {
  try {
    const storage = getStorage();
    
    return storage.getFileDownload(
      LOGOS_BUCKET_ID,
      fileId
    ).toString();
  } catch (error) {
    console.error('Error getting file download URL:', error);
    throw new Error(`Failed to get file download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from storage
 * @param fileId - The ID of the file to delete
 * @returns True if deletion was successful
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Use server-side storage for deletion to ensure proper permissions
    const storage = isServer() ? serverStorage : clientStorage;
    
    await storage.deleteFile(
      LOGOS_BUCKET_ID,
      fileId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List all files in the logos bucket
 * @returns Array of file objects
 */
export async function listLogoFiles() {
  try {
    const storage = getStorage();
    
    const result = await storage.listFiles(LOGOS_BUCKET_ID);
    return result.files;
  } catch (error) {
    console.error('Error listing logo files:', error);
    throw new Error(`Failed to list logo files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Export helper functions
export { ID };