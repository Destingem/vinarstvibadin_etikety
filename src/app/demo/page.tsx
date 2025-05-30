"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DemoStatus {
  exists: boolean;
  userId?: string;
  email?: string;
  lastReset?: string;
  hoursSinceReset?: number;
  needsReset?: boolean;
}

export default function DemoPage() {
  const [demoStatus, setDemoStatus] = useState<DemoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const DEMO_CREDENTIALS = {
    email: 'demo@etiketa.wine',
    password: 'demo123456'
  };

  useEffect(() => {
    fetchDemoStatus();
  }, []);

  const fetchDemoStatus = async () => {
    try {
      const response = await fetch('/api/demo/reset');
      if (response.ok) {
        const data = await response.json();
        setDemoStatus(data);
      }
    } catch (error) {
      console.error('Error fetching demo status:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDemoAccount = async () => {
    try {
      setResetting(true);
      const response = await fetch('/api/demo/reset', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Demo účet byl úspěšně resetován!');
        await fetchDemoStatus();
      } else {
        alert('Chyba při resetování demo účtu');
      }
    } catch (error) {
      console.error('Error resetting demo account:', error);
      alert('Chyba při resetování demo účtu');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Načítání...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo účet - etiketa.wine
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vyzkoušejte si všechny funkce aplikace pro generování QR etiket na vína s našim demo účtem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Credentials */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Přihlašovací údaje
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded border text-sm">
                    {DEMO_CREDENTIALS.email}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(DEMO_CREDENTIALS.email)}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                  >
                    Kopírovat
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heslo
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded border text-sm">
                    {DEMO_CREDENTIALS.password}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(DEMO_CREDENTIALS.password)}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                  >
                    Kopírovat
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors inline-block text-center"
                >
                  Přihlásit se do demo účtu
                </Link>
              </div>
            </div>
          </div>

          {/* Demo Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Stav demo účtu
            </h2>
            {demoStatus ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Stav:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    demoStatus.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {demoStatus.exists ? 'Aktivní' : 'Neexistuje'}
                  </span>
                </div>
                
                {demoStatus.exists && (
                  <>
                    {demoStatus.lastReset && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Poslední reset:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(demoStatus.lastReset).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                    )}
                    
                    {demoStatus.hoursSinceReset !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Hodin od resetu:</span>
                        <span className="text-sm text-gray-900">
                          {demoStatus.hoursSinceReset.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Potřeba reset:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        demoStatus.needsReset ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {demoStatus.needsReset ? 'Ano' : 'Ne'}
                      </span>
                    </div>
                  </>
                )}
                
                <div className="pt-4">
                  <button
                    onClick={resetDemoAccount}
                    disabled={resetting}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetting ? 'Resetuji...' : 'Resetovat demo účet'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nepodařilo se načíst stav demo účtu</p>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Co můžete vyzkoušet s demo účtem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Vytváření vín</h3>
                <p className="text-sm text-gray-600">Neomezené vytváření záznamů vín</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">QR etikety</h3>
                <p className="text-sm text-gray-600">Generování QR kódů v souladu s EU</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Analytika</h3>
                <p className="text-sm text-gray-600">Pokročilé sledování skenování</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">API integrace</h3>
                <p className="text-sm text-gray-600">Testování API endpoint</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Vlastní branding</h3>
                <p className="text-sm text-gray-600">Přizpůsobení vzhledu etiket</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Export/Import</h3>
                <p className="text-sm text-gray-600">Správa dat vín a exporty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Upozornění:</strong> Demo účet se automaticky resetuje každou hodinu. 
                Všechna data vytvořená v demo účtu budou smazána při resetu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}