"use client";

import { useAuth } from '@/lib/auth-context';
import ProfileForm from '@/components/ProfileForm';
import PasswordChangeForm from '@/components/PasswordChangeForm';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Nastavení
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Správa vašeho účtu a nastavení aplikace.
        </p>
      </div>

      {/* Profile Edit Form */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Úprava profilu vinařství</h2>
              <p className="text-gray-600 mt-1">Upravte základní údaje o vašem vinařství</p>
            </div>
          </div>
          
          <ProfileForm />
        </div>
      </div>

      {/* Password Change */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Změna hesla</h2>
              <p className="text-gray-600 mt-1">Aktualizujte heslo pro váš účet</p>
            </div>
          </div>
          
          <PasswordChangeForm />
        </div>
      </div>

      {/* Features in Development */}
      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 to-orange-50/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-amber-200/60 shadow-2xl">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Funkce v přípravě</h2>
              <p className="text-gray-600 mt-1">Tyto funkce budou brzy k dispozici</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 rounded-2xl"></div>
              <div className="relative bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Export dat</h3>
                    <p className="text-gray-600 mt-1">Tato funkce bude brzy dostupná.</p>
                  </div>
                  <div className="text-sm font-medium text-amber-600 bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-200/50">
                    Připravujeme
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}