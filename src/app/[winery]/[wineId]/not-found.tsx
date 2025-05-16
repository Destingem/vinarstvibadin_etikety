import Link from 'next/link';

export default function WineNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-6">Víno nenalezeno</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Omlouváme se, ale požadované víno se nepodařilo najít. Je možné, že bylo odstraněno nebo je zadána nesprávná URL adresa.
        </p>
        <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition">
          Zpět na hlavní stránku
        </Link>
      </div>
    </div>
  );
}