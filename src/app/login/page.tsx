import Link from 'next/link';
import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';

// Loading fallback for the Suspense boundary
function LoginFormSkeleton() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
      <div className="space-y-4">
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div>
          <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
            Přihlášení
          </h1>
          <p className="mt-2 text-gray-600">
            Přihlaste se ke správě vašich QR kódů pro etikety
          </p>
        </div>
        
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Nemáte účet?{' '}
            <Link 
              href="/register" 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Zaregistrujte se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}