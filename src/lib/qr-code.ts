import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  logoUrl?: string; // URL or data URL of the logo to embed in the QR code
  logoFileId?: string; // Appwrite Storage file ID for the logo
  logoSize?: number; // Size of the logo as a percentage of the QR code size (1-50)
  logoBackgroundColor?: string; // Background color for the logo area
  borderRadius?: number; // Border radius for the QR code squares in pixels
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction level: L: 7%, M: 15%, Q: 25%, H: 30%
}

export interface QRCodePreset {
  id: string;
  name: string;
  options: QRCodeOptions;
  hasStoredLogo?: boolean; // Indicates if the preset uses a logo stored in Appwrite Storage
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
    logoSize: 20, // 20% of QR code size by default
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
    
    // If no logo is provided, return the QR code as is
    if (!mergedOptions.logoUrl && !mergedOptions.logoFileId) {
      return dataUrl;
    }
    
    // If a logo is provided, embed it in the QR code
    return await embedLogoInQRCode(dataUrl, mergedOptions);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Checks if code is running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Embeds a logo in a QR code
 * @param qrCodeDataUrl The data URL of the QR code
 * @param options Options for embedding the logo
 * @returns A promise that resolves to a data URL containing the QR code with embedded logo
 */
async function embedLogoInQRCode(qrCodeDataUrl: string, options: QRCodeOptions): Promise<string> {
  // If no logo URL or file ID provided, return the QR code as is
  if (!options.logoUrl && !options.logoFileId) {
    return qrCodeDataUrl;
  }
  
  // If we're on the server, we can't use canvas - return the QR code without a logo
  if (!isBrowser()) {
    console.log('Embedding logo skipped - running in server environment');
    return qrCodeDataUrl;
  }
  
  // Client-side logo embedding using canvas
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return reject(new Error('Failed to get canvas context'));
    }
    
    const qrCodeImg = new Image();
    qrCodeImg.crossOrigin = 'anonymous';
    qrCodeImg.onload = () => {
      // Set canvas size to match QR code
      canvas.width = qrCodeImg.width;
      canvas.height = qrCodeImg.height;
      
      // Draw QR code to canvas
      ctx.drawImage(qrCodeImg, 0, 0);
      
      // Load logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        // Calculate logo size (as percentage of QR code size)
        const logoSize = Math.min(50, options.logoSize || 20) / 100 * qrCodeImg.width;
        
        // Calculate logo position (centered)
        const logoX = (qrCodeImg.width - logoSize) / 2;
        const logoY = (qrCodeImg.height - logoSize) / 2;
        
        // If a background color is specified, draw a background for the logo
        if (options.logoBackgroundColor) {
          ctx.fillStyle = options.logoBackgroundColor;
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
        }
        
        // Draw logo on canvas
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
        
        // Resolve with the final data URL
        resolve(canvas.toDataURL());
      };
      
      logoImg.onerror = () => {
        reject(new Error('Failed to load logo'));
      };
      
      // Set the source to either the logo URL or the file URL (whichever is provided)
      logoImg.src = options.logoUrl || '';
    };
    
    qrCodeImg.onerror = () => {
      reject(new Error('Failed to load QR code'));
    };
    
    qrCodeImg.src = qrCodeDataUrl;
  });
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