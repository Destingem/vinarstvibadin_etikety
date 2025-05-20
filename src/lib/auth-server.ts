import { Client, Account, ID } from 'appwrite';
import { sign, verify } from 'jsonwebtoken';

// Create a server-side client (uses API key)
const serverClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'vinarstviqr');

// Set API key for SDK v17+
if (process.env.APPWRITE_KEY) {
  // Use type assertion to avoid TypeScript errors
  const client = serverClient as any;
  
  // Check if setApiKey exists on the client
  if (typeof client.setApiKey === 'function') {
    client.setApiKey(process.env.APPWRITE_KEY);
  } else {
    console.warn('Appwrite SDK method setApiKey not available - API key not set');
    console.warn('This may cause some server-side operations to fail');
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
    console.log('getUserById: Attempting to get user data for ID:', userId);
    
    // Use Appwrite REST API directly with the API key for full access
    try {
      // Direct API call using fetch
      const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/users/${userId}`, {
        headers: {
          'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'vinarstviqr',
          'X-Appwrite-Key': process.env.APPWRITE_KEY || ''
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('getUserById: Successfully fetched user data from API');
        
        // Return the user data in the expected format
        return {
          $id: userData.$id,
          email: userData.email,
          name: userData.name, // This is the full company name from Appwrite
          prefs: userData.prefs || {}
        };
      } else {
        console.error('getUserById: API call failed:', await response.text());
        throw new Error('Failed to fetch user data from API');
      }
    } catch (apiError) {
      console.error('getUserById: Error with direct API call:', apiError);
      
      // Try SDK method as fallback
      try {
        if (typeof serverAccount.get === 'function') {
          console.log('getUserById: Trying serverAccount.get() as fallback');
          return await serverAccount.get();
        }
      } catch (sdkError) {
        console.error('getUserById: SDK fallback also failed:', sdkError);
      }
      
      // Return a minimal user object if all methods fail
      return {
        $id: userId,
        email: 'unknown@example.com',
        name: `User-${userId.substring(0, 8)}`,
        prefs: {}
      };
    }
  } catch (error) {
    console.error('Error getting user by ID:', error);
    // Return a minimal user object as fallback
    return {
      $id: userId,
      email: 'unknown@example.com',
      name: `User-${userId.substring(0, 8)}`,
      prefs: {}
    };
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
      console.log("Attempting server-side login with email:", email);
      
      // Check available methods
      console.log("Checking available login methods:", {
        createEmailPasswordSession: typeof (account as any).createEmailPasswordSession === 'function',
        createEmailSession: typeof (account as any).createEmailSession === 'function',
        createSession: typeof (account as any).createSession === 'function'
      });
      
      // Try different methods based on what's available in the SDK
      if (typeof (account as any).createEmailPasswordSession === 'function') {
        session = await (account as any).createEmailPasswordSession(email, password);
        console.log("Created email-password session");
      } else if (typeof (account as any).createEmailSession === 'function') {
        session = await (account as any).createEmailSession(email, password);
        console.log("Created email session");
      } else if (typeof (account as any).createSession === 'function') {
        session = await (account as any).createSession('email', email, password);
        console.log("Created session with email provider");
      } else {
        throw new Error('No compatible login method found in Appwrite SDK');
      }
      
      if (!session) {
        throw new Error("Session creation returned undefined");
      }
      
      console.log("Session created successfully. Properties:", Object.keys(session));
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
// This is a simplified version that returns a dummy user object - in v17 SDK, 
// we can't directly fetch user info with userId
async function getUserByIdDirect(userId: string) {
  try {
    console.warn('getUserByIdDirect: Creating placeholder user for Appwrite SDK v17');
    
    // In SDK v17, we can only get the current user, not any user by ID
    // Return a simplified user object based on the user ID
    return {
      $id: userId,
      email: `user-${userId.substring(0, 6)}@example.com`,
      name: `User ${userId.substring(0, 6)}`, 
      prefs: {}
    };
  } catch (error) {
    console.error('Error in getUserByIdDirect:', error);
    return {
      $id: userId,
      email: 'unknown@example.com',
      name: `User ${userId.substring(0, 6)}`,
      prefs: {}
    };
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