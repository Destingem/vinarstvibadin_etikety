import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

// Loading fallback for the Suspense boundary
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl animate-pulse">
          <div className="h-8 bg-gray-200 rounded-xl w-1/2 mx-auto mb-8"></div>
          <div className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-2xl w-full mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Ambient Background - Same as main page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
        
        {/* Floating red orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-red-100/60 to-red-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-l from-red-200/50 to-red-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-2/3 left-2/3 w-64 h-64 bg-gradient-to-br from-red-150/40 to-red-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.1) 1px, transparent 0)`,
               backgroundSize: '50px 50px'
             }}>
        </div>
        
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }}>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20 backdrop-blur-xl border-b border-red-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
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
            <div className="text-sm text-gray-600">
              <span>powered by</span>
              <a 
                href="https://vinokod.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
              >
                vinokod.cz
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header Text */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Přihlášení
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Přihlaste se ke správě vašich QR kódů
            </p>
          </div>

          {/* Login Form */}
          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Nemáte účet?{' '}
              <Link 
                href="/register" 
                className="text-red-600 hover:text-red-700 font-medium transition-colors duration-300"
              >
                Zaregistrujte se
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 backdrop-blur-xl border-t border-gray-200/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <span>&copy; {new Date().getFullYear()} etiketa.wine</span>
            <span className="mx-3 text-gray-400">•</span>
            <a 
              href="https://vinokod.cz" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-red-600 hover:text-red-700 transition-colors duration-300 font-medium"
            >
              Více na vinokod.cz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}