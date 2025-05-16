import { NextRequest, NextResponse } from 'next/server';
import { account, databases, DB_ID, WINES_COLLECTION_ID, ID, getWineById } from '@/lib/appwrite-client';

export async function POST(request: NextRequest) {
  try {
    // Get the session from the client
    try {
      await account.get();
    } catch (error) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    // Get the current user
    const user = await account.get();
    const userId = user.$id;
    
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
    
    // Create a new wine based on the original
    const now = new Date().toISOString();
    const newWine = await databases.createDocument(
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
        updatedAt: now
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