'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { WineInsightsDashboard } from '../components/wine-insights-dashboard';

export default function WineIntelligencePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading state management
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, []);

  const wineryId = (user as any)?.wineryId || user?.id || 'demo';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <WineInsightsDashboard wineryId={wineryId} />
    </div>
  );
}