import Link from 'next/link';

export default function NotFound() {
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

      <header className="relative z-20 backdrop-blur-xl border-b border-red-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-xl blur-sm opacity-75"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-2xl">
                    <span className="text-white font-bold text-lg">E</span>
                  </div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  etiketa.wine
                </h1>
              </div>
              <div className="hidden sm:flex items-center text-sm text-gray-600">
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
            <nav className="flex items-center space-x-3">
              <Link 
                href="/register" 
                className="text-gray-700 hover:text-gray-900 transition-colors duration-300 px-4 py-2 rounded-xl hover:bg-gray-100/70 backdrop-blur-sm"
              >
                Registrace
              </Link>
              <Link 
                href="/login" 
                className="relative group bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/25"
              >
                <span className="relative z-10">Přihlášení</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="text-center">
            {/* 404 Card */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl sm:rounded-4xl"></div>
              <div className="relative bg-white/80 backdrop-blur-2xl p-8 sm:p-12 lg:p-16 rounded-3xl sm:rounded-4xl border border-gray-200/60 shadow-2xl">
                
                {/* 404 Number with wine bottle icon */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-sm opacity-20"></div>
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-2xl mr-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 2l2 2v16l-2 2h8l2-2V4l-2-2H6zm2 2h4v16H8V4zm0 2v2h4V6H8zm0 4v2h4v-2H8z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-6xl sm:text-8xl lg:text-9xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    404
                  </div>
                </div>

                {/* Main heading */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                  Stránka nenalezena
                </h1>

                {/* Description */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mx-auto mb-8">
                  Omlouváme se, ale požadovaná stránka se nepodařila najít. Je možné, že byla odstraněna, přesunuta nebo je zadána nesprávná URL adresa.
                </p>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href="/"
                    className="relative group w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/25"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Zpět na hlavní stránku
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  
                  <Link 
                    href="/dashboard"
                    className="w-full sm:w-auto text-gray-700 hover:text-gray-900 transition-colors duration-300 px-8 py-4 rounded-2xl hover:bg-gray-100/70 backdrop-blur-sm border border-gray-200/60 font-semibold flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </Link>
                </div>

                {/* Additional helpful links */}
                <div className="mt-8 pt-8 border-t border-gray-200/50">
                  <p className="text-sm text-gray-500 mb-4">Možná hledáte:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link href="/dashboard/wines" className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50/70 transition-colors duration-300">
                      Vaše vína
                    </Link>
                    <Link href="/dashboard/qrcodes" className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50/70 transition-colors duration-300">
                      QR kódy
                    </Link>
                    <Link href="/dashboard/analytics" className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50/70 transition-colors duration-300">
                      Analytika
                    </Link>
                    <Link href="/dashboard/settings" className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50/70 transition-colors duration-300">
                      Nastavení
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}