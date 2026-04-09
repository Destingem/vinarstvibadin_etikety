import { Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';
import { adminDatabases } from '@/lib/appwrite-client';
import { createAdminAppwriteClient } from '@/lib/appwrite-env';

const client = createAdminAppwriteClient();

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Appwrite constants
export const DB_ID = 'wine_db';
export const WINERIES_COLLECTION_ID = 'wineries';
export const WINES_COLLECTION_ID = '6827655800216265c9fc'; // Updated to use new collection ID
export const MEMBERSHIPS_COLLECTION_ID = 'memberships'; // Make sure this matches your Appwrite collection ID

// Helper functions
export { ID, Query };

// Database and collection types
export interface Winery {
  $id?: string;
  name: string;
  slug: string;
  email: string;
  address?: string;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Wine {
  $id?: string;
  wineryId: string;
  name: string;
  vintage?: number;
  batch?: string;
  alcoholContent?: number;
  energyValueKJ?: number;
  energyValueKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbs?: number;
  sugars?: number;
  protein?: number;
  salt?: number;
  ingredients?: string;
  additionalInfo?: string;
  allergens?: string;
  wineRegion?: string;
  wineSubregion?: string;
  wineVillage?: string;
  wineTract?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Membership {
  $id?: string;
  appwriteUserId: string;
  plan: 'STANDARD' | 'PLUS' | 'NEOMEZENĚ' | 'ENTERPRISE';
  wineLimit: number; // -1 for unlimited, default: 1
  currentWineCount: number; // default: 0
  expiresAt: string; // stored as string in Appwrite
  isActive: boolean; // default: true
  resetYear: number; // no default value, must be provided
  $createdAt?: string;
  $updatedAt?: string;
}

// Winery management functions
export async function getWineryByEmail(email: string): Promise<Winery | null> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      WINERIES_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Winery;
    }
    return null;
  } catch (error) {
    console.error('Error getting winery by email:', error);
    return null;
  }
}

export async function getWineryBySlug(slug: string): Promise<Winery | null> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      WINERIES_COLLECTION_ID,
      [Query.equal('slug', slug)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Winery;
    }
    return null;
  } catch (error) {
    console.error('Error getting winery by slug:', error);
    return null;
  }
}

export async function getWineryById(id: string): Promise<Winery | null> {
  try {
    const winery = await databases.getDocument(
      DB_ID,
      WINERIES_COLLECTION_ID,
      id
    );
    return winery as unknown as Winery;
  } catch (error) {
    console.error('Error getting winery by ID:', error);
    return null;
  }
}

export async function createWinery(winery: Winery): Promise<Winery | null> {
  try {
    const newWinery = await databases.createDocument(
      DB_ID,
      WINERIES_COLLECTION_ID,
      ID.unique(),
      {
        name: winery.name,
        slug: winery.slug,
        email: winery.email,
        passwordHash: winery.passwordHash,
        passwordSalt: winery.passwordSalt,
        address: winery.address || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    return newWinery as unknown as Winery;
  } catch (error) {
    console.error('Error creating winery:', error);
    return null;
  }
}

export async function updateWinery(id: string, data: Partial<Winery>): Promise<Winery | null> {
  try {
    const updatedWinery = await databases.updateDocument(
      DB_ID,
      WINERIES_COLLECTION_ID,
      id,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
    return updatedWinery as unknown as Winery;
  } catch (error) {
    console.error('Error updating winery:', error);
    return null;
  }
}

// Wine management functions
export async function getWineById(id: string): Promise<Wine | null> {
  try {
    const wine = await databases.getDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id
    );
    return wine as unknown as Wine;
  } catch (error) {
    console.error('Error getting wine by ID:', error);
    return null;
  }
}

export async function getWinesByWineryId(wineryId: string): Promise<Wine[]> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      WINES_COLLECTION_ID,
      [Query.equal('wineryId', wineryId)]
    );
    return response.documents as unknown as Wine[];
  } catch (error) {
    console.error('Error getting wines by winery ID:', error);
    return [];
  }
}

export async function createWine(wine: Wine): Promise<Wine | null> {
  try {
    const newWine = await databases.createDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      ID.unique(),
      {
        wineryId: wine.wineryId,
        name: wine.name,
        vintage: wine.vintage || null,
        batch: wine.batch || null,
        alcoholContent: wine.alcoholContent || null,
        energyValueKJ: wine.energyValueKJ || null,
        energyValueKcal: wine.energyValueKcal || null,
        fat: wine.fat || 0,
        saturatedFat: wine.saturatedFat || 0,
        carbs: wine.carbs || 0,
        sugars: wine.sugars || 0,
        protein: wine.protein || 0,
        salt: wine.salt || 0,
        ingredients: wine.ingredients || null,
        additionalInfo: wine.additionalInfo || null,
        allergens: wine.allergens || null,
        wineRegion: wine.wineRegion || null,
        wineSubregion: wine.wineSubregion || null,
        wineVillage: wine.wineVillage || null,
        wineTract: wine.wineTract || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    );
    return newWine as unknown as Wine;
  } catch (error) {
    console.error('Error creating wine:', error);
    return null;
  }
}

