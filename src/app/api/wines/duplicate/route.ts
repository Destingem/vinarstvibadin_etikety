import { NextRequest, NextResponse } from 'next/server';
import { databases, DB_ID, WINES_COLLECTION_ID, ID, getWineById, adminDatabases } from '@/lib/appwrite-client';
import { verifyJwtToken } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Get the JWT token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    // Verify the token
    let verifiedToken;
    try {
      verifiedToken = verifyJwtToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get the wine ID from the request body
    const body = await request.json();
    const { wineId, newBatch, newVintage } = body;
    
    if (!wineId) {
      return NextResponse.json(
        { message: 'Chybí ID vína' },
        { status: 400 }
      );
    }
    
    // Get the wine to duplicate
    const wine = await getWineById(wineId);
    
    if (!wine) {
      return NextResponse.json(
        { message: 'Víno nebylo nalezeno' },
        { status: 404 }
      );
    }
    
    // Verify the wine belongs to the current user
    if (wine.userId !== userId) {
      return NextResponse.json(
        { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
        { status: 403 }
      );
    }
    
    // Make sure we have the winery information from the original wine
    let wineryName = wine.wineryName;
    let winerySlug = wine.winerySlug;
    
    // If for some reason the original wine doesn't have these, fetch them
    if (!wineryName || !winerySlug) {
      try {
        // Fetch the user data directly from the API
        const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${userId}`, {
          headers: {
            'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
            'X-Appwrite-Key': process.env.APPWRITE_KEY || ''
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          wineryName = userData.name;
          
          // Use the createSlug function from appwrite-client
          const createSlug = (text: string): string => {
            return text
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
          };
          
          winerySlug = createSlug(userData.name);
          console.log("Retrieved winery data from API for wine duplication:", { name: wineryName, slug: winerySlug });
        }
      } catch (error) {
        console.error("Failed to fetch winery data from API for duplication:", error);
      }
    }
    
    // Create a new wine based on the original, using adminDatabases for server-side access
    const now = new Date().toISOString();
    const newWine = await adminDatabases.createDocument(
      DB_ID,
      WINES_COLLECTION_ID,
      ID.unique(),
      {
        userId: userId,
        name: wine.name,
        vintage: newVintage || wine.vintage, // Use new vintage if provided
        batch: newBatch || `${wine.batch} (kopie)`, // Use new batch if provided or add "(kopie)" to the original
        alcoholContent: wine.alcoholContent,
        energyValueKJ: wine.energyValueKJ,
        energyValueKcal: wine.energyValueKcal, // Added back since the field now exists in Appwrite
        fat: wine.fat,
        saturatedFat: wine.saturatedFat,
        carbs: wine.carbs,
        sugars: wine.sugars,
        protein: wine.protein,
        salt: wine.salt,
        ingredients: wine.ingredients,
        additionalInfo: wine.additionalInfo,
        allergens: wine.allergens,
        wineRegion: wine.wineRegion,
        wineSubregion: wine.wineSubregion,
        wineVillage: wine.wineVillage,
        wineTract: wine.wineTract,
        createdAt: now,
        updatedAt: now,
        // Ensure we copy the winery information to the new wine
        wineryName: wineryName,
        winerySlug: winerySlug
      }
    );
    
    return NextResponse.json({
      message: 'Víno bylo úspěšně zkopírováno',
      wine: newWine
    });
  } catch (error) {
    console.error('Error duplicating wine:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při kopírování vína' },
      { status: 500 }
    );
  }
}