import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Ambient Background */}
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
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Vítejte v aplikaci
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Moderní správa QR kódů pro vaše víno
            </p>
          </div>

          <div className="space-y-6">
            {/* Demo Account Banner */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              
              <div className="relative bg-gradient-to-br from-red-600/95 via-red-700/95 to-red-800/95 backdrop-blur-xl p-8 rounded-3xl border border-red-200/30 shadow-2xl">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-2xl">🚀</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Vyzkoušejte demo</h3>
                    <p className="text-red-50/90 text-base mb-6">
                      Prohlédněte si všechny funkce bez registrace
                    </p>
                    <Link href="/login?demo=true" className="w-full bg-white/15 backdrop-blur-sm text-white border border-white/30 py-3.5 px-6 rounded-2xl font-medium hover:bg-white/25 transition-all duration-300 group/btn block">
                      <span className="flex items-center justify-center space-x-2">
                        <span>Spustit demo účet</span>
                        <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/60 rounded-3xl"></div>
              <div className="relative bg-white/80 backdrop-blur-2xl p-8 rounded-3xl border border-gray-200/60 shadow-2xl">
                <div className="space-y-4">
                  <Link 
                    href="/register"
                    className="group relative block w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:from-red-500 hover:to-red-600 shadow-lg hover:shadow-red-500/30"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Registrovat se</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                  <Link 
                    href="/login"
                    className="group block w-full bg-gray-50 backdrop-blur-sm text-gray-700 py-4 px-6 rounded-2xl font-medium hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Už mám účet</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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