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
  const headers = options.headers || {};
  const updatedHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  if (token && token !== 'session') {
    updatedHeaders.Authorization = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    credentials: 'same-origin',
    headers: updatedHeaders,
  });
}
