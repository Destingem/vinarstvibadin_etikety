import { NextRequest, NextResponse } from 'next/server';
import { verifyJwtToken, getUserById, updateUserPrefs } from '@/lib/auth-server';
import { generateQRCode, createWineQRCodeUrl, QRCodeOptions, QRCodePreset } from '@/lib/qr-code';
import { getWineById, adminDatabases, DB_ID, ID } from '@/lib/appwrite-client';

// Supported HTTP methods
export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const wineId = searchParams.get('wineId');
    const presetId = searchParams.get('presetId');
    
    if (!wineId) {
      return NextResponse.json(
        { message: 'Chybí ID vína' },
        { status: 400 }
      );
    }
    
    // Find wine by ID using Appwrite
    try {
      const wine = await getWineById(wineId);
      
      if (!wine) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      // Check if wine belongs to current user
      if (wine.userId !== userId) {
        return NextResponse.json(
          { message: 'Nemáte oprávnění k přístupu k tomuto vínu' },
          { status: 403 }
        );
      }
      
      // Get user's QR code presets if any
      let qrCodeOptions: QRCodeOptions = {};
      
      // If a preset ID is provided, use that preset
      if (presetId) {
        const user = await getUserById(userId);
        
        if (user && user.prefs && user.prefs.qrPresets) {
          try {
            const presets: QRCodePreset[] = JSON.parse(user.prefs.qrPresets);
            const preset = presets.find((p) => p.id === presetId);
            
            if (preset) {
              qrCodeOptions = preset.options;
            }
          } catch (error) {
            console.error('Error parsing QR code presets:', error);
          }
        }
      } else {
        // Try to get customization options from query parameters
        const width = searchParams.get('width');
        const margin = searchParams.get('margin');
        const darkColor = searchParams.get('darkColor');
        const lightColor = searchParams.get('lightColor');
        const logoUrl = searchParams.get('logoUrl');
        const logoSize = searchParams.get('logoSize');
        const logoBackgroundColor = searchParams.get('logoBackgroundColor');
        const errorCorrectionLevel = searchParams.get('errorCorrectionLevel');
        
        // Build options object from query parameters
        if (width) qrCodeOptions.width = parseInt(width);
        if (margin) qrCodeOptions.margin = parseInt(margin);
        if (darkColor || lightColor) {
          qrCodeOptions.color = {
            dark: darkColor || '#000000',
            light: lightColor || '#ffffff',
          };
        }
        if (logoUrl) qrCodeOptions.logoUrl = logoUrl;
        if (logoSize) qrCodeOptions.logoSize = parseInt(logoSize);
        if (logoBackgroundColor) qrCodeOptions.logoBackgroundColor = logoBackgroundColor;
        if (errorCorrectionLevel && ['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
          qrCodeOptions.errorCorrectionLevel = errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H';
        }
      }
      
      // Generate QR code URL - use winerySlug directly from the wine object
      const qrCodeUrl = createWineQRCodeUrl(wine.winerySlug || 'unknown', wine.$id);
      
      // Generate QR code with options
      const qrCodeDataUrl = await generateQRCode(qrCodeUrl, qrCodeOptions);
      
      return NextResponse.json({
        qrCode: qrCodeDataUrl,
        url: qrCodeUrl,
        wine: {
          id: wine.$id,
          name: wine.name,
          vintage: wine.vintage,
          batch: wine.batch,
        },
        options: qrCodeOptions,
      });
    } catch (error: any) {
      console.error('Error fetching wine or generating QR code:', error);
      
      // Check for 404 error from Appwrite
      if (error.code === 404) {
        return NextResponse.json(
          { message: 'Víno nebylo nalezeno' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { message: error.message || 'Nastala chyba při generování QR kódu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při generování QR kódu' },
      { status: 500 }
    );
  }
}

// POST endpoint for saving QR code presets
export async function POST(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Uživatel není přihlášen' },
        { status: 401 }
      );
    }
    
    const verifiedToken = verifyJwtToken(token);
    
    if (!verifiedToken) {
      return NextResponse.json(
        { message: 'Neplatný token' },
        { status: 401 }
      );
    }
    
    const userId = verifiedToken.userId;
    
    // Get the preset from the request body
    const body = await request.json();
    const { preset, action } = body;
    
    if (!preset && action !== 'getPresets') {
      return NextResponse.json(
        { message: 'Chybí data presetu' },
        { status: 400 }
      );
    }
    
    console.log(`Processing QR preset action: ${action}`, preset ? `Preset: ${preset.name}` : '');
    
    // Initialize presets array
    let presets: QRCodePreset[] = [];
    
    try {
      // Get user directly to access preferences
      const user = await getUserById(userId);
      
      // Check if user has saved presets in preferences
      if (user && user.prefs && user.prefs.qrPresets) {
        try {
          // Parse saved presets from preferences
          presets = JSON.parse(user.prefs.qrPresets);
          console.log(`Retrieved ${presets.length} presets from user preferences`);
        } catch (parseError) {
          console.error('Error parsing QR code presets from user preferences:', parseError);
        }
      } else {
        console.log('No presets found in user preferences');
      }
    } catch (userError) {
      console.error('Error retrieving user for presets:', userError);
      // Continue with empty presets array
    }
    
    // Handle different actions
    if (action === 'save') {
      // Add or update preset
      const existingIndex = presets.findIndex((p) => p.id === preset.id);
      
      if (existingIndex >= 0) {
        // Update existing preset
        presets[existingIndex] = preset;
      } else {
        // Add new preset
        presets.push(preset);
      }
    } else if (action === 'delete') {
      // Remove preset
      presets = presets.filter((p) => p.id !== preset.id);
    } else if (action === 'getPresets') {
      // Just return the current presets
      return NextResponse.json({ presets });
    }
    
    // Save presets to user preferences
    try {
      const prefsToUpdate = { qrPresets: JSON.stringify(presets) };
      console.log(`Updating user preferences with ${presets.length} presets`);

      // Use the updateUserPrefs helper function from auth-server.ts
      await updateUserPrefs(prefsToUpdate, userId);
      
      console.log('Successfully updated user preferences');
      
      // Let's verify the preferences were updated
      const user = await getUserById(userId);
      console.log('User preferences after update:', user.prefs);
      
      return NextResponse.json({
        message: action === 'save' ? 'Preset byl úspěšně uložen' : 'Preset byl úspěšně smazán',
        presets,
      });
    } catch (error) {
      console.error('Error saving QR code preset:', error);
      return NextResponse.json(
        { message: 'Nastala chyba při ukládání presetu' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error handling QR code preset:', error);
    return NextResponse.json(
      { message: 'Nastala chyba při zpracování presetu' },
      { status: 500 }
    );
  }
}