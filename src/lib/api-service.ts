import { ID, Query, Permission, Role } from 'appwrite';
import { adminDatabases, API_DB_ID } from '@/lib/appwrite-client';
// Use crypto module instead of uuid
// import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

// Define API key collection ID
export const API_KEYS_COLLECTION_ID = 'api_keys';

// API key scopes/permissions
export enum ApiScope {
  WINES_READ = 'wines:read',
  WINES_WRITE = 'wines:write',
  WINES_DELETE = 'wines:delete',
  QRCODES_GENERATE = 'qrcodes:generate',
  ANALYTICS_READ = 'analytics:read',
  ALL = '*'
}

// Interface for API key
export interface ApiKey {
  $id?: string;  // Appwrite document ID
  id: string;
  userId: string;
  name: string;
  key: string;
  keyHash: string;
  scopes: ApiScope[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

// Function to create a new API key
export async function createApiKey(
  userId: string, 
  name: string, 
  expiresAt: string | null = null,
  scopes: ApiScope[] = [ApiScope.ALL]
): Promise<ApiKey> {
  try {
    // Generate a new API key
    const key = `etw_${crypto.randomBytes(32).toString('hex')}`;
    
    // Hash the key for storage (we'll store both for this example, but in production only store the hash)
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    // Create a new API key document (without storing plain text key for security)
    const apiKey = {
      userId,
      name,
      // key field omitted - we only store the hash for security
      keyHash,
      scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      expiresAt
    };
    
    // Save to database with proper document permissions
    const result = await adminDatabases.createDocument(
      API_DB_ID,
      API_KEYS_COLLECTION_ID,
      ID.unique(),
      apiKey
      // Document permissions removed for Appwrite v1.7.4 compatibility
    );
    
    // Return result with the plain key (only time user will see it)
    return {
      ...result as unknown as ApiKey,
      key // Include key in response for user to copy
    };
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
}

// Function to get all API keys for a user
export async function getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
  try {
    const response = await adminDatabases.listDocuments(
      API_DB_ID,
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
      API_DB_ID,
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
export async function validateApiKey(key: string): Promise<{ 
  valid: boolean; 
  userId: string | null; 
  keyId: string | null; 
  scopes: ApiScope[];
}> {
  try {
    // Hash the provided key
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    
    // Look for a matching key hash
    const response = await adminDatabases.listDocuments(
      API_DB_ID,
      API_KEYS_COLLECTION_ID,
      [
        Query.equal('keyHash', keyHash)
      ]
    );
    
    if (response.documents.length === 0) {
      return { valid: false, userId: null, keyId: null, scopes: [] };
    }
    
    const apiKey = response.documents[0] as unknown as ApiKey;
    
    // Check if the key is expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return { valid: false, userId: null, keyId: null, scopes: [] };
    }
    
    // Update the last used timestamp
    if (apiKey.$id) {
      await adminDatabases.updateDocument(
        API_DB_ID,
        API_KEYS_COLLECTION_ID,
        apiKey.$id,
        {
          lastUsedAt: new Date().toISOString()
        }
      );
    } else {
      console.error('API key document is missing $id property');
    }
    
    return { 
      valid: true, 
      userId: apiKey.userId, 
      keyId: apiKey.$id || apiKey.id,
      scopes: apiKey.scopes || [ApiScope.ALL]
    };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { valid: false, userId: null, keyId: null, scopes: [] };
  }
}

// Function to check if API key has required scope
export function hasScope(userScopes: ApiScope[], requiredScope: ApiScope): boolean {
  // If user has ALL scope, they can access everything
  if (userScopes.includes(ApiScope.ALL)) {
    return true;
  }
  
  // Check if user has the specific required scope
  return userScopes.includes(requiredScope);
}