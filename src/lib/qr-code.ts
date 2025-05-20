import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  borderRadius?: number; // Border radius for the QR code squares in pixels
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction level: L: 7%, M: 15%, Q: 25%, H: 30%
}

export interface QRCodePreset {
  id: string;
  name: string;
  options: QRCodeOptions;
}

/**
 * Generates a QR code for a given URL
 * @param url The URL to encode in the QR code
 * @param options Options for the QR code generation
 * @returns A promise that resolves to a data URL containing the QR code
 */
export async function generateQRCode(url: string, options: QRCodeOptions = {}): Promise<string> {
  const defaultOptions = {
    width: 300,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    borderRadius: 0,
    errorCorrectionLevel: 'M' as 'L' | 'M' | 'Q' | 'H',
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    color: {
      ...defaultOptions.color,
      ...options.color,
    },
  };

  try {
    // Generate QR code
    const dataUrl = await QRCode.toDataURL(url, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Creates the full URL for a wine QR code based on the winery slug and wine ID
 * @param winerySlug The slug of the winery
 * @param wineId The ID of the wine
 * @returns The complete URL for the wine QR code
 */
export function createWineQRCodeUrl(winerySlug: string, wineId: string): string {
  // Ensure the winery slug and wine ID are properly formatted
  const sanitizedSlug = winerySlug.trim();
  const sanitizedWineId = wineId.trim();
  
  // Use the etiketa.wine domain for the QR code
  return `https://etiketa.wine/${sanitizedSlug}/${sanitizedWineId}`;
}