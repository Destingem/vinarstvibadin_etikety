import { ID, Query } from 'appwrite';
import { adminDatabases, DB_ID } from '@/lib/appwrite-client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

// Define API key collection ID
export const API_KEYS_COLLECTION_ID = 'api_keys';

// Interface for API key
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  keyHash: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

// Function to create a new API key
export async function createApiKey(userId: string, name: string, expiresAt: string | null = null): Promise<ApiKey> {
  try {
    // Generate a new API key
    const key = `etw_${crypto.randomBytes(32).toString('hex')}`;
    
    // Hash the key for storage (we'll store both for this example, but in production only store the hash)
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    // Create a new API key document
    const apiKey = {
      userId,
      name,
      key, // In a production environment, consider not storing the plain key
      keyHash,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt
    };
    
    // Save to database
    const result = await adminDatabases.createDocument(
      DB_ID,
      API_KEYS_COLLECTION_ID,
      ID.unique(),
      apiKey
    );
    
    return result as unknown as ApiKey;
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

// Function to get all API keys for a user
export async function getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
  try {
    const response = await adminDatabases.listDocuments(
      DB_ID,
      API_KEYS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt')
      ]
    );
    
    return response.documents as unknown as ApiKey[];
  } catch (error) {
    console.error('Error getting API keys:', error);
    throw error;
  }
}

// Function to delete an API key
export async function deleteApiKey(keyId: string): Promise<boolean> {
  try {
    await adminDatabases.deleteDocument(
      DB_ID,
      API_KEYS_COLLECTION_ID,
      keyId
    );
    
    return true;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

// Function to validate an API key
export async function validateApiKey(key: string): Promise<{ valid: boolean; userId: string | null; keyId: string | null }> {
  try {
    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    // Look for a matching key hash
    const response = await adminDatabases.listDocuments(
      DB_ID,
      API_KEYS_COLLECTION_ID,
      [
        Query.equal('keyHash', keyHash)
      ]
    );
    
    if (response.documents.length === 0) {
      return { valid: false, userId: null, keyId: null };
    }
    
    const apiKey = response.documents[0] as unknown as ApiKey;
    
    // Check if the key is expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { valid: false, userId: null, keyId: null };
    }
    
    // Update the last used timestamp
    await adminDatabases.updateDocument(
      DB_ID,
      API_KEYS_COLLECTION_ID,
      apiKey.$id,
      {
        lastUsedAt: new Date().toISOString()
      }
    );
    
    return { valid: true, userId: apiKey.userId, keyId: apiKey.$id };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, userId: null, keyId: null };
  }
}