export async function updateWine(id: string, data: Partial<Wine>): Promise<Wine | null> {
  try {
    const updatedWine = await databases.updateDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id,
      {
        ...data,
        updatedAt: new Date().toISOString()
      }
    );
    return updatedWine as unknown as Wine;
  } catch (error) {
    console.error('Error updating wine:', error);
    return null;
  }
}

export async function deleteWine(id: string): Promise<boolean> {
  try {
    await databases.deleteDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      id
    );
    return true;
  } catch (error) {
    console.error('Error deleting wine:', error);
    return false;
  }
}

// Membership management functions
export async function getMembershipByUserId(appwriteUserId: string): Promise<Membership | null> {
  try {
    const response = await adminDatabases.listDocuments(
      DB_ID,
      MEMBERSHIPS_COLLECTION_ID,
      [Query.equal('appwriteUserId', appwriteUserId)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as unknown as Membership;
    }
    return null;
  } catch (error) {
    console.error('Error getting membership by user ID:', error);
    return null;
  }
}

export async function getAllMemberships(limit: number = 20, offset: number = 0): Promise<{ memberships: Membership[], total: number }> {
  try {
    const response = await adminDatabases.listDocuments(
      DB_ID,
      MEMBERSHIPS_COLLECTION_ID,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')]
    );

    return {
      memberships: response.documents as unknown as Membership[],
      total: response.total
    };
  } catch (error) {
    console.error('Error getting all memberships:', error);
    return { memberships: [], total: 0 };
  }
}

export async function createMembership(membership: Omit<Membership, '$id' | '$createdAt' | '$updatedAt'>): Promise<Membership | null> {
  try {
    const newMembership = await adminDatabases.createDocument(
      DB_ID,
      MEMBERSHIPS_COLLECTION_ID,
      ID.unique(),
      {
        appwriteUserId: membership.appwriteUserId,
        plan: membership.plan,
        wineLimit: membership.wineLimit,
        currentWineCount: membership.currentWineCount,
        expiresAt: membership.expiresAt,
        isActive: membership.isActive,
        resetYear: membership.resetYear
      }
      // Document permissions removed - server v1.7.4 doesn't support user-specific permissions
      // Security relies on collection permissions + server-side validation
    );
    return newMembership as unknown as Membership;
  } catch (error) {
    console.error('Error creating membership:', error);
    return null;
  }
}

export async function updateMembership(id: string, data: Partial<Membership>): Promise<Membership | null> {
  try {
    // Remove Appwrite system fields from update data
    const updateData = { ...data };
    delete updateData.$id;
    delete updateData.$createdAt;
    delete updateData.$updatedAt;
    
    const updatedMembership = await adminDatabases.updateDocument(
      DB_ID,
      MEMBERSHIPS_COLLECTION_ID,
      id,
      updateData
    );
    return updatedMembership as unknown as Membership;
  } catch (error) {
    console.error('Error updating membership:', error);
    return null;
  }
}

export async function incrementWineCount(appwriteUserId: string): Promise<boolean> {
  try {
    const membership = await getMembershipByUserId(appwriteUserId);
    if (!membership) return false;

    await updateMembership(membership.$id!, {
      currentWineCount: membership.currentWineCount + 1
    });
    
    return true;
  } catch (error) {
    console.error('Error incrementing wine count:', error);
    return false;
  }
}

export async function checkWineLimit(appwriteUserId: string): Promise<{ canCreate: boolean, currentCount: number, limit: number, yearlyLimit: number, yearsSinceStart: number }> {
  try {
    const membership = await getMembershipByUserId(appwriteUserId);
    
    if (!membership || !membership.isActive || new Date(membership.expiresAt) < new Date()) {
      return { canCreate: false, currentCount: 0, limit: 0, yearlyLimit: 0, yearsSinceStart: 0 };
    }

    const currentYear = new Date().getFullYear();
    // Use creation date, fallback to current year if not available
    const membershipStartYear = membership.$createdAt 
      ? new Date(membership.$createdAt).getFullYear()
      : currentYear;
    const yearsSinceStart = Math.max(1, currentYear - membershipStartYear + 1);
    
    // Calculate cumulative limit based on years since membership started
    let cumulativeLimit: number;
    let yearlyLimit: number;
    
    if (membership.wineLimit === -1) {
      // Unlimited plans
      cumulativeLimit = -1;
      yearlyLimit = -1;
    } else {
      // Standard: 20/year, Plus: 50/year - multiply by years
      yearlyLimit = membership.wineLimit;
      cumulativeLimit = membership.wineLimit * yearsSinceStart;
    }

    // Check if it's a new year and we need to update the reset year
    if (membership.resetYear < currentYear) {
      await updateMembership(membership.$id!, {
        resetYear: currentYear
      });
    }

    const canCreate = cumulativeLimit === -1 || membership.currentWineCount < cumulativeLimit;
    
    return {
      canCreate,
      currentCount: membership.currentWineCount,
      limit: cumulativeLimit,
      yearlyLimit,
      yearsSinceStart
    };
  } catch (error) {
    console.error('Error checking wine limit:', error);
    return { canCreate: false, currentCount: 0, limit: 0, yearlyLimit: 0, yearsSinceStart: 0 };
  }
}
