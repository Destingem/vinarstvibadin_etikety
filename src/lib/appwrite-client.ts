import { Account, Databases, ID, Query, Permission, Role } from "appwrite";
import { createAdminAppwriteClient, createPublicAppwriteClient } from '@/lib/appwrite-env';

// Initialize Appwrite client (browser-safe)
const client = createPublicAppwriteClient();

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

const adminClient = typeof window === 'undefined'
  ? createAdminAppwriteClient()
  : null;

// Export admin services
export const adminDatabases = adminClient
  ? new Databases(adminClient)
  : (null as unknown as Databases);

// Export helper functions
export { ID, Query, Permission, Role };

// Appwrite constants
export const DB_ID = 'wine_db';
export const ANALYTICS_DB_ID = 'analytics';
export const API_DB_ID = 'api';
export const WINES_COLLECTION_ID = '6827655800216265c9fc';
export const MEMBERSHIPS_COLLECTION_ID = 'memberships';

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

export async function createWine(wineData: any, userId: string) {
  try {
    const now = new Date().toISOString();
    // Create wine with proper document permissions
    return await adminDatabases.createDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      ID.unique(),
      {
        ...wineData,
        userId, // Ensure userId is set
        createdAt: now,
        updatedAt: now
      }
      // Document permissions removed for Appwrite v1.7.4 compatibility
    );
  } catch (error) {
    console.error('Error creating wine:', error);
    throw error;
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
