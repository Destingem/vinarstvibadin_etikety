'use client';

import { useEffect } from 'react';

/**
 * Props for the AnalyticsTracker component
 */
interface AnalyticsTrackerProps {
  wineId: string;
  wineName: string;
  wineryId: string;
  wineryName: string;
  winerySlug: string;
  wineBatch?: string;
  wineVintage?: number;
}

/**
 * Client-side component that records analytics data when a wine page is viewed
 * This component doesn't render anything visible
 */
export default function AnalyticsTracker({
  wineId,
  wineName,
  wineryId,
  wineryName,
  winerySlug,
  wineBatch,
  wineVintage
}: AnalyticsTrackerProps) {
  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    // Detect the user's language preference
    const languageUsed = navigator.language || 'cs';

    // Prepare the data to send
    const data = {
      wineId,
      wineName, 
      wineryId,
      wineryName,
      winerySlug,
      wineBatch,
      wineVintage,
      languageUsed
    };

    // Record the scan event
    fetch('/api/analytics/record-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      // Use keepalive to ensure the request completes even if the user navigates away
      keepalive: true
    }).catch(err => {
      // Silently fail - analytics should not impact user experience
      console.error('Error recording analytics:', err);
    });

    // We don't want to re-run this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This component doesn't render anything
  return null;
}