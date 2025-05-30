"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';
import { useRouter } from 'next/navigation';

interface PremiumFeatureWrapperProps {
  children: React.ReactNode;
  featureName: string;
}

export default function PremiumFeatureWrapper({ children, featureName }: PremiumFeatureWrapperProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [membershipPlan, setMembershipPlan] = useState<string>('');
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (!token) {
        setHasAccess(false);
        return;
      }

      try {
        const response = await authFetch('/api/membership/status', token);
        if (response.ok) {
          const data = await response.json();
          
          if (data.hasMembership && data.membership) {
            const plan = data.membership.plan;
            setMembershipPlan(plan);
            
            // Analytics and API access only for NEOMEZENĚ and ENTERPRISE
            const isPremium = plan === 'NEOMEZENĚ' || plan === 'ENTERPRISE';
            setHasAccess(isPremium);
          } else {
            setHasAccess(false);
          }
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
        setHasAccess(false);
      }
    };

    checkAccess();
  }, [token]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ověřování přístupu...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-5V7a2 2 0 114 0v4m-4 0V7a2 2 0 114 0v4m-4 0h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
            </svg>
          </div>
          
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Prémiová funkce
          </h1>
          
          <p className="mt-4 text-lg text-gray-600">
            {featureName} je k dispozici pouze pro uživatele s tarifem <strong>NEOMEZENĚ</strong> nebo <strong>ENTERPRISE</strong>.
          </p>
          
          {membershipPlan && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Váš aktuální tarif: {membershipPlan}
            </div>
          )}
          
          <div className="mt-8 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upgrade na prémiový tarif</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900">NEOMEZENĚ</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">6 990 Kč/rok</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Neomezené množství šarží
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Pokročilá analytika</strong>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>API integrace</strong>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vlastní branding
                  </li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900">ENTERPRISE</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">Na dotaz</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vše z NEOMEZENĚ tarifu
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Více vinařství
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Account manager
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    SLA garance
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">
                Pro upgrade kontaktujte náš tým:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:info@etiketa.wine" 
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Kontaktovat email
                </a>
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Zpět na dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}