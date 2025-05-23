import Link from 'next/link';
import RegisterForm from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <Link 
            href="/" 
            className="text-2xl font-bold text-indigo-600 hover:text-indigo-500"
          >
            VinařstvíQR
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Registrace nového vinařství
          </h1>
          <p className="mt-2 text-gray-600">
            Vytvořte si účet pro správu vašich QR kódů pro etikety
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Již máte účet?{' '}
            <Link 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Přihlaste se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}