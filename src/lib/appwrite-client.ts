import { Client, Account, Databases, ID, Query } from "appwrite";

// Initialize Appwrite client (browser-safe)
// Important: For frontend usage, we use the NEXT_PUBLIC_ prefixed env vars
const client = new Client()
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set endpoint explicitly
if (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
}

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

// Initialize server-side admin client with API key for privileged operations
// This is only used for server-side operations requiring admin access
const adminClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set API key for admin operations
if (process.env.APPWRITE_KEY) {
  try {
    // Different versions of the Appwrite SDK use different methods to set the API key
    // First try the newer method
    if (typeof (adminClient as any).setKey === 'function') {
      (adminClient as any).setKey(process.env.APPWRITE_KEY);
    } 
    // Then try the older method
    else if (typeof (adminClient as any).setApiKey === 'function') {
      (adminClient as any).setApiKey(process.env.APPWRITE_KEY);
    }
    // If none of these methods work, warn the user
    else {
      console.warn('WARNING: Could not set Appwrite API key - no compatible method found');
      console.warn('This will cause issues with analytics and other admin operations');
    }
  } catch (error) {
    console.error('Error setting Appwrite API key:', error);
  }
} else {
  console.warn('WARNING: APPWRITE_KEY environment variable not set');
  console.warn('This will cause issues with analytics and other admin operations');
}

// Export admin services
export const adminDatabases = new Databases(adminClient);

// Export helper functions
export { ID, Query };

// Appwrite constants
export const DB_ID = 'wine_db';
export const ANALYTICS_DB_ID = 'analytics';
export const WINES_COLLECTION_ID = '6827655800216265c9fc';

// Helper functions
export async function getWinesByUserId(userId: string) {
  try {
    // Use adminDatabases to ensure we have permission to read documents
    const response = await adminDatabases.listDocuments(
      DB_ID,
      WINES_COLLECTION_ID,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error getting wines by user ID:', error);
    throw error;
  }
}

export async function getWineById(id: string) {
  try {
    // Use adminDatabases to ensure we have permission to read documents
    const wine = await adminDatabases.getDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id
    );
    return wine;
  } catch (error) {
    console.error('Error getting wine by ID:', error);
    throw error;
  }
}

export async function createWine(wineData: any) {
  try {
    const now = new Date().toISOString();
    // Use adminDatabases to ensure we have permission to create documents
    return await adminDatabases.createDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      ID.unique(),
      {
        ...wineData,
        createdAt: now,
        updatedAt: now
      }
    );
  } catch (error) {
    console.error('Error creating wine:', error);
    throw error; // Throw the error so the caller can handle it appropriately
  }
}

export async function updateWine(id: string, data: any) {
  try {
    // Use adminDatabases to ensure we have permission to update documents
    return await adminDatabases.updateDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error updating wine:', error);
    throw error;
  }
}

export async function deleteWine(id: string) {
  try {
    // Use adminDatabases to ensure we have permission to delete documents
    await adminDatabases.deleteDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id
    );
    return true;
  } catch (error) {
    console.error('Error deleting wine:', error);
    throw error;
  }
}

// Create a slug from text
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}