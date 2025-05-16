import { account, getWineryByEmail, getWineryById, Winery } from './appwrite';
import { ID } from 'appwrite';
import { sign, verify } from 'jsonwebtoken';

// Local browser-compatible hash for password
export async function hashPasswordAsync(password: string, salt?: string): Promise<{ hash: string, salt: string }> {
  // Use provided salt or create a new one
  const usedSalt = salt || Array.from(
    new Uint8Array(16)
  ).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Convert password + salt to Uint8Array
  const msgBuffer = new TextEncoder().encode(password + usedSalt);
  
  // Use Web Crypto API for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return { hash: hashHex, salt: usedSalt };
}

// Compare passwords
export function comparePasswords(
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> {
  return hashPasswordAsync(password, salt).then(result => result.hash === storedHash);
}

// Generate JWT token
export function generateToken(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return sign({ userId }, jwtSecret, {
    expiresIn: '7d',
  });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    return verify(token, jwtSecret) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Register a new winery
export async function registerWinery(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; wineryId?: string }> {
  try {
    // Check if winery with email already exists
    const existingWinery = await getWineryByEmail(email);
    
    if (existingWinery) {
      return { success: false, message: 'Email již existuje' };
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    // Hash password
    const { hash, salt } = await hashPasswordAsync(password);

    // Create a new winery in the database
    const winery: Winery = {
      name,
      email,
      slug,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // TODO: Create the winery in Appwrite
    const newWinery = await getWineryByEmail(email); // Temporary placeholder

    return {
      success: true,
      message: 'Vinařství bylo úspěšně zaregistrováno',
      wineryId: newWinery?.$id
    };
  } catch (error) {
    console.error('Error registering winery:', error);
    return { success: false, message: 'Při registraci nastala chyba' };
  }
}

// Login winery
export async function loginWinery(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  token?: string;
  winery?: Omit<Winery, 'passwordHash' | 'passwordSalt'>;
}> {
  try {
    // Find winery by email
    const winery = await getWineryByEmail(email);
    
    if (!winery) {
      return { success: false, message: 'Nesprávný email nebo heslo' };
    }
    
    // Check password
    const passwordMatch = await comparePasswords(
      password,
      winery.passwordHash!,
      winery.passwordSalt!
    );
    
    if (!passwordMatch) {
      return { success: false, message: 'Nesprávný email nebo heslo' };
    }
    
    // Generate token
    const token = generateToken(winery.$id!);
    
    // Return winery data without sensitive fields
    const { passwordHash, passwordSalt, ...wineryData } = winery;
    
    return {
      success: true,
      message: 'Přihlášení úspěšné',
      token,
      winery: wineryData
    };
  } catch (error) {
    console.error('Error logging in winery:', error);
    return { success: false, message: 'Při přihlášení nastala chyba' };
  }
}

// Get winery from token
export async function getWineryFromToken(
  token: string
): Promise<Omit<Winery, 'passwordHash' | 'passwordSalt'> | null> {
  try {
    // Verify token
    const verifiedToken = verifyToken(token);
    
    if (!verifiedToken) {
      return null;
    }
    
    // Get winery by ID
    const winery = await getWineryById(verifiedToken.userId);
    
    if (!winery) {
      return null;
    }
    
    // Return winery data without sensitive fields
    const { passwordHash, passwordSalt, ...wineryData } = winery;
    
    return wineryData;
  } catch (error) {
    console.error('Error getting winery from token:', error);
    return null;
  }
}