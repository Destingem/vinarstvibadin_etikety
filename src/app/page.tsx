import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">VinařstvíQR</h1>
            <nav className="space-x-4">
              <Link 
                href="/register" 
                className="text-white hover:text-indigo-200 transition"
              >
                Registrace
              </Link>
              <Link 
                href="/login" 
                className="bg-white text-indigo-700 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition"
              >
                Přihlášení
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <h2 className="text-4xl font-bold mb-6">QR kódy pro vinařství</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jednoduchý a efektivní způsob, jak splnit legislativní požadavky 
            pro označování vín QR kódy s výživovými údaji a složením.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-16 mb-16">
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4">Proč používat naši službu?</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Splníte legislativní požadavky pro označování vín QR kódy</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Jednoduchá správa všech vašich vín a jejich údajů</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Profesionální vzhled stránek s údaji o víně</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Snadné generování QR kódů pro tisk na etikety</span>
              </li>
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full max-w-md">
              <div className="mb-4 bg-white p-4 rounded border border-gray-200">
                <div className="w-64 h-64 mx-auto bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Ukázka QR kódu</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold">Výživové údaje (na 100 ml)</h4>
                <div className="flex justify-between">
                  <span>Energetická hodnota</span>
                  <span>310 kJ / 74 kcal</span>
                </div>
                <div className="flex justify-between">
                  <span>Tuky</span>
                  <span>0 g</span>
                </div>
                <div className="flex justify-between">
                  <span>Sacharidy</span>
                  <span>3.7 g</span>
                </div>
                <div className="flex justify-between">
                  <span>Bílkoviny</span>
                  <span>0.2 g</span>
                </div>
                <div className="flex justify-between">
                  <span>Sůl</span>
                  <span>0 g</span>
                </div>
                <h4 className="font-bold mt-4">Složení</h4>
                <p className="text-sm">
                  Hrozny, antioxidant: oxid siřičitý
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center mb-16">
          <h3 className="text-2xl font-bold mb-6">Jak to funguje?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="bg-indigo-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 text-xl font-bold">1</span>
              </div>
              <h4 className="font-bold mb-2">Registrujte se</h4>
              <p className="text-gray-600">
                Vytvořte si účet pro vaše vinařství
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="bg-indigo-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 text-xl font-bold">2</span>
              </div>
              <h4 className="font-bold mb-2">Zadejte údaje o víně</h4>
              <p className="text-gray-600">
                Vyplňte výživové údaje a další informace
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="bg-indigo-100 w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 text-xl font-bold">3</span>
              </div>
              <h4 className="font-bold mb-2">Stáhněte QR kód</h4>
              <p className="text-gray-600">
                Umístěte vygenerovaný QR kód na etiketu
              </p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h3 className="text-2xl font-bold mb-6">Začněte ještě dnes</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition"
            >
              Registrovat vinařství
            </Link>
            <Link 
              href="/login" 
              className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-indigo-50 transition"
            >
              Přihlásit se
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">VinařstvíQR</h3>
              <p className="mb-4">
                Pomáháme vinařům splnit legislativní požadavky pro označování vín QR kódy s výživovými údaji a složením.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Kontakt</h4>
              <p>Email: info@vinarstviqr.cz</p>
              <p>Telefon: +420 123 456 789</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} VinařstvíQR. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}