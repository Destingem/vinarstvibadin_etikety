"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/api-helpers';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

// Check if user is admin
const ADMIN_EMAILS = [
  'admin@etiketa.wine',
  'ondrej.zaplatilek@gmail.com',
  'ondrej.zaplatilek@bytedev.cz'
];

// Main navigation items - now always show all tabs
const getNavigation = (isAdmin: boolean, userPlan?: string): NavItem[] => {
  const baseNavigation: NavItem[] = [
    {
      name: 'Přehled',
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Vína',
      href: '/dashboard/wines',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'QR kódy',
      href: '/dashboard/qrcodes',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      name: 'Analytika',
      href: '/dashboard/analytics',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'API přístup',
      href: '/dashboard/api',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Nastavení',
      href: '/dashboard/settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    }
  ];

  if (isAdmin) {
    baseNavigation.push({
      name: 'Admin',
      href: '/dashboard/admin',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    });
  }

  return baseNavigation;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isDemo } = useAuth();
  
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const navigation = getNavigation(isAdmin);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-100/60 to-red-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-l from-red-200/50 to-red-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-gradient-to-br from-red-150/40 to-red-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Off-canvas menu backdrop */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={() => setIsMobileMenuOpen(false)}></div>
          )}

          {/* Off-canvas menu */}
          <div className={`relative flex-1 flex flex-col max-w-xs w-full transition-transform transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="relative bg-white/90 backdrop-blur-xl border-r border-gray-200/50 h-full">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="sr-only">Zavřít menu</span>
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-shrink-0 flex items-center px-6 py-6">
                <Link href="/dashboard" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl blur-sm opacity-75"></div>
                    <div className="relative w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-2xl">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    etiketa.wine
                  </h1>
                </Link>
              </div>
              
              <div className="mt-2 flex-1 h-0 overflow-y-auto px-4">
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${
                        pathname === item.href
                          ? 'bg-red-50/80 text-red-700 border-red-200/50'
                          : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 border-transparent'
                      } group flex items-center px-3 py-3 text-base font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border`}
                    >
                      <div className={`${
                        pathname === item.href
                          ? 'text-red-600'
                          : 'text-gray-500 group-hover:text-gray-700'
                      } mr-4 transition-colors duration-200`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-40">
        <div className="flex flex-col flex-grow bg-white/60 backdrop-blur-xl border-r border-gray-200/50 pt-6 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-6 mb-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl blur-sm opacity-75"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                etiketa.wine
              </h1>
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col px-4">
            <nav className="flex-1 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-red-50/80 text-red-700 border-red-200/50 shadow-sm'
                      : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 border-transparent hover:shadow-sm'
                  } group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-200 backdrop-blur-sm border`}
                >
                  <div className={`${
                    pathname === item.href
                      ? 'text-red-600'
                      : 'text-gray-500 group-hover:text-gray-700'
                  } mr-3 flex-shrink-0 transition-colors duration-200`}>
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 flex flex-col flex-1 relative z-10">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 flex-shrink-0 flex h-16 bg-white/70 backdrop-blur-xl border-b border-gray-200/50">
          <button
            type="button"
            className="px-4 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500/50 lg:hidden transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Otevřít menu</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              {/* Placeholder for search */}
            </div>
            <div className="ml-4 flex items-center space-x-4">
              {/* Demo account indicator */}
              {isDemo && (
                <div className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full border border-orange-200">
                  DEMO ÚČET
                </div>
              )}
              {/* Profile section */}
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-gray-700">
                  {user?.name || ''}
                </div>
                <button 
                  onClick={logout}
                  className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/80 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  Odhlásit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1">
          <div className="py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}