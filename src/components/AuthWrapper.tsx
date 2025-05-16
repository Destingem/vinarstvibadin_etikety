"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if auth token exists in localStorage
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      // No token, redirect to login
      console.log('No authentication token found, redirecting to login');
      router.push('/login');
      return;
    }
    
    // We have a token, update state
    setAuthenticated(true);
    
    // Add token to default headers for APIs
    const authBearer = `Bearer ${token}`;
    
    // Use an event listener for all fetch requests
    const handleFetch = (event: Event) => {
      const request = (event as unknown as { request: Request }).request;
      if (!request.headers.has('Authorization')) {
        request.headers.set('Authorization', authBearer);
      }
    };
    
    // Register the event listener (if supported by browser)
    if (typeof window !== 'undefined' && window.fetch && 'addEventListener' in window) {
      window.addEventListener('fetch', handleFetch as EventListener);
    }
    
    // Cleanup
    return () => {
      if (typeof window !== 'undefined' && window.fetch && 'removeEventListener' in window) {
        window.removeEventListener('fetch', handleFetch as EventListener);
      }
    };
  }, [router]);

  // Only render children if authenticated
  return authenticated ? <>{children}</> : null;
}