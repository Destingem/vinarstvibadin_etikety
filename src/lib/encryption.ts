/**
 * Data obfuscation utilities for wine data exports and imports
 * This uses a simple obfuscation method with a server-side key
 */

/**
 * Obfuscates data by combining with a secret key and encoding to base64
 * @param data - Data to obfuscate
 * @returns Obfuscated string
 */
export function obfuscateData(data: any): string {
  // Convert data to JSON string
  const jsonData = JSON.stringify(data);
  
  // Add a timestamp and version for future compatibility
  const packagedData = {
    data: jsonData,
    timestamp: new Date().toISOString(),
    version: 1,
    source: 'vinarstvi-qr-export'
  };
  
  // Convert to string and encode with base64
  const baseString = JSON.stringify(packagedData);
  const encoded = Buffer.from(baseString).toString('base64');
  
  // Add the signature to verify this was created by our app
  const signature = createSignature(encoded);
  
  // Combine into final format
  return `${signature}:${encoded}`;
}

/**
 * Deobfuscates data that was previously obfuscated
 * @param obfuscatedData - Obfuscated data string
 * @returns Original data object
 */
export function deobfuscateData(obfuscatedData: string): any {
  try {
    // Split signature and data
    const [signature, encoded] = obfuscatedData.split(':');
    
    // Verify signature
    const expectedSignature = createSignature(encoded);
    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }
    
    // Decode base64
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    
    // Parse the package
    const packagedData = JSON.parse(decoded);
    
    // Parse the inner data
    return JSON.parse(packagedData.data);
  } catch (error) {
    console.error('Error deobfuscating data:', error);
    throw new Error('Failed to deobfuscate data. This file may be corrupted or created with a different export system.');
  }
}

/**
 * Creates a signature for verifying data was created by our app
 * @param data - The data to sign
 * @returns Signature string
 */
function createSignature(data: string): string {
  const key = getSecretKey();
  
  // Create a simple hash combining the data and key
  let hash = 0;
  const combinedString = data + key;
  
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hexadecimal and ensure it's 8 characters
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Gets the secret key from environment variable
 * @returns The secret key
 */
function getSecretKey(): string {
  const secretKey = process.env.ENCRYPTION_KEY;
  
  if (!secretKey) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  
  return secretKey;
}