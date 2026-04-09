"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface MembershipStatus {
  hasMembership: boolean;
  membership?: {
    plan: string;
    wineLimit: number;
    currentWineCount: number;
    expiresAt: string;
    isActive: boolean;
    isExpired: boolean;
  };
  canCreateWines: boolean;
  currentCount: number;
  limit: number;
  yearlyLimit: number;
  yearsSinceStart: number;
  message: string;
}

export default function MembershipStatusWidget() {
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await authFetch('/api/membership/status', token);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching membership status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!status || !status.hasMembership) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Žádné aktivní členství
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Nemáte aktivní členství. Kontaktujte administrátora pro přístup k systému.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { membership } = status;
  const isExpiring = membership && new Date(membership.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const getProgressColor = () => {
    if (!status.canCreateWines) return 'bg-red-500';
    const percentage = status.limit === -1 ? 0 : (status.currentCount / status.limit) * 100;
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressPercentage = () => {
    if (status.limit === -1) return 10; // Show small progress for unlimited
    return Math.min(100, (status.currentCount / status.limit) * 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Stav členství</h3>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          membership?.isActive 
            ? isExpiring 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {membership?.plan || 'Žádné'}
        </span>
      </div>

      {membership && (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Využití vín</span>
              <span>
                {status.currentCount} / {status.limit === -1 ? '∞' : status.limit}
                {status.yearlyLimit > 0 && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({status.yearlyLimit}/rok × {status.yearsSinceStart})
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Platnost do:</span>
              <span className={`font-medium ${isExpiring ? 'text-yellow-600' : 'text-gray-900'}`}>
                {new Date(membership.expiresAt).toLocaleDateString('cs-CZ')}
              </span>
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{status.message}</p>
            </div>

            {isExpiring && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <svg className="h-4 w-4 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Členství brzy vyprší!</p>
                    <p>Kontaktujte nás pro prodloužení na info@etiketa.wine</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
