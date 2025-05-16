"use client";

/**
 * Helper function for making authenticated API requests
 * Automatically adds the auth token to the request
 * 
 * NOTE: For this to work in client components, you should use this pattern:
 * 
 * const { token } = useAuth();
 * 
 * const fetchData = async () => {
 *   if (!token) return;
 *   const data = await authFetch('/api/some-endpoint', token);
 *   // Do something with data
 * };
 */
export async function authFetch(
  url: string,
  token: string | null,
  options: RequestInit = {}
): Promise<Response> {
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  // Create headers if they don't exist
  const headers = options.headers || {};
  
  // Add Authorization header with token
  // Use type assertion to allow string indexing
  const updatedHeaders: Record<string, string> = {
    ...headers as Record<string, string>,
    'Authorization': `Bearer ${token}`
  };
  
  // Add user data if available (from localStorage)
  try {
    const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user) {
        // Format the user's name to look better (capitalize first letters, handle dots)
        let displayName = user.name;
        
        // If the name has dots (like "ondrej.zaplatilek"), format it to look better
        if (displayName.includes('.')) {
          displayName = displayName.split('.')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        } else if (displayName.includes('-')) {
          // If the name has hyphens, also format it to look better
          displayName = displayName.split('-')
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
        }
        
        // Add user data header for API use with formatted name
        updatedHeaders['X-User-Data'] = JSON.stringify({
          name: displayName, // Use formatted name
          id: user.id,
          email: user.email,
          // Use existing slug or create from original name
          slug: user.slug || user.name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        });
      }
    }
  } catch (e) {
    console.error('Error adding user data to headers:', e);
  }
  
  // Return fetch with updated headers
  return fetch(url, {
    ...options,
    headers: updatedHeaders
  });
}