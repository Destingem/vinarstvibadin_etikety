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
    <div className="min-h-screen bg-white relative overflow-hidden">
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
      
      {/* Ambient Background - Same as main page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        {/* Floating red orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-100/60 to-red-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-l from-red-200/50 to-red-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-gradient-to-br from-red-150/40 to-red-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl blur-sm"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
                {wine.name}
              </h1>
              <div className="text-xl text-gray-700 font-medium mb-6">
                {wine.winery.name}
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {wine.vintage && (
                  <div className="bg-gradient-to-r from-red-100/80 to-red-200/60 backdrop-blur-sm text-red-800 px-4 py-2 rounded-2xl text-sm font-medium border border-red-200/50">
                    Ročník {wine.vintage}
                  </div>
                )}
                {wine.batch && (
                  <div className="bg-gradient-to-r from-gray-100/80 to-gray-200/60 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-2xl text-sm font-medium border border-gray-200/50">
                    Šarže {wine.batch}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Nutrition Facts */}
          <div className="relative order-2 lg:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent border-b border-gray-200/50 pb-3">
                Výživové údaje (na 100 ml)
              </h2>
              <div className="space-y-4 text-gray-800">
                {(wine.energyValueKJ || wine.energyValueKcal) && (
                  <div className="flex justify-between py-2 border-b border-gray-100/50">
                    <span className="font-medium">Energetická hodnota</span>
                    <span className="font-medium">
                      {wine.energyValueKJ && `${wine.energyValueKJ} kJ`}
                      {wine.energyValueKJ && wine.energyValueKcal && ' / '}
                      {wine.energyValueKcal && `${wine.energyValueKcal} kcal`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100/50">
                  <span className="font-medium">Tuky</span>
                  <span className="font-medium">{wine.fat ?? 0} g</span>
                </div>
                <div className="flex justify-between pl-4 py-1 text-gray-600">
                  <span>Z toho nasycené mastné kyseliny</span>
                  <span>{wine.saturatedFat ?? 0} g</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/50">
                  <span className="font-medium">Sacharidy</span>
                  <span className="font-medium">{wine.carbs ?? 0} g</span>
                </div>
                <div className="flex justify-between pl-4 py-1 text-gray-600">
                  <span>Z toho cukry</span>
                  <span>{wine.sugars ?? 0} g</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/50">
                  <span className="font-medium">Bílkoviny</span>
                  <span className="font-medium">{wine.protein ?? 0} g</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100/50">
                  <span className="font-medium">Sůl</span>
                  <span className="font-medium">{wine.salt ?? 0} g</span>
                </div>
              </div>

              {wine.alcoholContent && (
                <div className="mt-8 p-4 bg-gradient-to-r from-red-50/80 to-red-100/60 backdrop-blur-sm rounded-2xl border border-red-200/50">
                  <h3 className="font-bold text-red-800 mb-2">Obsah alkoholu</h3>
                  <p className="text-red-700 text-lg font-medium">{wine.alcoholContent}% obj.</p>
                </div>
              )}
            </div>
          </div>

          {/* Composition and Origin */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Composition */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent border-b border-gray-200/50 pb-3">
                  Složení
                </h2>
                <p className="text-gray-800 leading-relaxed">
                  {wine.ingredients || 'Hrozny, antioxidant: oxid siřičitý'}
                </p>

                {wine.allergens && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-50/80 to-amber-100/60 backdrop-blur-sm rounded-2xl border border-amber-200/50">
                    <h3 className="font-bold text-amber-800 mb-2">Alergeny</h3>
                    <p className="text-amber-700">
                      {wine.allergens}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Origin */}
            {(wine.wineRegion || wine.wineSubregion || wine.wineVillage || wine.wineTract) && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
                <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
                  <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent border-b border-gray-200/50 pb-3">
                    Původ
                  </h2>
                  <ul className="space-y-3 text-gray-800">
                    {(wine.wineRegion || wine.wineRegio) && (
                      <li className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100/50">
                        <span className="font-medium text-gray-700">Vinařská oblast:</span>
                        <span className="font-medium">{wine.wineRegion || wine.wineRegio}</span>
                      </li>
                    )}
                    {wine.wineSubregion && (
                      <li className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100/50">
                        <span className="font-medium text-gray-700">Vinařská podoblast:</span>
                        <span className="font-medium">{wine.wineSubregion}</span>
                      </li>
                    )}
                    {wine.wineVillage && (
                      <li className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100/50">
                        <span className="font-medium text-gray-700">Obec:</span>
                        <span className="font-medium">{wine.wineVillage}</span>
                      </li>
                    )}
                    {wine.wineTract && (
                      <li className="flex flex-col sm:flex-row sm:justify-between py-2">
                        <span className="font-medium text-gray-700">Trať:</span>
                        <span className="font-medium">{wine.wineTract}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        {wine.additionalInfo && (
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent border-b border-gray-200/50 pb-3">
                Další informace
              </h2>
              <p className="text-gray-800 leading-relaxed">
                {wine.additionalInfo}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/60 to-white/40 rounded-3xl"></div>
          <div className="relative bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-gray-200/50 shadow-xl text-center">
            <div className="text-gray-700 space-y-2">
              <p className="font-medium">Plnič/Výrobce: {wine.winery.name}</p>
              {wine.winery.address && (
                <p className="text-gray-600">{wine.winery.address}</p>
              )}
              <p className="text-sm text-gray-600 mt-4 pt-4 border-t border-gray-200/50">
                &copy; {new Date().getFullYear()} {wine.winery.name} - Informace dle EU nařízení 2021/2117
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}