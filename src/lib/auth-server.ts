import { Client, Account, ID } from 'appwrite';
import { sign, verify } from 'jsonwebtoken';

// Create a server-side client (uses API key)
const serverClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set API key - handle different SDK versions
if (process.env.APPWRITE_KEY) {
  // @ts-ignore - Method might change between versions
  if (typeof serverClient.setKey === 'function') {
    serverClient.setKey(process.env.APPWRITE_KEY);
  } else if (typeof serverClient.setApiKey === 'function') {
    serverClient.setApiKey(process.env.APPWRITE_KEY);
  }
}

// Export the server account instance
export const serverAccount = new Account(serverClient);

// Create a new user
export async function createUser(email: string, password: string, name: string, preferences?: Record<string, any>) {
  try {
    // Create user - using the API key authorization
    const user = await serverAccount.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    // If preferences are provided, we'll set them during creation
    if (preferences && Object.keys(preferences).length > 0) {
      try {
        // Store preferences in the database rather than trying to update user prefs
        // (which requires user authentication we don't have yet)
        // We'll handle this after user is created and authenticated
      } catch (prefsError) {
        console.error('Warning: Could not set initial preferences:', prefsError);
        // Continue anyway since the user is created
      }
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update user preferences
export async function updateUserPrefs(prefs: Record<string, any>, userId?: string) {
  try {
    // Update preferences
    return await serverAccount.updatePrefs(prefs);
  } catch (error) {
    console.error('Error updating user prefs:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    // Get user
    return await serverAccount.get(userId);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

// Create JWT token
export function createJwtToken(userId: string) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return sign({ userId }, jwtSecret, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyJwtToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  
  return verify(token, jwtSecret) as { userId: string };
}

// Login user - SERVER SIDE VERSION
// This is only meant to be used in client components, not in API routes
export async function loginUser(email: string, password: string) {
  try {
    console.log("Using server-side login function");
    // Server-side login will NOT work with account.get()
    // We'll just create the session and manually fetch the user data
    
    // Create a session with provided credentials
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vinarstviqr');
    
    const account = new Account(client);
    
    // Create the session - we won't fetch the user here because that requires client-side code
    let session;
    try {
      if (typeof account.createEmailPasswordSession === 'function') {
        session = await account.createEmailPasswordSession(email, password);
      } else {
        session = await account.createEmailSession(email, password);
      }
    } catch (e) {
      console.error("Session creation failed:", e);
      throw e;
    }
    
    // For user data, we'll use our server key to get user information directly
    // This avoids the "missing scope" error in server components
    const userId = session.userId || session.$id;
    const user = await getUserByIdDirect(userId);
    
    // Create a JWT token for our application
    const token = createJwtToken(userId);
    
    return {
      user,
      token,
      session
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

// Get user by ID directly using API key (for server-side use)
async function getUserByIdDirect(userId: string) {
  try {
    // Use the serverAccount directly (has API key authorization)
    const userData = await serverAccount.get(userId);
    return userData;
  } catch (error) {
    console.error('Error getting user by ID directly:', error);
    throw error;
  }
}

// Create a slug from text
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}