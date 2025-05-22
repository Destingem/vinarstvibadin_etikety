import { notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';
// Import Appwrite utility functions 
import { getWineById, getWineryBySlug, Wine, Winery } from '@/lib/appwrite';
import { adminDatabases, DB_ID, WINES_COLLECTION_ID } from '@/lib/appwrite-client';
// Import the analytics tracker component
import AnalyticsTracker from './analytics-integration';

// Type aliases for our wine display
type WineryInfo = {
  $id: string;
  name: string;
  slug: string;
  address?: string;
};

// Make a much simpler interface with just what we need
interface WineWithWinery {
  // Core required fields
  $id: string;
  name: string;
  winery: WineryInfo;
  
  // All other fields are optional
  [key: string]: any;
}

// Generate metadata for page
export async function generateMetadata(
  { params }: { params: Promise<{ winery: string; wineId: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // In Next.js 15, params should be awaited
  const { winery, wineId } = await params;
  
  // Fetch wine data
  const wine = await getWineData(winery, wineId);

  if (!wine) {
    return {
      title: 'Víno nenalezeno',
    };
  }

  return {
    title: `${wine.name} | ${wine.winery.name}`,
    description: `Informace o víně ${wine.name} od ${wine.winery.name}`,
  };
}

// Fetch wine data function adapted for new Appwrite schema
async function getWineData(winerySlug: string, wineId: string): Promise<WineWithWinery | null> {
  try {
    console.log(`[Server] Fetching wine with ID ${wineId} for winery slug ${winerySlug}`);
    
    // Get wine from Appwrite - first try with the new appwrite-client since we've updated the collection ID
    let wine = null;
    try {
      wine = await adminDatabases.getDocument(
        DB_ID,
        WINES_COLLECTION_ID,
        wineId
      );
    } catch (adminError) {
      console.error('[Server] Error getting wine from adminDatabases:', adminError);
      
      try {
        // Fall back to the original appwrite.ts getWineById if the first method fails
        wine = await getWineById(wineId);
      } catch (fallbackError) {
        console.error('[Server] Fallback error getting wine:', fallbackError);
      }
    }
    
    console.log(`[Server] Wine found in DB: ${!!wine}`);
    
    if (!wine) {
      console.log(`[Server] No wine found with ID: ${wineId}`);
      return null;
    }
    
    // Check if winerySlug matches what's in the wine document
    // First check if the property exists using type assertion or hasOwnProperty
    const documentWinerySlug = 'winerySlug' in wine ? (wine as any).winerySlug : undefined;
    
    if (documentWinerySlug && documentWinerySlug.toLowerCase() !== winerySlug.toLowerCase()) {
      console.log(`[Server] URL winery slug does not match wine's winery slug`);
      console.log(`[Server] Wine winery slug: ${documentWinerySlug}`);
      console.log(`[Server] Requested winery slug: ${winerySlug}`);
      return null;
    }
    
    // Get the user details from Appwrite to get the winery name
    let wineryName = "Unknown Winery";
    try {
      // Check for winery properties with type assertions to avoid TypeScript errors
      const docWineryName = 'wineryName' in wine ? (wine as any).wineryName : undefined;
      const docWinerySlug = 'winerySlug' in wine ? (wine as any).winerySlug : undefined;
      const docUserId = 'userId' in wine ? (wine as any).userId : wine.$id;
      
      // Format the winery name to look better
      if (docWineryName) {
        // If there's a dot in the name (like "ondrej.zaplatilek"), format it nicely
        if (docWineryName.includes('.')) {
          wineryName = docWineryName
            .split('.')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        }
        // If there's a hyphen in the name, format it nicely too
        else if (docWineryName.includes('-')) {
          wineryName = docWineryName
            .split('-')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        }
        // Otherwise just use the name as is
        else {
          wineryName = docWineryName;
        }
      } 
      // If no winery name, try alternative approaches
      else if (docUserId) {
        // Try to use the winerySlug as a basis for a display name
        if (docWinerySlug) {
          // Convert slug to a readable name (capitalize first letter of each word)
          wineryName = docWinerySlug
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        } 
        // Fall back to a generic name with the userId
        else {
          wineryName = `Vinařství ${docUserId.substring(0, 8)}`;
        }
      }
    } catch (userError) {
      console.error('[Server] Error fetching user details:', userError);
    }
    
    // Get userId safely
    const docUserId = 'userId' in wine ? (wine as any).userId : wine.$id;
    const docWinerySlug = 'winerySlug' in wine ? (wine as any).winerySlug : undefined;
    
    // Create a simple winery object based on the wine's embedded winery data and user data
    const winery = {
      $id: docUserId, // Use the userId as the winery ID
      name: wineryName,
      slug: docWinerySlug || winerySlug,
      address: "" // We don't have address in the new schema
    };
    
    // Get the wine name safely - ensure we always have a string
    const wineName = 
      ('name' in wine && typeof wine.name === 'string' && wine.name) || 
      ('$id' in wine ? `Wine ${wine.$id}` : `Wine ${wineId}`);
    
    // Create a new object with the required structure instead of spreading
    const wineWithWinery: WineWithWinery = {
      // Required fields - ensure $id is a string using 'in' check
      $id: '$id' in wine ? String(wine.$id) : String(wineId), // Fallback to the wineId from params
      name: wineName,
      
      // Copy all wine properties explicitly
      vintage: 'vintage' in wine ? (wine as any).vintage : undefined,
      batch: 'batch' in wine ? (wine as any).batch : undefined,
      alcoholContent: 'alcoholContent' in wine ? (wine as any).alcoholContent : undefined,
      energyValueKJ: 'energyValueKJ' in wine ? (wine as any).energyValueKJ : undefined,
      energyValueKcal: 'energyValueKcal' in wine ? (wine as any).energyValueKcal : undefined,
      fat: 'fat' in wine ? (wine as any).fat : undefined,
      saturatedFat: 'saturatedFat' in wine ? (wine as any).saturatedFat : undefined,
      carbs: 'carbs' in wine ? (wine as any).carbs : undefined,
      sugars: 'sugars' in wine ? (wine as any).sugars : undefined,
      protein: 'protein' in wine ? (wine as any).protein : undefined,
      salt: 'salt' in wine ? (wine as any).salt : undefined,
      ingredients: 'ingredients' in wine ? (wine as any).ingredients : undefined,
      additionalInfo: 'additionalInfo' in wine ? (wine as any).additionalInfo : undefined,
      allergens: 'allergens' in wine ? (wine as any).allergens : undefined,
      
      // Origin information
      wineRegion: 'wineRegion' in wine ? (wine as any).wineRegion : undefined,
      wineRegio: 'wineRegio' in wine ? (wine as any).wineRegio : undefined,
      wineSubregion: 'wineSubregion' in wine ? (wine as any).wineSubregion : undefined,
      wineVillage: 'wineVillage' in wine ? (wine as any).wineVillage : undefined,
      wineTract: 'wineTract' in wine ? (wine as any).wineTract : undefined,
      
      // ID fields
      userId: 'userId' in wine ? (wine as any).userId : undefined,
      wineryId: 'wineryId' in wine ? (wine as any).wineryId : undefined,
      
      // Metadata
      wineryName: 'wineryName' in wine ? (wine as any).wineryName : undefined,
      winerySlug: 'winerySlug' in wine ? (wine as any).winerySlug : undefined,
      createdAt: 'createdAt' in wine ? (wine as any).createdAt : 
                ('$createdAt' in wine ? (wine as any).$createdAt : new Date().toISOString()),
      updatedAt: 'updatedAt' in wine ? (wine as any).updatedAt : 
                ('$updatedAt' in wine ? (wine as any).$updatedAt : new Date().toISOString()),
      
      // System properties - with fallbacks for missing properties
      $collectionId: '$collectionId' in wine ? (wine as any).$collectionId : WINES_COLLECTION_ID,
      $databaseId: '$databaseId' in wine ? (wine as any).$databaseId : DB_ID,
      $createdAt: '$createdAt' in wine ? (wine as any).$createdAt : new Date().toISOString(),
      $updatedAt: '$updatedAt' in wine ? (wine as any).$updatedAt : new Date().toISOString(),
      
      // Add the winery field
      winery: winery
    };
    
    // Map fields from old field names (if any) using safer property access
    const docWineRegio = 'wineRegio' in wine ? (wine as any).wineRegio : undefined;
    const docWineRegion = 'wineRegion' in wine ? (wine as any).wineRegion : undefined;
    
    if (docWineRegio && !docWineRegion) {
      wineWithWinery.wineRegion = docWineRegio;
    }

    console.log(`[Server] Wine data successfully returned: ${wine.name}`);
    return wineWithWinery;
  } catch (error) {
    console.error('[Server] Error fetching wine data:', error);
    return null;
  }
}

export default async function WinePage({ params }: { params: Promise<{ winery: string; wineId: string }> }) {
  console.log(`[Server] WinePage component rendering with params:`, params);
  
  // In Next.js 15, params should be awaited
  const { winery, wineId } = await params;
  
  // Check params directly
  console.log(`[Server] winery param: "${winery}"`);
  console.log(`[Server] wineId param: "${wineId}"`);
  
  const wine = await getWineData(winery, wineId);

  if (!wine) {
    console.log(`[Server] Wine not found, redirecting to not-found page`);
    notFound();
  }
  
  // Check if the requested URL matches the canonical URL (case sensitive)
  // For production, we would redirect if they don't match
  const docWinerySlug = 'winerySlug' in wine ? (wine as any).winerySlug : undefined;
  if (docWinerySlug && docWinerySlug !== winery) {
    console.log(`[Server] Non-canonical URL detected. Canonical: ${docWinerySlug}, Requested: ${winery}`);
    // We're not redirecting for now, but logging it
  }
  
  console.log(`[Server] Rendering wine page for: ${wine.name}`);

  return (
    <div className="min-h-screen bg-white">
      {/* Analytics tracking component - client-side only */}
      <AnalyticsTracker
        wineId={wine.$id}
        wineName={wine.name}
        wineryId={wine.winery.$id}
        wineryName={wine.winery.name}
        winerySlug={wine.winery.slug}
        wineBatch={wine.batch}
        wineVintage={wine.vintage}
      />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black mb-2">
            {wine.name}
          </h1>
          <div className="text-black">
            {wine.winery.name}
          </div>
          {wine.vintage && (
            <div className="mt-2 inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              Ročník {wine.vintage}
            </div>
          )}
          {wine.batch && (
            <div className="mt-2 ml-2 inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Šarže {wine.batch}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm order-2 md:order-1">
            <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">
              Výživové údaje (na 100 ml)
            </h2>
            <div className="space-y-3 text-black">
              {(wine.energyValueKJ || wine.energyValueKcal) && (
                <div className="flex justify-between">
                  <span className="font-medium">Energetická hodnota</span>
                  <span>
                    {wine.energyValueKJ && `${wine.energyValueKJ} kJ`}
                    {wine.energyValueKJ && wine.energyValueKcal && ' / '}
                    {wine.energyValueKcal && `${wine.energyValueKcal} kcal`}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Tuky</span>
                <span>{wine.fat ?? 0} g</span>
              </div>
              <div className="flex justify-between pl-4 text-black">
                <span>Z toho nasycené mastné kyseliny</span>
                <span>{wine.saturatedFat ?? 0} g</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sacharidy</span>
                <span>{wine.carbs ?? 0} g</span>
              </div>
              <div className="flex justify-between pl-4 text-black">
                <span>Z toho cukry</span>
                <span>{wine.sugars ?? 0} g</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Bílkoviny</span>
                <span>{wine.protein ?? 0} g</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sůl</span>
                <span>{wine.salt ?? 0} g</span>
              </div>
            </div>

            {wine.alcoholContent && (
              <div className="mt-6 text-black">
                <h3 className="font-medium">Obsah alkoholu</h3>
                <p>{wine.alcoholContent}% obj.</p>
              </div>
            )}
          </div>

          <div className="order-1 md:order-2">
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">
                Složení
              </h2>
              <p className="text-black">
                {wine.ingredients || 'Hrozny, antioxidant: oxid siřičitý'}
              </p>

              {wine.allergens && (
                <div className="mt-4">
                  <h3 className="font-bold text-amber-600">Alergeny</h3>
                  <p className="text-amber-600">
                    {wine.allergens}
                  </p>
                </div>
              )}
            </div>

            {(wine.wineRegion || wine.wineSubregion || wine.wineVillage || wine.wineTract) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">
                  Původ
                </h2>
                <ul className="space-y-2 text-black">
                  {(wine.wineRegion || wine.wineRegio) && (
                    <li>
                      <span className="font-medium">Vinařská oblast:</span> {wine.wineRegion || wine.wineRegio}
                    </li>
                  )}
                  {wine.wineSubregion && (
                    <li>
                      <span className="font-medium">Vinařská podoblast:</span> {wine.wineSubregion}
                    </li>
                  )}
                  {wine.wineVillage && (
                    <li>
                      <span className="font-medium">Obec:</span> {wine.wineVillage}
                    </li>
                  )}
                  {wine.wineTract && (
                    <li>
                      <span className="font-medium">Trať:</span> {wine.wineTract}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {wine.additionalInfo && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-bold text-black mb-4 border-b pb-2">
              Další informace
            </h2>
            <p className="text-black">
              {wine.additionalInfo}
            </p>
          </div>
        )}

        <footer className="text-center text-black text-sm mt-12 pt-4 border-t">
          <p>Plnič/Výrobce: {wine.winery.name}</p>
          {wine.winery.address && (
            <p>{wine.winery.address}</p>
          )}
          <p className="mt-4">
            &copy; {new Date().getFullYear()} {wine.winery.name} - Informace dle EU nařízení 2021/2117
          </p>
        </footer>
      </div>
    </div>
  );
}