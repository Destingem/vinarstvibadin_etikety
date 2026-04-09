'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
  wineId: string;
}

export default function AnalyticsTracker({ wineId }: AnalyticsTrackerProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !wineId) {
      return;
    }

    const sessionKey = `etiketa-public-scan:${wineId}`;
    const now = Date.now();
    const lastRecordedAt = Number(window.sessionStorage.getItem(sessionKey) || '0');

    if (Number.isFinite(lastRecordedAt) && now - lastRecordedAt < 30000) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, String(now));

    const languageUsed = (navigator.language || 'cs').slice(0, 2).toLowerCase();

    fetch('/api/analytics/record-scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wineId,
        languageUsed,
      }),
      keepalive: true,
    }).catch((error) => {
      window.sessionStorage.removeItem(sessionKey);
      console.error('Error recording public label analytics:', error);
    });
  }, [wineId]);

  return null;
}
