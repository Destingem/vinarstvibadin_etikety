import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Initialize Appwrite client
const client = new Client();

// Set up client with Appwrite endpoint and project ID
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Export Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Appwrite constants
export const DB_ID = 'wine_db';
export const WINERIES_COLLECTION_ID = 'wineries';
export const WINES_COLLECTION_ID = '6827655800216265c9fc'; // Updated to use new collection ID

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

// Winery management functions
export async function getWineryByEmail(email: string): Promise<Winery | null> {
  try {
    const response = await databases.listDocuments(
      DB_ID,
      WINERIES_COLLECTION_ID,
      [Query.equal('email', email)]
    );

    if (response.documents.length > 0) {
      return response.documents[0] as Winery;
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
      return response.documents[0] as Winery;
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
    return winery as Winery;
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
    return newWinery as Winery;
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
    return updatedWinery as Winery;
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
    return wine as Wine;
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
    return response.documents as Wine[];
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
    return newWine as Wine;
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
    return updatedWine as Wine;
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