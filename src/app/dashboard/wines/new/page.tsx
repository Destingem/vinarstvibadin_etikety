"use client";

import WineForm from '@/components/WineForm';
import { useAuth } from '@/lib/auth-context';

export default function NewWinePage() {
  // WineForm already has the useAuth hook for authentication
  // In this simpler page, we don't need to handle loading states etc.
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Přidat nové víno</h1>
          <p className="mt-2 text-sm text-gray-700">
            Vyplňte informace o novém víně, které chcete přidat do systému.
          </p>
        </div>
      </div>
      
      <WineForm />
    </div>
  );
}